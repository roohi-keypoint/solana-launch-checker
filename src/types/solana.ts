export type SolanaConnectionOptions = {
  apiKey?: string
  commitment?: 'confirmed' | 'finalized' | 'processed'
  maxRetries?: number
  maxSignaturesPerRequest?: number
  delayBetweenRequests?: number
}
