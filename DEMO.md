# Demo script — instant demo and live Fuji

1. Show the reference wallet and existing verified receipt links. Explain that this view has no server-held signing key.
2. Connect your funded Fuji browser wallet and Create My Demo Wallet. Confirm the token deployment, wallet deployment, token funding, session gas funding and policy grant.
3. Point to 10 jUSD balance, 5 jUSD allowance, two allowed vendors and the session expiry.
4. Turn on Unleash the Poison. Launch Agent. Show three confirmed payments.
5. Show RecipientNotAllowed and the reverted drain transaction. The harness deliberately follows the vendor instruction; Solidity rejects it.
6. Pull the Plug. Run again and show SessionInactive. Renewal and policy updates are owner-signed.
7. Export receipts. Use Prepare Next Demo to restore a ready session for the next run.

All prices are mock vendor data, all demo transfers are testnet jUSD, and the harness is deterministic. There is no LLM in the hosted version. The tab keeps the limited session key; the owner key stays in the wallet extension.


## Instant demo
The homepage defaults to a browser simulation: 10 jUSD, three paid calls, a blocked poisoned drain, kill switch, policy editing and reset. All events are labelled SIMULATED and have no explorer receipts. Select Live Fuji for real testnet contracts and wallet signing. Deployment configuration is unchanged; no AI service is required.
