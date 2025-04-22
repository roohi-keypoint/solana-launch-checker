import { Connection, PublicKey } from '@solana/web3.js'
import { getHeliusApiKey } from '../utils/env'
import { sleep } from '../utils/time'
import { retryOperation, RetryOptions } from '../utils/retry'
import { SolanaConnectionOptions } from '../types/solana'
import { Logger, createLogger } from '../utils/logger'

export class SolanaClient {
  private readonly connection: Connection
  private readonly MAX_SIGNATURES_LIMIT: number
  private readonly DELAY_BETWEEN_REQUESTS: number
  private readonly retryOptions: RetryOptions
  private readonly logger: Logger

  constructor({
    apiKey = getHeliusApiKey(), 
    commitment = 'confirmed',
    maxRetries = 5,
    maxSignaturesPerRequest = 1000,
    delayBetweenRequests = 100,
    verbose = false
  }: SolanaConnectionOptions = {}) {
    const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
    this.connection = new Connection(heliusUrl, commitment)
    this.MAX_SIGNATURES_LIMIT = maxSignaturesPerRequest
    this.DELAY_BETWEEN_REQUESTS = delayBetweenRequests
    this.retryOptions = { maxRetries, delayMs: delayBetweenRequests, verbose }
    this.logger = createLogger({ verbose })
  }

  async getFirstDeploymentTimestamp(programId: string): Promise<number | null | undefined> {
    const oldestSignature = await this.getOldestSignature(programId)
    return oldestSignature ? await this.getTransactionBlockTime(oldestSignature) : undefined
  }

  private async getOldestSignature(address: string): Promise<string | undefined> {
    let oldestSignature: string | undefined
    const pubkey = new PublicKey(address)

    this.logger.log(`Finding oldest signature for address: ${address}`)
    
    try {
      for (;;) {
        this.logger.log(`Fetching signatures${oldestSignature ? ` before ${oldestSignature}` : ''}`)
        
        const signatures = await retryOperation(async () => {
          const result = await this.connection.getSignaturesForAddress(pubkey, {
            limit: this.MAX_SIGNATURES_LIMIT,
            before: oldestSignature
          })
          await sleep(this.DELAY_BETWEEN_REQUESTS)
          return result
        }, this.retryOptions)

        this.logger.log(`Retrieved ${signatures.length} signatures`)
        
        if (!signatures.length) break

        oldestSignature = signatures.at(-1)?.signature
        if (signatures.length < this.MAX_SIGNATURES_LIMIT) break
      }

      this.logger.log(`Oldest signature found: ${oldestSignature}`)
      return oldestSignature
    } catch (error) {
      this.logger.error(`Error fetching signatures: ${error instanceof Error ? error.message : String(error)}`)
      return undefined
    }
  }

  private async getTransactionBlockTime(signature: string): Promise<number | null | undefined> {
    this.logger.log(`Fetching block time for transaction: ${signature}`)
    
    try {
      const tx = await retryOperation(() => 
        this.connection.getParsedTransaction(signature), 
        this.retryOptions
      )
      
      this.logger.log(`Transaction block time: ${tx?.blockTime ?? 'null'}`)
      return tx?.blockTime ?? null
    } catch (error) {
      this.logger.error(`Error fetching transaction: ${error instanceof Error ? error.message : String(error)}`)
      return undefined
    }
  }
}
