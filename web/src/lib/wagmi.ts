import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arc } from './chain'

export const config = createConfig({
  chains: [arc],
  connectors: [injected()],
  transports: { [arc.id]: http(import.meta.env.VITE_ARC_RPC_URL || undefined) },
})
