# JebKharch

Pocket money for AI agents. A complete local EVM demo plus Avalanche Fuji deployment scripts. All project code lives in this folder.

## Run on Windows

Install Node.js 20+ (22 LTS recommended), then open PowerShell in this folder:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run demo
```

Open http://127.0.0.1:3000. Local mode deploys fresh contracts on an in-process Ganache EVM, funds the wallet with 10 **jUSD** (a demo ERC-20, not official USDC), grants a 1-token per-call / 5-token rolling-day session, and funds session gas automatically. Restart resets the local chain. Audit history is appended to `data/audit.jsonl`; the dashboard shows the current process's attempts.

Enable **Poison vendor response**, then run the deterministic harness. Three real payments leave 7 tokens in the wallet and 2 in the rolling budget. The drain transaction reverts with `RecipientNotAllowed`. Revoke, then run again: payments fail with `SessionInactive`. Start a fresh local process to repeat from the initial balance.

The deterministic harness deliberately follows malicious vendor instructions; it is clearly labeled and is not evidence that Claude was compromised. Live Claude uses actual tool calls and may refuse the injection. Select that mode after configuring `ANTHROPIC_API_KEY` and `CLAUDE_MODEL` in `.env`. No keys or signatures are sent to the model. Tool execution is limited to eight model turns.

## Deploy and run on Avalanche Fuji

1. Copy `.env.example` to `.env`. Keep it private.
2. Create separate disposable testnet owner and session keys using a wallet. Put them in `DEPLOYER_PRIVATE_KEY` and `SESSION_PRIVATE_KEY`. Put two recipient addresses in `VENDOR_A` and `VENDOR_B`.
3. Fund the deployer AND session addresses with test AVAX using the Avalanche faucet. Session AVAX pays gas and is outside token policy; do not fund it with valuable assets.
4. Run `npm.cmd run deploy:fuji`. It checks chain ID 43113, deploys demo jUSD and AgentWallet, funds 10 jUSD, and grants a 24-hour session. Addresses are saved in `data/fuji.json`.
5. Remove `DEPLOYER_PRIVATE_KEY` from the runtime `.env` after deployment. Set `NETWORK=fuji` and run `npm.cmd start`. The server needs only the session key. Never give the owner key to the agent.
6. Use a browser wallet holding the contract owner on Fuji for the dashboard revoke button. The wallet extension is prompted to submit the owner transaction. The ledger links to Avalanche's Fuji explorer.

RPC: https://api.avax-test.network/ext/bc/C/rpc · chain ID 43113. Fuji execution requires funded keys; this repository does not claim deployment without an actual recorded transaction. No official USDC or facilitator dependency is implied.

## Protocol and boundaries

`AgentWallet.sol` is also the policy module: immutable token, human owner, generation-scoped recipient allowlist, EIP-712 chain/contract-bound signatures, sequential nonce, expiry, per-call cap, exact rolling 24-hour spend, revoke and owner withdrawal. There is no arbitrary-call entry point or approval function: session keys can only invoke the wallet's token transfer path. Regrant invalidates old signatures and recipients without resetting rolling history. A session key cannot access the owner withdrawal method.

The paid endpoints implement a **custom HTTP 402 flow, not the x402 specification**. `GET /vendor/0` or `/vendor/1` returns a five-minute quote and random request ID. The agent signs and submits payment, then retries with `X-Payment-Tx` and `X-Request-Id`. The endpoint checks a successful receipt from the expected wallet and matching session, recipient, amount and request ID. A quote can be redeemed once. Quotes are in-memory and do not survive restarts; old receipts cannot authorize new quotes.

Reverted transactions cannot retain Solidity events. Blocked attempts are local audit records, with a reverted transaction hash if submission succeeded. They are not a censorship-proof on-chain rejection index. Successful payments emit `Paid`. The dashboard polls actual contract state.

This is a testnet prototype, not audited custody software. Exact rolling accounting scans active payments and can become expensive at high volume. The server control plane binds only to loopback; do not expose it publicly without authentication and durable, transactional quote storage. Fuji owner policy updates can be submitted through the ABI in `artifacts/contracts.json` using the owner wallet; runtime does not retain owner access. Deployment uses a demo token to avoid pretending arbitrary test tokens are USDC.

## Files

- `contracts/`: wallet and demo token
- `lib/`: chain setup and typed payment signing
- `server/`: paid APIs, agent, dashboard backend
- `public/`: responsive owner dashboard
- `scripts/`: compiler and Fuji deployment
- `test/`: real-EVM security tests

Do not commit `.env`, `data/`, or private keys. An archive of this project should exclude them and `node_modules/`.
