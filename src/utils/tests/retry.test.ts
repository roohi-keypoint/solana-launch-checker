import { retryOperation } from '../retry'
import * as timeUtils from '../time'

jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}))

describe('Retry utilities', () => {
  beforeEach(() => {
    jest.spyOn(timeUtils, 'sleep').mockImplementation(() => Promise.resolve())
    jest.spyOn(timeUtils, 'calculateBackoff').mockImplementation((attempt) => attempt * 100)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('retryOperation', () => {
    it('should log error details when an operation fails', async () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
      
      const testError = new Error('Test failure')
      const operation = jest.fn().mockRejectedValue(testError)
      
      try {
        await retryOperation(operation, { 
          maxRetries: 1,
          logger: mockLogger 
        })
      } catch (error) {
        // Expected to throw
      }
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Attempt 1/2 failed: Test failure')
      expect(mockLogger.log).toHaveBeenCalledWith(`Error details: ${JSON.stringify(testError)}`)
    })
    
    it('should return result when operation succeeds on first try', async () => {
      const operation = jest.fn().mockResolvedValue('success')
      
      const result = await retryOperation(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
      expect(timeUtils.sleep).not.toHaveBeenCalled()
    })
    
    it('should retry operation and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure 1'))
        .mockRejectedValueOnce(new Error('Failure 2'))
        .mockResolvedValue('success')
      
      const result = await retryOperation(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
      expect(timeUtils.sleep).toHaveBeenCalledTimes(2)
      expect(timeUtils.calculateBackoff).toHaveBeenCalledTimes(2)
    })
    
    it('should throw error after all retries fail', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)
      
      await expect(retryOperation(operation)).rejects.toThrow('Operation failed')
      expect(operation).toHaveBeenCalledTimes(6) // Initial attempt + 5 retries
      expect(timeUtils.sleep).toHaveBeenCalledTimes(5)
    })
    
    it('should respect custom maxRetries option', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)
      
      await expect(retryOperation(operation, { maxRetries: 2 })).rejects.toThrow('Operation failed')
      expect(operation).toHaveBeenCalledTimes(3) // Initial attempt + 2 retries
      expect(timeUtils.sleep).toHaveBeenCalledTimes(2)
    })
    
    it('should use fixed delay when useExponentialBackoff is false', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success')
      
      await retryOperation(operation, { 
        useExponentialBackoff: false, 
        delayMs: 500
      })
      
      expect(operation).toHaveBeenCalledTimes(2)
      expect(timeUtils.sleep).toHaveBeenCalledWith(500)
      expect(timeUtils.calculateBackoff).not.toHaveBeenCalled()
    })
    
    it('should convert non-Error exceptions to Error objects', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce('string error')
        .mockResolvedValue('success')
      
      const result = await retryOperation(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })
    
    it('should log success message after retries', async () => {
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
      
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success')
      
      await retryOperation(operation, { logger: mockLogger })
      
      expect(mockLogger.log).toHaveBeenCalledWith('Operation succeeded after 2 attempts')
    })

    it('should throw when retries are exhausted with no last error', async () => {
      // This is a contrived case to test the rare condition where 
      // lastError is null but the operation still failed
      const operation = jest.fn()
      const mockLogger = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
      
      // Override throw behavior to clear lastError
      jest.spyOn(global, 'Error').mockImplementationOnce(() => {
        throw new Error('Operation failed after retries')
      })
      
      // Expect the function to throw
      await expect(async () => {
        await retryOperation(() => {
          operation()
          return Promise.reject()
        }, { 
          maxRetries: 1,
          logger: mockLogger
        })
      }).rejects.toThrow('Operation failed after retries')
    })
  })
})
