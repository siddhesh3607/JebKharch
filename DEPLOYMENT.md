# Deployment guide

Repository: https://github.com/siddhesh3607/JebKharch

- Framework: Other
- Root directory: repository root
- Node: 22.x
- Install: npm ci
- Build: npm run build
- Output: dist
- Environment variables: none required

Do not add DEPLOYER_PRIVATE_KEY, SESSION_PRIVATE_KEY, model endpoints, or local runtime paths to the hosting environment. The browser signs transactions and the vendor functions only verify public receipts.

After deployment:

1. Visit /api/health: expect ok=true and requiresServerPrivateKey=false.
2. Homepage, CSS, logo and favicon should load.
3. Original Fuji receipts should be visible without signing in.
4. For a live demo, connect a funded Fuji browser wallet and click Create My Demo Wallet.
5. Approve the setup transactions; enable Poison, then Launch Agent.
6. Check payments, reverted drain receipt, revoke, and Prepare Next Demo.

If the hosting dashboard already has an older imported project, reset any old Build/Output overrides to the values above and redeploy the latest main commit. Do not set a persistent server Start Command. If a browser has no wallet extension, use Chrome/Edge with MetaMask or Core; the reference evidence remains viewable without an extension.

Network, wallet confirmation, test AVAX availability and external RPC uptime are runtime dependencies. This repository eliminates the previous local-model and persistent-server deployment requirements; it cannot guarantee availability of external services.


## Instant demo
The homepage defaults to a browser simulation: 10 jUSD, three paid calls, a blocked poisoned drain, kill switch, policy editing and reset. All events are labelled SIMULATED and have no explorer receipts. Select Live Fuji for real testnet contracts and wallet signing. Deployment configuration is unchanged; no AI service is required.
