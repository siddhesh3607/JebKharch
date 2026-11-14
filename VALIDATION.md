# Vercel migration validation

Checked 14/11/2026, 11:11:36 pm IST.

- npm run build: PASS. Static dist output, browser ethers and contract bytecode are generated with no runtime model or signing secrets.
- npm test: PASS, 7 tests, 0 failures. Contract policy security, complete browser-controller lifecycle, wallet-provider switching/rejection, stateless vendor receipt/tamper/expiry/idempotency, and health handler.
- npm run doctor: PASS. Node 22 and Vercel build/output settings are consistent.
- Real Fuji verification: new owned demo wallet 0x937AAC76a3f0b254fdABC852fC09c7882469cca1; three paid vendor responses, RecipientNotAllowed drain revert, owner revoke, SessionInactive payment revert. All submitted receipt statuses were independently checked. Evidence: deployment/vercel-fuji-verification.json.
- Local Vercel-style HTTP checks: homepage, config.json, browser ethers, logo, manifest and health endpoint returned HTTP 200.
- Browser QA: reference state loaded, six verified proof rows visible, new onboarding present, local AI and server-owner modes absent, logo loaded, no console errors observed.

## Deployment boundaries

The serverless endpoints and exact browser transaction controller were exercised against Fuji using a local disposable test signer. Actual MetaMask/Core consent UI was not automated. Vercel account deployment has not been performed; import the public repository and use the included vercel.json defaults. External RPC uptime, wallet extension availability and Fuji test AVAX are required for live use. No environment variables are mandatory and no private keys belong on Vercel.

The current source and build exclude the local model and its code. An ignored legacy runtime directory may remain in the developer checkout; it is excluded by Git and .vercelignore and is never loaded.
