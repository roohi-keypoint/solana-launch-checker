import { createLogger } from '../logger'

describe('Logger', () => {
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  let mockConsoleLog: jest.Mock
  let mockConsoleError: jest.Mock
  let mockConsoleWarn: jest.Mock
  
  beforeEach(() => {
    mockConsoleLog = jest.fn()
    mockConsoleError = jest.fn()
    mockConsoleWarn = jest.fn()
    
    console.log = mockConsoleLog
    console.error = mockConsoleError
    console.warn = mockConsoleWarn
  })
  
  afterEach(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })
  
  describe('createLogger', () => {
    it('should create a logger with disabled log when verbose is false', () => {
      const logger = createLogger({ verbose: false })
      
      logger.log('test message')
      logger.error('error message')
      logger.warn('warning message')
      
      expect(mockConsoleLog).not.toHaveBeenCalled()
      expect(mockConsoleError).toHaveBeenCalledWith('error message')
      expect(mockConsoleWarn).toHaveBeenCalledWith('warning message')
    })
    
    it('should create a logger with enabled log when verbose is true', () => {
      const logger = createLogger({ verbose: true })
      
      logger.log('test message')
      logger.error('error message')
      logger.warn('warning message')
      
      expect(mockConsoleLog).toHaveBeenCalledWith('test message')
      expect(mockConsoleError).toHaveBeenCalledWith('error message')
      expect(mockConsoleWarn).toHaveBeenCalledWith('warning message')
    })
    
    it('should create a logger with disabled log by default', () => {
      const logger = createLogger()
      
      logger.log('test message')
      
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })
    
    it('should handle objects and other types correctly', () => {
      const logger = createLogger({ verbose: true })
      const testObj = { key: 'value' }
      const testArray = [1, 2, 3]
      
      logger.log(testObj as any)
      logger.error(testArray as any)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(testObj)
      expect(mockConsoleError).toHaveBeenCalledWith(testArray)
    })
  })
})
