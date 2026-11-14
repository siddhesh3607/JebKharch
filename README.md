# JebKharch — pocket money for AI agents

A working Avalanche Fuji prototype: Solidity session wallet, paid HTTP APIs, deterministic attack harness, optional live Claude agent, and an owner dashboard.

This is the restored original local Fuji demo, with real on-chain payments and loopback-only test-owner controls. The later hosted/browser-only version is preserved on branch `backup/hosted-instant-demo-26ab2f6`. This version runs as a local Node server rather than serverless hosting.

## Run

Requires Node.js 20+ (22 recommended).

```powershell
npm.cmd install
npm.cmd test
npm.cmd run demo
```

Open http://127.0.0.1:3000. With no `.env`, the app runs a fresh local EVM demo. On the original Desktop checkout, `.env` is configured for the deployed Fuji contracts. The download deliberately excludes private keys and local runtime data.

## Connect a wallet

The purple **Connect Wallet** button requests access to a browser wallet, switches to Fuji, and offers to add Fuji if missing. Account and network changes update the status. The browser's selected account must own the smart contract to change policy, revoke or withdraw. Any funded account can deposit the demo token or top up session gas.

Use Chrome/Edge with MetaMask or Core. The Codex preview may not have an injected wallet extension; it displays instructions instead of pretending to connect.

## Owner Desk

Under **House Rules**, choose the signer:

- **Connected browser wallet**: transactions are signed by the owner in the wallet extension. Non-owner accounts cannot change policy or withdraw.
- **Local test owner / this computer**: available in the original Fuji checkout for this testnet demo, or automatically on the local EVM. The server signs owner actions using the locally configured test owner. This is a demo convenience and is not a noncustodial production arrangement. Agent tools do not expose owner actions. Browser connection and local signing are separate modes.

Controls include per-call and rolling 24h caps, recipient allowlist, expiry, session renewal, deposit, withdrawal, agent gas top-up, and revocation. Every action waits for an actual receipt. Transaction hashes appear in the ledger. Regranting preserves previous rolling spend; it does not reset the daily counter. If the budget is exhausted, the owner must raise the cap or wait for spend to age out.

Local owner controls require `ENABLE_LOCAL_TEST_OWNER=true` and `DEPLOYER_PRIVATE_KEY` in the private `.env`. They bind to loopback, validate Host/Origin, and require a custom control header. Do not expose the server publicly. Disable local owner mode and remove the deployer key from runtime configuration when using browser-only ownership.

## Demo

For the guided presentation, read `DEMO.md`. Before each run, click **Prepare Next Demo** in Owner Desk. It tops up to 10 jUSD and grants 5 jUSD of remaining allowance by increasing the total cap to include previous rolling spend.

1. Check session expiry, token balance, gas, and remaining rolling budget. Renew/fund through Owner Desk if needed.
2. Enable **Unleash the Poison**.
3. Launch the **Attack harness**. It buys three vendor calls for 1 jUSD each.
4. The poisoned response requests a drain to an unapproved address. The harness attempts it; the real contract reverts with `RecipientNotAllowed`.
5. **Pull the Plug** revokes the session. Further attempts revert with `SessionInactive`.
6. Use **Save Policy / Renew** to reactivate the session. Existing spend remains counted.

The harness deliberately follows the malicious response and is not an LLM. Live Claude uses real tool calls and may refuse malicious instructions. Configure `ANTHROPIC_API_KEY` and `CLAUDE_MODEL` locally to enable that mode; it is disabled until configured. Private keys are never passed to Claude. Live Claude has not been tested with a real API key in this session.

## Fuji deployment

Wallet: `0xa8Aa77610fc6bDD3864BDBB168001F3D9286EAe6`

Demo token: `0xd55b7e35e5acF1526d252417892cbE533Dc8B41b`

Chain ID: 43113. RPC: https://api.avax-test.network/ext/bc/C/rpc

