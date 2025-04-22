import { getHeliusApiKey } from '../../src/utils/env'

describe('Environment utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getHeliusApiKey', () => {
    it('should return the HELIUS_API_KEY from environment variables', () => {
      const testApiKey = 'test-api-key-123'
      process.env.HELIUS_API_KEY = testApiKey
      
      const result = getHeliusApiKey()
      
      expect(result).toBe(testApiKey)
    })

    it('should return empty string when HELIUS_API_KEY is not set', () => {
      delete process.env.HELIUS_API_KEY
      
      const result = getHeliusApiKey()
      
      expect(result).toBe('')
    })
  })
})
