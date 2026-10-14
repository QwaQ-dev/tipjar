import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { parseUnits } from 'viem'
import WalletButton from '../components/WalletButton'
import { tipJarAbi } from '../lib/abi'
import { arc } from '../lib/chain'

const jarAddress = import.meta.env.VITE_TIPJAR_ADDRESS as `0x${string}`

export default function Home() {
  const [username, setUsername] = useState('')
  const [goal, setGoal] = useState('100')
  const [error, setError] = useState('')
  const { isConnected, chainId } = useAccount()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  const navigate = useNavigate()

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const name = username.trim()
    if (!/^[a-z0-9_-]{3,20}$/.test(name)) { setError('Use 3–20 lowercase letters, numbers, hyphens, or underscores.'); return }
    const parsedGoal = Number(goal)
    if (!Number.isFinite(parsedGoal) || parsedGoal < 0 || parsedGoal > 1_000_000) { setError('Enter a goal between 0 and 1,000,000 USDC.'); return }
    if (!isConnected) { setError('Connect your wallet to create a jar.'); return }
    if (chainId !== arc.id) { setError('Switch to the Arc network first.'); return }
    if (!jarAddress || /^0x0{40}$/i.test(jarAddress)) { setError('The app is not configured with a deployed TipJar contract.'); return }
    writeContract({ address: jarAddress, abi: tipJarAbi, functionName: 'createJar', args: [name, parseUnits(goal, 6)] })
  }

  if (isSuccess && hash) navigate(`/tip/${username.trim()}`)
  return <main className="home-page">
    <header className="topbar"><a className="brand" href="/">tipjar<span>.</span></a><span className="network-tag">Built on Arc</span><WalletButton /></header>
    <section className="hero home-hero">
      <div className="eyebrow"><span className="eyebrow-dot" /> A LITTLE GOES A LONG WAY</div>
      <h1>Good things grow<br />with <em>a little support.</em></h1>
      <p className="hero-copy">Make a little corner of the internet your own. Create a jar, share your link, and let the good stuff add up.</p>
    </section>
    <section className="create-card">
      <div className="card-kicker">YOUR OWN LITTLE JAR</div><h2>Start collecting support.</h2><p className="muted">One link. Direct USDC tips. No middleman.</p>
      <form onSubmit={create}>
        <label className="field-label" htmlFor="username">Choose your username</label>
        <div className="username-input"><span>@</span><input id="username" placeholder="yourname" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} maxLength={20} /></div>
        <p className="input-hint">Your link will be tipjar.app/tip/{username || 'yourname'}</p>
        <label className="field-label" htmlFor="goal">Support goal</label>
        <div className="amount-input"><input id="goal" inputMode="decimal" value={goal} onChange={e => setGoal(e.target.value)} /><span>USDC</span></div>
        <button className="button button-dark submit-button" type="submit" disabled={isPending || isLoading}>{isPending || isLoading ? 'Waiting for confirmation…' : 'Create your jar'} <span>↗</span></button>
        {(error || writeError) && <p className="error-text">{error || writeError?.shortMessage || 'Transaction failed. Please try again.'}</p>}
      </form>
    </section>
    <footer className="site-footer"><span>Small tips, big support.</span><span>Powered by Arc</span></footer>
  </main>
}
