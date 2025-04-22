import { noop } from './common'

type LoggerOptions = {
  verbose?: boolean
}

export interface Logger {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
}

export const createLogger = ({ verbose = false }: LoggerOptions = {}): Logger => ({
  log: verbose ? console.log : noop,
  error: console.error,
  warn: console.warn
})
