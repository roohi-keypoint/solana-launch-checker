import { Connection, PublicKey } from '@solana/web3.js'
import { getHeliusApiKey } from '../utils/env'
import { sleep } from '../utils/time'
import { retryOperation, RetryOptions } from '../utils/retry'
import { SolanaConnectionOptions } from '../types/solana'

export class SolanaClient {
  private readonly connection: Connection
  private readonly MAX_SIGNATURES_LIMIT: number
  private readonly DELAY_BETWEEN_REQUESTS: number
  private readonly retryOptions: RetryOptions

  constructor({
    apiKey = getHeliusApiKey(), 
    commitment = 'confirmed',
    maxRetries = 5,
    maxSignaturesPerRequest = 1000,
    delayBetweenRequests = 100
  }: SolanaConnectionOptions = {}) {
    const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
    this.connection = new Connection(heliusUrl, commitment)
    this.MAX_SIGNATURES_LIMIT = maxSignaturesPerRequest
    this.DELAY_BETWEEN_REQUESTS = delayBetweenRequests
    this.retryOptions = { maxRetries, delayMs: delayBetweenRequests }
  }

  async getOldestSignature(address: string): Promise<string | undefined> {
    let oldestSignature: string | undefined
    const pubkey = new PublicKey(address)

    try {
      for (;;) {
        const signatures = await retryOperation(async () => {
          const result = await this.connection.getSignaturesForAddress(pubkey, {
            limit: this.MAX_SIGNATURES_LIMIT,
            before: oldestSignature
          })
          await sleep(this.DELAY_BETWEEN_REQUESTS)
          return result
        }, this.retryOptions)

        if (!signatures.length) break

        oldestSignature = signatures.at(-1)?.signature
        if (signatures.length < this.MAX_SIGNATURES_LIMIT) break
      }

      return oldestSignature
    } catch (error) {
      console.error(`Error fetching signatures: ${error instanceof Error ? error.message : String(error)}`)
      return undefined
    }
  }

  async getTransactionBlockTime(signature: string): Promise<number | null | undefined> {
    try {
      const tx = await retryOperation(() => 
        this.connection.getParsedTransaction(signature), 
        this.retryOptions
      )
      return tx?.blockTime ?? null
    } catch (error) {
      console.error(`Error fetching transaction: ${error instanceof Error ? error.message : String(error)}`)
      return undefined
    }
  }

  async getFirstDeploymentTimestamp(programId: string): Promise<number | null | undefined> {
    const oldestSignature = await this.getOldestSignature(programId)
    return oldestSignature ? await this.getTransactionBlockTime(oldestSignature) : undefined
  }
}
