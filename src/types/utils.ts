export type LoggerOptions = {
  verbose?: boolean
}

export interface Logger {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
}

export type RetryOptions = {
  maxRetries?: number
  delayMs?: number
  useExponentialBackoff?: boolean
  verbose?: boolean
  logger?: Logger
}
