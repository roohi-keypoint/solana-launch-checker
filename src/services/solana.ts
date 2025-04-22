import {Connection, PublicKey} from '@solana/web3.js'
import {getHeliusApiKey} from '../utils/env'

type SolanaConnectionOptions = {
    apiKey?: string
    commitment?: 'confirmed' | 'finalized' | 'processed'
}

export class SolanaClient {
    private connection: Connection
    private readonly MAX_SIGNATURES_LIMIT = 1000

    constructor({apiKey = getHeliusApiKey(), commitment = 'confirmed'}: SolanaConnectionOptions = {}) {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`
        this.connection = new Connection(heliusUrl, commitment)
    }

    async getOldestSignature(address: string): Promise<string | undefined> {
        let oldestSignature: string | undefined
        let found = false
        const pubkey = new PublicKey(address)

        while (!found) {
            const signatures = await this.connection.getSignaturesForAddress(pubkey, {
                limit: this.MAX_SIGNATURES_LIMIT,
                before: oldestSignature
            })

            if (!signatures.length) break

            oldestSignature = signatures[signatures.length - 1].signature
            found = signatures.length < this.MAX_SIGNATURES_LIMIT
        }

        return oldestSignature
    }

    async getTransactionBlockTime(signature: string): Promise<number | null | undefined> {
        const tx = await this.connection.getParsedTransaction(signature)
        return tx?.blockTime
    }

    async getFirstDeploymentTimestamp(programId: string): Promise<number | null | undefined> {
        const oldestSignature = await this.getOldestSignature(programId)
        if (!oldestSignature) return undefined

        return this.getTransactionBlockTime(oldestSignature)
    }
}
