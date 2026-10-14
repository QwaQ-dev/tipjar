# TipJar

A non-custodial USDC tipping app for Arc. Jar totals are tracked on-chain; tips are transferred directly to the jar owner. The frontend uses Vite, React, TypeScript, wagmi, viem, and a procedural Canvas 2D jar animation.

## Requirements

- Node.js 20+
- Foundry
- An injected wallet such as MetaMask or Rabby
- Arc RPC and the official USDC token address verified from Arc's current documentation

## Repository layout

- `contracts/` — Solidity contract, Foundry tests, deployment script
- `web/` — Vite + React frontend

## Smart contract

The contract expects a six-decimal ERC-20 token such as USDC. It uses `SafeERC20` from OpenZeppelin and sends each tip directly to the jar owner. It does not custody tip funds.

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge test
```

Set deployment environment variables (do not commit secrets):

```bash
export ARC_RPC_URL="https://rpc.testnet.arc.network"
export USDC_ADDRESS="0x..."
forge script script/Deploy.s.sol:Deploy --rpc-url "$ARC_RPC_URL" --account arc-deployer --broadcast
```

Verify the chain ID, RPC, token address, and token decimals against official Arc documentation before deploying. The deployment script intentionally requires `USDC_ADDRESS` rather than silently assuming a token address.

## Frontend

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Set `VITE_TIPJAR_ADDRESS` after deploying the contract. Configure `VITE_ARC_RPC_URL` and `VITE_USDC_ADDRESS` to verified values. The app defaults to Arc mainnet chain ID `5042`; use the testnet configuration in `src/lib/chain.ts` when testing.

## Security notes

- Test on Arc testnet before mainnet.
- Never put a private key in frontend environment variables or source control.
- A normal ERC-20 approval and tip require two transactions. A one-transaction flow requires a token-supported permit/authorization mechanism and is not assumed here.
- Recent tips are loaded from `Tipped` logs over a bounded block range. For older history, add pagination or an indexer.
- Contract usernames are lowercase ASCII: 3–20 characters from `a-z`, `0-9`, `_`, and `-`.
