import { performance } from 'perf_hooks'

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

export const calculateBackoff = (attempt: number, baseMs = 500, maxMs = 10000): number => 
  Math.min(2 ** attempt * baseMs, maxMs)
