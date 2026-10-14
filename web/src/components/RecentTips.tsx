import { useEffect, useState } from 'react'
import { formatUnits, parseAbiItem, type Address } from 'viem'
import { usePublicClient } from 'wagmi'

const jarAddress = import.meta.env.VITE_TIPJAR_ADDRESS as Address
type Tip = { from: Address; amount: bigint; message: string; blockNumber: bigint; transactionHash: string }

export default function RecentTips({ username, refreshKey }: { username: string; refreshKey: number }) {
  const client = usePublicClient()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!client || !jarAddress || /^0x0{40}$/i.test(jarAddress)) return
    let active = true
    setLoading(true)
    const load = async () => {
      try {
        const latest = await client.getBlockNumber()
        const fromBlock = latest > 50_000n ? latest - 50_000n : 0n
        const logs = await client.getLogs({
          address: jarAddress,
          event: parseAbiItem('event Tipped(string name, address indexed from, address indexed owner, uint256 amount, string message)'),
          fromBlock, toBlock: latest,
        })
        const mapped = logs.flatMap(log => log.args.name === username && log.args.from && log.args.amount !== undefined
          ? [{ from: log.args.from, amount: log.args.amount, message: log.args.message || '', blockNumber: log.blockNumber, transactionHash: log.transactionHash }]
          : [])
        if (active) setTips(mapped.reverse().slice(0, 5))
      } catch {
        if (active) setTips([])
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [client, username, refreshKey])
  return <section className="recent-section">
    <div className="section-heading"><h2>Recent support</h2><span>On-chain</span></div>
    {loading && tips.length === 0 ? <p className="muted">Loading recent tips…</p> : tips.length === 0 ? <p className="muted">Your jar’s first tip could be the one that starts it all.</p> :
      <div className="tip-list">{tips.map(tip => <article className="tip-row" key={tip.transactionHash}>
        <div className="tip-avatar">{tip.from.slice(2, 4).toUpperCase()}</div><div className="tip-details"><strong>{tip.from.slice(0, 6)}…{tip.from.slice(-4)}</strong><p>{tip.message || 'Sent some support'}</p></div>
        <strong className="tip-value">{formatUnits(tip.amount, 6)} <small>USDC</small></strong>
      </article>)}</div>}
  </section>
}
