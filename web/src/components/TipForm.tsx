import { useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { arc } from '../lib/chain'
import { erc20Abi, tipJarAbi } from '../lib/abi'

const jarAddress = import.meta.env.VITE_TIPJAR_ADDRESS as `0x${string}`
const tokenAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`

export default function TipForm({ username, onSent }: { username: string; onSent: () => void }) {
  const [amount, setAmount] = useState('5')
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<'idle' | 'approve' | 'tip'>('idle')
  const [error, setError] = useState('')
  const { address, chainId, isConnected } = useAccount()
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress, abi: erc20Abi, functionName: 'allowance',
    args: address && jarAddress ? [address, jarAddress] : undefined,
    query: { enabled: Boolean(address && jarAddress) },
  })
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const parsedAmount = useMemo(() => {
    try { return parseUnits(amount, 6) } catch { return 0n }
  }, [amount])
  const enoughAllowance = typeof allowance === 'bigint' && allowance >= parsedAmount

  const submit = async () => {
    setError('')
    if (!isConnected || !address) { setError('Connect your wallet to send a tip.'); return }
    if (chainId !== arc.id) { setError('Switch to the Arc network first.'); return }
    if (!jarAddress || !tokenAddress || /^0x0{40}$/i.test(jarAddress) || /^0x0{40}$/i.test(tokenAddress)) {
      setError('The app is not configured with deployed contract addresses.'); return
    }
    if (parsedAmount < 10_000n) { setError('The minimum tip is 0.01 USDC.'); return }
    if (message.length > 280) { setError('Keep your message under 280 characters.'); return }
    try {
      if (!enoughAllowance) {
        setStage('approve')
        writeContract({ address: tokenAddress, abi: erc20Abi, functionName: 'approve', args: [jarAddress, parsedAmount] })
      } else {
        setStage('tip')
        writeContract({ address: jarAddress, abi: tipJarAbi, functionName: 'tip', args: [username, parsedAmount, message] })
      }
    } catch {
      setError('Transaction could not be submitted. Please try again.')
    }
  }

  if (isSuccess && hash && stage === 'approve') {
    void refetchAllowance()
    setStage('idle')
  } else if (isSuccess && hash && stage === 'tip') {
    onSent()
    setStage('idle')
  }

  return <form className="tip-form" onSubmit={e => { e.preventDefault(); void submit() }}>
    <div className="amount-presets">
      {['1', '5', '10'].map(value => <button type="button" key={value} className={`preset ${amount === value ? 'selected' : ''}`} onClick={() => setAmount(value)}>{value} USDC</button>)}
    </div>
    <label className="field-label" htmlFor="amount">Tip amount</label>
    <div className="amount-input"><input id="amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} aria-label="Tip amount in USDC" /><span>USDC</span></div>
    <label className="field-label" htmlFor="message">Add a message <span className="optional">Optional</span></label>
    <textarea id="message" maxLength={280} rows={3} placeholder="Leave a kind note…" value={message} onChange={e => setMessage(e.target.value)} />
    <div className="form-footer"><span>{message.length}/280</span><span>Minimum 0.01 USDC</span></div>
    <button className="button button-dark submit-button" type="submit" disabled={isPending || confirming}>
      {isPending || confirming ? 'Waiting for confirmation…' : stage === 'approve' ? 'Approve USDC' : stage === 'tip' ? 'Send tip' : enoughAllowance ? 'Send tip' : 'Approve USDC'}
    </button>
    {hash && <a className="tx-link" href={`https://explorer.arc.io/tx/${hash}`} target="_blank" rel="noreferrer">View transaction</a>}
    {(error || writeError) && <p className="error-text">{error || 'Transaction failed. Please try again.'}</p>}
    {isSuccess && stage === 'idle' && <p className="success-text">Transaction confirmed.</p>}
  </form>
}
