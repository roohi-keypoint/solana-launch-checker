import { noop } from './common'
import { Logger, LoggerOptions } from '../types/utils'

export const createLogger = ({ verbose = false }: LoggerOptions = {}): Logger => ({
  log: verbose ? console.log : noop,
  error: console.error,
  warn: console.warn
})
