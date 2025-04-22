import { sleep, calculateBackoff } from '../../src/utils/time'

describe('Time utilities', () => {
  describe('sleep', () => {
    it('should resolve after the specified time', async () => {
      const startTime = Date.now()
      const sleepTime = 100
      await sleep(sleepTime)
      const endTime = Date.now()
      const elapsedTime = endTime - startTime
      
      expect(elapsedTime).toBeGreaterThanOrEqual(sleepTime)
    })
  })

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff with default parameters', () => {
      expect(calculateBackoff(0)).toBe(500)
      expect(calculateBackoff(1)).toBe(1000)
      expect(calculateBackoff(2)).toBe(2000) 
      expect(calculateBackoff(3)).toBe(4000)
      expect(calculateBackoff(4)).toBe(8000)
      expect(calculateBackoff(5)).toBe(10000) // Capped at maxMs (10000)
      expect(calculateBackoff(6)).toBe(10000) // Still capped at maxMs
    })

    it('should calculate exponential backoff with custom base', () => {
      const baseMs = 100
      expect(calculateBackoff(0, baseMs)).toBe(100)
      expect(calculateBackoff(1, baseMs)).toBe(200)
      expect(calculateBackoff(2, baseMs)).toBe(400)
      expect(calculateBackoff(3, baseMs)).toBe(800)
      expect(calculateBackoff(4, baseMs)).toBe(1600)
      expect(calculateBackoff(5, baseMs)).toBe(3200)
    })

    it('should respect custom max value', () => {
      const baseMs = 100
      const maxMs = 1000
      expect(calculateBackoff(0, baseMs, maxMs)).toBe(100)
      expect(calculateBackoff(1, baseMs, maxMs)).toBe(200)
      expect(calculateBackoff(2, baseMs, maxMs)).toBe(400)
      expect(calculateBackoff(3, baseMs, maxMs)).toBe(800)
      expect(calculateBackoff(4, baseMs, maxMs)).toBe(1000) // Capped at maxMs (1000)
      expect(calculateBackoff(5, baseMs, maxMs)).toBe(1000) // Still capped
    })

    it('should handle negative attempts', () => {
      expect(calculateBackoff(-1)).toBe(250) // 2^(-1) * 500 = 250
      expect(calculateBackoff(-2)).toBe(125) // 2^(-2) * 500 = 125
    })

    it('should handle zero baseMs', () => {
      expect(calculateBackoff(0, 0)).toBe(0)
      expect(calculateBackoff(5, 0)).toBe(0)
    })
  })
})
