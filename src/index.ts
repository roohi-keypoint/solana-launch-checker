import 'dotenv/config'
import { SolanaClient } from './services/solana'
import { createLogger } from './utils/logger'

export const parseArgs = (): { programId: string, verbose: boolean } => {
  const args = process.argv.slice(2)
  const verboseIndex = args.indexOf('--verbose')
  const verbose = verboseIndex !== -1
  
  if (verbose) {
    args.splice(verboseIndex, 1)
  }
  
  const [programId] = args
  
  if (!programId) {
    console.error('Usage: solana-launch-checker <program-id> [--verbose]')
    process.exit(1)
  }
  
  return { programId, verbose }
}

export const main = async (): Promise<void> => {
  const { programId, verbose } = parseArgs()
  
  const logger = createLogger({ verbose })
  const solanaClient = new SolanaClient({ verbose })
  
  logger.log(`Fetching deployment timestamp for program: ${programId}`)
  
  const timestamp = await solanaClient.getFirstDeploymentTimestamp(programId)
  
  if (!timestamp) {
    logger.error('Failed to retrieve deployment timestamp')
    process.exit(1)
  }
  
  console.log(`${timestamp}`)
}

if (require.main === module) {
  main()
}

