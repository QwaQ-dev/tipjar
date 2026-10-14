import { defineChain } from 'viem'

const chainId = Number(import.meta.env.VITE_ARC_CHAIN_ID || 5042)
const rpcUrl = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.mainnet.arc.io'

export const arc = defineChain({
  id: chainId,
  name: chainId === 5042002 ? 'Arc Testnet' : 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' } },
})
