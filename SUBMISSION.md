# JebKharch submission

An interactive dashboard and serverless paid-data API for an Avalanche Fuji smart wallet with human-set policies and constrained session signing.

The proof: the deterministic harness buys three API responses, follows a poisoned transfer instruction, and receives an actual on-chain revert. The owner can revoke the key and stop further payments.

Built: wallet contract, rolling budget and replay protection, browser-owned setup and session keys, two HTTP 402 vendor fixtures, receipt verification, policy/funding/revoke controls, receipt export, public reference proofs and automated tests.

Deployment: import this repository into your hosting environment. No AI service, local process, database or private signing environment variable is required. Live users need a browser wallet and Fuji test AVAX. Source and deployment settings are documented in README.md and DEPLOYMENT.md.

Boundaries: deterministic harness, custom HTTP 402 rather than x402 compliance, demo jUSD rather than official USDC, browser-local audit history, and no independent contract audit.


## Instant demo
The homepage defaults to a browser simulation: 10 jUSD, three paid calls, a blocked poisoned drain, kill switch, policy editing and reset. All events are labelled SIMULATED and have no explorer receipts. Select Live Fuji for real testnet contracts and wallet signing. Deployment configuration is unchanged; no AI service is required.
