import { sleep, calculateBackoff } from './time'

export type RetryOptions = {
  maxRetries?: number
  delayMs?: number
  useExponentialBackoff?: boolean
}

export const retryOperation = async <T>(
  operation: () => Promise<T>, 
  options: RetryOptions = {}
): Promise<T> => {
  const { 
    maxRetries = 5,
    delayMs = 1000,
    useExponentialBackoff = true
  } = options
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = useExponentialBackoff 
          ? calculateBackoff(attempt) 
          : delayMs
          
        await sleep(waitTime)
      }
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`)
    }
  }
  
  throw lastError || new Error('Operation failed after retries')
}
