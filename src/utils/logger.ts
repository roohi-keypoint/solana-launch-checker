import { Logger, LoggerOptions } from '../types/utils'

const noop = () => {}

export const createLogger = ({ verbose = false }: LoggerOptions = {}): Logger => ({
  log: verbose ? console.log : noop,
  error: console.error,
  warn: console.warn
})
