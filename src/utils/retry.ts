import { sleep, calculateBackoff } from './time'
import { Logger, createLogger } from './logger'

export type RetryOptions = {
  maxRetries?: number
  delayMs?: number
  useExponentialBackoff?: boolean
  verbose?: boolean
  logger?: Logger
}

export const retryOperation = async <T>(
  operation: () => Promise<T>, 
  options: RetryOptions = {}
): Promise<T> => {
  const { 
    maxRetries = 5,
    delayMs = 1000,
    useExponentialBackoff = true,
    verbose = false,
    logger = createLogger({ verbose })
  } = options
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`Executing operation, attempt ${attempt + 1}/${maxRetries + 1}`)
      
      if (attempt > 0) {
        const waitTime = useExponentialBackoff 
          ? calculateBackoff(attempt) 
          : delayMs
          
        logger.log(`Backing off for ${waitTime}ms before retry`)
        await sleep(waitTime)
      }
      
      const result = await operation()
      if (attempt > 0) logger.log(`Operation succeeded after ${attempt + 1} attempts`)
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      logger.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`)
      logger.log(`Error details: ${JSON.stringify(lastError)}`)
    }
  }
  
  throw lastError || new Error('Operation failed after retries')
}