Recorded public addresses and successful/reverted transaction hashes are in `deployment/`. Runtime private keys remain in `.env`, excluded by Git and the downloadable archive. This token is **jUSD, not official USDC**.

To deploy independently, copy `.env.example` to `.env`, configure separate disposable owner/session keys and two vendor addresses, fund the owner with at least 0.1 Fuji test AVAX, and run `npm.cmd run deploy:fuji`. Deployment tops up session gas and saves `data/fuji.json`. Set `NETWORK=fuji` and run `npm.cmd start`. If using the existing public deployment, another owner account cannot control it; deploy your own wallet or use the original checkout's test owner.

## How it works

`AgentWallet.sol` combines the wallet and policy module. Only ERC-20 transfers of one immutable asset are exposed to sessions. EIP-712 signatures bind the chain, contract, session generation, recipient, amount, nonce, and API request ID. The contract enforces expiry, nonce, recipient allowlist, per-call cap, exact rolling 24h spend and revocation. Owner withdrawal remains owner-only. Renewal invalidates old-generation signatures and allowlist entries without erasing spend.

Vendors implement a **custom HTTP 402 protocol, not x402 specification compatibility**. Each quote expires in five minutes and has a unique request ID. After payment, the agent supplies the transaction hash and request ID. The vendor checks the successful wallet `Paid` event and matches session, recipient, amount and ID. Quotes redeem once and are journaled atomically under data/, scoped to chain and wallet. Expiry and redeemed status survive a server restart. This journal supports one server process.

Reverted transactions cannot retain events. Blocked attempts are local audit records with on-chain reverted receipts when submitted. Fuji ledger history persists locally across restarts. Exact rolling accounting scans active payments and is intended for this small testnet demo, not high-throughput custody. Contracts are not audited.

## Validation

`npm.cmd test` runs actual EVM tests covering signatures, replay, caps, rolling expiry, revocation, owner access, deposits, withdrawals, renewal, API receipt matching, and cross-origin control rejection. Browser layout and missing-extension feedback were checked. Actual Fuji payment, poisoned-drain, revoke, renewal, funding and withdrawal receipts are recorded in `deployment/`.

## Layout

- `contracts/`: wallet and demo ERC-20
- `server/`: API service, owner controls and agent
- `public/`: dashboard and wallet provider integration
- `lib/`: chain setup and EIP-712 signing
- `scripts/`: compile, deploy and verification helpers
- `test/`: contract and API lifecycle tests
- `deployment/`: public Fuji evidence; no private keys

Never publish `.env`, `node_modules`, or runtime key files.

## Portable demo launchers

`Start-JebKharch.cmd` uses the configured network. `Start-Local-Demo.cmd` always starts a new local EVM with fresh test funds; no keys or faucet needed. `node scripts/demo-smoke.mjs` runs the real payment/attack/revoke sequence against an already running local-owner-enabled server and restores a ready state. It uses testnet transactions when the server is configured for Fuji.

## Completion features

- `npm run doctor`: verifies network, deployment bytecode, session-key match and gas, without printing keys.
- `npm run demo:verify`: exercises the running test-owner demo and restores a ready state.
- Ledger filters and **Export Receipts** download on-chain references and local audit records as JSON.
- Confirmed browser-wallet owner transactions are checked against the chain before they are appended to the ledger; duplicate hashes are ignored.
- `.github/workflows/test.yml` runs the automated tests when the source is pushed to GitHub.
- `test/agent.test.mjs` validates Claude's tool loop with controlled API responses. It does not claim a live authenticated Claude test.

## Enable live Claude

Stop the server, edit the private `.env` file locally, set `ANTHROPIC_API_KEY` to your API key and `CLAUDE_MODEL` to a model available to that account, then restart with `npm start`. Run `npm run doctor` to check configuration presence. The live mode becomes selectable. The key stays in the backend; never paste it into chat or commit it. Calls use the [Claude tool-use lifecycle](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls). A live model may reject the malicious instruction itself; use the clearly labeled attack harness for a repeatable contract demonstration.
