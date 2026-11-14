# JebKharch — Pocket money for AI agents

A smart wallet on Avalanche Fuji with spending caps, recipient allowlists, scoped session keys, expiry and a kill switch. The purple-and-lime dashboard runs real testnet payments; there is no simulation or local AI dependency.

## Deploy

Import this GitHub repository into Vercel. Use the repository root, Framework **Other**, Node **22.x**, Install **npm ci**, Build **npm run build**, and Output **dist**. No environment variables are required. Never upload `.env` or private keys. The configuration is supplied in `vercel.json`.

## Run the Fuji demo

1. Connect MetaMask or Core in Chrome/Edge. Fund your browser account with Fuji test AVAX using the linked faucet.
2. Click **Create My Demo Wallet**. Approve the setup transactions to deploy your token and wallet, deposit 10 jUSD, fund session gas and grant a 1-per-call / 5-per-day session.
3. Enable **Unleash the Poison** and click **Launch Agent**. Three actual paid API calls leave 7 jUSD and 2 of allowance. The malicious drain reverts because its recipient is not allowed.
4. Click **Pull the Plug** and approve the owner revocation. Use **Prepare Next Demo** to top up and renew.

The initial view shows verified historical receipts from the original wallet. Its owner key is never shared with visitors. Each visitor creates and controls their own instance. Owner actions require wallet confirmation; a limited session key stays in the browser tab for agent payments.

The mission is a deterministic attack harness, not an LLM. APIs use a custom HTTP 402 protocol, not x402 compatibility. jUSD is a demo asset, not official USDC. The local audit ledger can be exported; successful payments and submitted reverts link to actual Fuji receipts.

## Local development

Use Node 22, run `npm ci`, `npm test`, `npm run build`, then `npm start`. Open http://127.0.0.1:3000. Production APIs are stateless serverless functions; no persistent disk, server signer or background process is required.

The earlier one-click local-owner version is preserved on Git branch `backup/original-local-fuji-09742ea` locally. Contracts are not independently audited. See DEMO.md for presentation steps and TEST-REPORT.md for prior validation and limitations.
