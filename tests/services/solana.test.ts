import { SolanaClient } from '../../src/services/solana'
import { Connection } from '@solana/web3.js'
import * as envUtils from '../../src/utils/env'

jest.mock('@solana/web3.js', () => {
  const originalModule = jest.requireActual('@solana/web3.js')
  return {
    ...originalModule,
    Connection: jest.fn().mockImplementation(() => ({
      getSignaturesForAddress: jest.fn(),
      getParsedTransaction: jest.fn()
    })),
    PublicKey: jest.fn().mockImplementation((address) => ({
      toString: () => address
    }))
  }
})

jest.mock('../../src/utils/env', () => ({
  getHeliusApiKey: jest.fn().mockReturnValue('test-api-key')
}))

jest.mock('../../src/utils/retry', () => ({
  retryOperation: jest.fn((fn) => fn()),
  Retryable: () => (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      return originalMethod.apply(this, args);
    };
    return descriptor;
  }
}))

jest.mock('../../src/utils/time', () => ({
  sleep: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../src/utils/logger', () => ({
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}))

describe('SolanaClient', () => {
  let client: SolanaClient
  const mockConnection = {
    getSignaturesForAddress: jest.fn(),
    getParsedTransaction: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Connection as jest.Mock).mockImplementation(() => mockConnection)
    client = new SolanaClient()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(Connection).toHaveBeenCalledWith(
        'https://mainnet.helius-rpc.com/?api-key=test-api-key',
        'confirmed'
      )
      expect(envUtils.getHeliusApiKey).toHaveBeenCalled()
    })

    it('should use provided options', () => {
      client = new SolanaClient({
        apiKey: 'custom-api-key',
        commitment: 'finalized',
        maxRetries: 10,
        maxSignaturesPerRequest: 500,
        delayBetweenRequests: 200,
        verbose: true
      })

      expect(Connection).toHaveBeenCalledWith(
        'https://mainnet.helius-rpc.com/?api-key=custom-api-key',
        'finalized'
      )
    })
  })

  describe('getFirstDeploymentTimestamp', () => {
    it('should return undefined when no signature found', async () => {
      jest.spyOn(client as any, 'getOldestSignature').mockResolvedValueOnce(undefined)
      
      const result = await client.getFirstDeploymentTimestamp('program123')
      
      expect(result).toBeUndefined()
      expect((client as any).getOldestSignature).toHaveBeenCalledWith('program123')
    })

    it('should return block time when signature is found', async () => {
      jest.spyOn(client as any, 'getOldestSignature').mockResolvedValueOnce('signature123')
      jest.spyOn(client as any, 'getTransactionBlockTime').mockResolvedValueOnce(1234567890)
      
      const result = await client.getFirstDeploymentTimestamp('program123')
      
      expect(result).toBe(1234567890)
      expect((client as any).getOldestSignature).toHaveBeenCalledWith('program123')
      expect((client as any).getTransactionBlockTime).toHaveBeenCalledWith('signature123')
    })
  })

  describe('getOldestSignature', () => {
    it('should return undefined when error occurs', async () => {
      mockConnection.getSignaturesForAddress.mockRejectedValueOnce(new Error('Connection error'))
      
      const result = await (client as any).getOldestSignature('address123')
      
      expect(result).toBeUndefined()
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledTimes(1)
    })

    it('should return oldest signature when one batch of signatures exists', async () => {
      mockConnection.getSignaturesForAddress.mockResolvedValueOnce([
        { signature: 'sig1' },
        { signature: 'sig2' },
        { signature: 'sig3' }
      ])
      
      const result = await (client as any).getOldestSignature('address123')
      
      expect(result).toBe('sig3')
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledTimes(1)
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledWith(
        expect.any(Object),
        { limit: 1000, before: undefined }
      )
    })

    it('should paginate through signatures until finding the oldest one', async () => {
      mockConnection.getSignaturesForAddress
        .mockResolvedValueOnce(Array(1000).fill(0).map((_, i) => ({ signature: `sig${i + 1}` })))
        .mockResolvedValueOnce(Array(500).fill(0).map((_, i) => ({ signature: `sig${i + 1001}` })))
      
      const result = await (client as any).getOldestSignature('address123')
      
      expect(result).toBe('sig1500')
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledTimes(2)
      expect(mockConnection.getSignaturesForAddress).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        { limit: 1000, before: undefined }
      )
      expect(mockConnection.getSignaturesForAddress).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        { limit: 1000, before: 'sig1000' }
      )
    })

    it('should handle empty signature response', async () => {
      mockConnection.getSignaturesForAddress.mockResolvedValueOnce([])
      
      const result = await (client as any).getOldestSignature('address123')
      
      expect(result).toBeUndefined()
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledTimes(1)
    })
  })

  describe('getTransactionBlockTime', () => {
    it('should return block time when transaction is found', async () => {
      mockConnection.getParsedTransaction.mockResolvedValueOnce({
        blockTime: 1234567890
      })
      
      const result = await (client as any).getTransactionBlockTime('sig123')
      
      expect(result).toBe(1234567890)
      expect(mockConnection.getParsedTransaction).toHaveBeenCalledWith('sig123')
    })

    it('should return null when transaction has no block time', async () => {
      mockConnection.getParsedTransaction.mockResolvedValueOnce({})
      
      const result = await (client as any).getTransactionBlockTime('sig123')
      
      expect(result).toBeNull()
      expect(mockConnection.getParsedTransaction).toHaveBeenCalledWith('sig123')
    })

    it('should return undefined when error occurs', async () => {
      mockConnection.getParsedTransaction.mockRejectedValueOnce(new Error('Connection error'))
      
      const result = await (client as any).getTransactionBlockTime('sig123')
      
      expect(result).toBeUndefined()
      expect(mockConnection.getParsedTransaction).toHaveBeenCalledWith('sig123')
    })
  })
})
