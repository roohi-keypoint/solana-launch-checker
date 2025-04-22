interface CommandLineArgs {
  programId: string
  verbose: boolean
}

export const parseArgs = (): CommandLineArgs => {
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
