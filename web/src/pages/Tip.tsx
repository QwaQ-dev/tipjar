import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import Jar from '../anim/Jar'
import TipForm from '../components/TipForm'
import RecentTips from '../components/RecentTips'
import WalletButton from '../components/WalletButton'
import { tipJarAbi } from '../lib/abi'

const jarAddress = import.meta.env.VITE_TIPJAR_ADDRESS as `0x${string}`

export default function Tip() {
  const { username: rawUsername = '' } = useParams()
  const username = rawUsername.toLowerCase()
  const [refreshKey, setRefreshKey] = useState(0)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const { data, isLoading, refetch } = useReadContract({
    address: jarAddress, abi: tipJarAbi, functionName: 'getJar', args: [username],
    query: { enabled: /^[a-z0-9_-]{3,20}$/.test(username) && Boolean(jarAddress) },
  })
  const owner = data?.[0]
  const goal = data?.[1] ?? 0n
  const total = data?.[2] ?? 0n
  const exists = Boolean(owner && owner !== '0x0000000000000000000000000000000000000000')
  const progress = goal > 0n ? Math.min(100, Number(total * 10_000n / goal) / 100) : 0

  if (!/^[a-z0-9_-]{3,20}$/.test(username)) return <main className="center-state"><h1>That jar link doesn’t look right.</h1><Link to="/">Create a jar instead</Link></main>
  return <main className="tip-page">
    <header className="topbar"><Link className="brand" to="/">tipjar<span>.</span></Link><span className="network-tag">Built on Arc</span><WalletButton /></header>
    {isLoading ? <div className="center-state"><p>Finding your jar…</p></div> : !exists ? <div className="center-state"><div className="empty-icon">○</div><h1>No jar here yet.</h1><p className="muted">This username may still be available.</p><Link className="button button-dark" to="/">Create your jar</Link></div> :
      <div className="tip-layout">
        <section className="tip-intro"><div className="eyebrow"><span className="eyebrow-dot" /> A REASON TO SAY THANKS</div><h1>Support <em>@{username}</em></h1><p className="hero-copy">Every little bit means a lot. If this made your day, leave a little support.</p>
          <div className="jar-stage"><Jar total={Number(total)} goal={Number(goal)} celebrationKey={celebrationKey} /></div>
          <div className="progress-stats"><div><strong>{formatUnits(total, 6)}</strong><span>USDC raised</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="goal-stat"><strong>{goal === 0n ? 'No goal' : formatUnits(goal, 6)}</strong><span>USDC goal</span></div></div>
          <div className="owner-line"><span className="owner-dot" /> Owned by <code>{owner?.slice(0, 6)}…{owner?.slice(-4)}</code></div>
        </section>
        <aside className="support-panel"><div className="panel-top"><span className="panel-kicker">PASS IT FORWARD</span><span className="heart-mark">♡</span></div><h2>Send a little love.</h2><p className="muted">Your tip goes straight to the jar owner.</p>
          <TipForm username={username} onSent={() => { setRefreshKey(v => v + 1); setCelebrationKey(v => v + 1); void refetch() }} />
          <div className="secure-note"><span>◈</span> Non-custodial · On-chain · USDC</div>
        </aside>
        <div className="recent-wrap"><RecentTips username={username} refreshKey={refreshKey} /></div>
      </div>}
    <footer className="site-footer"><span>Small tips, big support.</span><span>Powered by Arc</span></footer>
  </main>
}
