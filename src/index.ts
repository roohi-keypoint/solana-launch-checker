import 'dotenv/config'
import { SolanaClient } from './services/solana'

const main = async (): Promise<void> => {
  const [, , programId] = process.argv
  if (!programId) process.exit(1)
  
  const solanaClient = new SolanaClient()
  const timestamp = await solanaClient.getFirstDeploymentTimestamp(programId)
  
  if (!timestamp) process.exit(1)
  console.log(`${timestamp}`)
}

main()

