import 'dotenv/config'
import { Connection, PublicKey, ParsedConfirmedTransaction } from '@solana/web3.js'

const getHeliusApiKey = (): string => process.env.HELIUS_API_KEY ?? ''

const getFirstDeploymentTimestamp = async (programId: string): Promise<number | undefined> => {
  const heliusApiKey = getHeliusApiKey()
  const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
  const connection = new Connection(heliusUrl, 'confirmed')
  const signatures = await connection.getSignaturesForAddress(new PublicKey(programId), { limit: 1000 })
  const deploySignature = signatures.reverse().find(sig => sig.err === null)
  if (!deploySignature) return undefined
  const tx = await connection.getParsedTransaction(deploySignature.signature)
  return tx?.blockTime ?? undefined
}

const main = async (): Promise<void> => {
  const [, , programId] = process.argv
  if (!programId) {
    console.error('Usage: yarn ts-node src/index.ts <PROGRAM_ID>')
    process.exit(1)
  }
  const timestamp = await getFirstDeploymentTimestamp(programId)
  if (!timestamp) {
    console.log('Deployment timestamp not found')
    process.exit(1)
  }
  console.log(`${timestamp}`)
}

main()
