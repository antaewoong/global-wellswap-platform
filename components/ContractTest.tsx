'use client'

import { useState } from 'react'
import { useContract } from '@/hooks/useContract'

export default function ContractTest() {
  const { contract, isConnected, connectWallet, getAssetInfo, getRegistrationFees } = useContract()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testContractFunctions = async () => {
    if (!contract) return
    
    setLoading(true)
    try {
      // Test basic read functions
      const owner = await contract.owner()
      const bnbPrice = await contract.bnbUsdPrice()
      const assetCounter = await contract.assetCounter()
      const fees = await getRegistrationFees()
      
      setResult({
        owner,
        bnbPrice: bnbPrice.toString(),
        assetCounter: assetCounter.toString(),
        sellerFee: fees[0].toString(),
        buyerFee: fees[1].toString(),
        contractAddress: "0x58228104D72Aa48F1761804a090be24c01523972"
      })
    } catch (error) {
      console.error('Contract test failed:', error)
      setResult({ error: String(error) })
    } finally {
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">🔗 Contract Connection Test</h2>
      
      {!isConnected ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">Connect your wallet to test contract functions</p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-green-600 mb-4 font-semibold">✅ Wallet Connected</p>
          <button
            onClick={testContractFunctions}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing Contract...' : 'Test Contract Functions'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-3 text-lg">📊 Contract Test Results:</h3>
          {result.error ? (
            <div className="text-red-600 font-mono text-sm">
              ❌ Error: {result.error}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div><strong>Owner:</strong> <code className="bg-white px-2 py-1 rounded">{result.owner}</code></div>
              <div><strong>BNB Price:</strong> <code className="bg-white px-2 py-1 rounded">${(parseFloat(result.bnbPrice) / 1e18).toFixed(0)} USD</code></div>
              <div><strong>Total Assets:</strong> <code className="bg-white px-2 py-1 rounded">{result.assetCounter}</code></div>
              <div><strong>Seller Fee:</strong> <code className="bg-white px-2 py-1 rounded">{(parseFloat(result.sellerFee) / 1e18).toFixed(4)} BNB</code></div>
              <div><strong>Buyer Fee:</strong> <code className="bg-white px-2 py-1 rounded">{(parseFloat(result.buyerFee) / 1e18).toFixed(4)} BNB</code></div>
              <div><strong>Contract:</strong> <code className="bg-white px-2 py-1 rounded">{result.contractAddress}</code></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
