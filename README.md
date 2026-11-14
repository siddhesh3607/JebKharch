# JebKharch — Vercel edition

Pocket money for agents, enforced by Solidity on Avalanche Fuji. The hosted version is a browser-wallet dApp plus two short, stateless Vercel API endpoints. It has no AI runtime, background worker, server signing key, database or writeable-filesystem dependency.

## Deploy on Vercel

1. Import `siddhesh3607/JebKharch` from GitHub.
2. Use the repository root as the Root Directory.
3. Framework Preset: **Other**. Node.js: **22.x**.
4. Leave settings at their repository defaults: Install `npm ci`, Build `npm run build`, Output `dist`.
5. **No environment variables are required.** Do not upload the old private `.env` or add owner/session keys to Vercel.
6. Deploy. Check `/api/health`, then open the homepage.

`vercel.json` supplies these settings. `api/vendor.js` and `api/health.js` are Node serverless functions; the rest of the application is served as static files. Optional `FUJI_RPC_URL` can select a different trusted Fuji RPC, but is not needed for a default deployment.

## Use the hosted demo

The initial view shows the original deployed wallet and historical verified Fuji receipts. It is a reference, not a shared signing account. Viewing these receipts requires no wallet or API key.

To make live payments:

1. Open the site in Chrome/Edge with MetaMask or Core.
2. Connect a browser account funded with **Fuji test AVAX**. Get free test tokens from https://build.avax.network/console/primary-network/faucet.
3. Click **Create My Demo Wallet**. The setup deploys a demo jUSD token, deploys your AgentWallet, deposits 10 jUSD, funds a separate session with 0.002 test AVAX for gas, and grants its policy. Expect up to five wallet confirmations. Completed steps are saved, so retry if you cancel midway.
4. Enable **Unleash the Poison**, then **Launch Agent**. A deterministic harness buys three 1-jUSD vendor calls. Its injected drain attempt should revert with `RecipientNotAllowed`.
5. **Pull the Plug** revokes the session on-chain, including while a mission is running. Subsequent payments revert with `SessionInactive`.
6. **Prepare Next Demo** tops up to 10 jUSD and grants 5 jUSD of available rolling allowance. The total cap includes previous spend for that session. Policy changes, deposits, withdrawal and session gas top-up are all available under Owner Desk.

Owner keys stay in your wallet extension. A separate, limited **testnet session key** stays in this browser tab's sessionStorage; it is never uploaded to the server. Public contract metadata and audit rows are kept in localStorage. Clearing/closing browser session data can lose the session key; the owner can authorize a new session from Owner Desk. Renewal without the old key first requests revocation of the previous active session, then grants a replacement. Only the owning account can grant policies, withdraw, or revoke.

The app is a policy/security demo, **not an LLM**. There is no local model, hosted inference subscription or AI API key. Vendor responses are mock price data; real transfers and reverts happen on Fuji. jUSD is a demo token, not official USDC.

## Local development

```powershell
npm ci
npm run build
npm test
npm start
```

Open http://127.0.0.1:3000. Local development serves the same static build and function handlers; it does not create a private local blockchain or retain an owner signer. Live interactions still use Fuji and your browser wallet. Automated tests use an isolated Ganache EVM and require no wallet funds.

## Payment protocol

`GET /api/vendor?vendor=0&wallet=0x...&session=0x...` returns HTTP 402 with a five-minute quote. The quote's request ID binds the chain, wallet, session, token, vendor, recipient, amount, nonce, expiry and poison setting. The session signs an EIP-712 payment, submits it directly to Fuji, and POSTs `{quote, tx}` to the endpoint. The function checks the matching AgentWallet `Paid` event **and** token `Transfer` event in the successful receipt before serving data.

This is a **custom HTTP 402 flow, not x402 compatibility**. Redeeming an already-paid, unexpired quote is intentionally idempotent: it returns the same price fixture without another charge. This makes the service stateless on Vercel. Transaction nonce/signature replay remains rejected by the wallet contract. A different or tampered quote cannot use the same receipt.

The ledger contains this browser's audit rows plus explicitly labeled reference evidence. Blocked rows with hashes point to reverted receipts; failures before submission may have no hash. Export downloads the current browser ledger as JSON. It is not a global blockchain index or censorship-proof rejection log.

## Files

- `contracts/`: wallet, policy checks and demo ERC-20
- `public/`: dashboard, browser wallet/session controller, logo assets
- `api/`: Vercel vendor and health handlers
- `lib/payment-protocol.mjs`: stateless quote/receipt validation
- `scripts/build.mjs`: static assets, browser ethers and contract artifacts
- `scripts/dev.mjs`: local adapter for the same Vercel handlers
- `test/`: contract, browser-controller, network-provider and serverless tests
- `deployment/`: public historical Fuji addresses and receipts

The original wallet is `0xa8Aa77610fc6bDD3864BDBB168001F3D9286EAe6`. It remains a reference. A new connected account must create its own wallet to control funds. Contract tests are not an independent security audit. Exact rolling accounting is suited to a small demo, not high-volume production custody.
