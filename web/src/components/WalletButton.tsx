import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { arc } from '../lib/chain'

export default function WalletButton() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: switching } = useSwitchChain()
  if (isConnected && address) {
    return <div className="wallet-actions">
      {chainId !== arc.id && <button className="button button-secondary" onClick={() => switchChain({ chainId: arc.id })} disabled={switching}>Switch network</button>}
      <button className="wallet-pill" onClick={() => disconnect()} title="Disconnect wallet">{address.slice(0, 6)}…{address.slice(-4)}</button>
    </div>
  }
  return <button className="button button-dark" disabled={isPending} onClick={() => connectors[0] && connect({ connector: connectors[0], chainId: arc.id })}>{isPending ? 'Connecting…' : 'Connect wallet'}</button>
}
