import 'dotenv/config'
import { SolanaClient } from './services/solana'
import { createLogger } from './utils/logger'
import { formatTimestampOutput } from './utils/format'
import { parseArgs } from './utils/cli'

export const main = async (): Promise<void> => {
  const { programId, verbose } = parseArgs()
  
  const logger = createLogger({ verbose })
  const solanaClient = new SolanaClient({ verbose })
  
  try {
    logger.log(`Fetching deployment timestamp for program: ${programId}`)
    const timestamp = await solanaClient.getFirstDeploymentTimestamp(programId)
    
    if (!timestamp) {
      logger.error('Failed to retrieve deployment timestamp')
      process.exit(1)
    }
    
    console.log(formatTimestampOutput(timestamp))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(errorMessage)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
