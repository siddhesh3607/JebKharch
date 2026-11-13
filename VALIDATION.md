# Fuji validation

Deployed and verified on Avalanche Fuji, chain ID 43113.

- Three paid API requests: confirmed successful receipts.
- Poisoned drain: confirmed reverted receipt, RecipientNotAllowed.
- Owner revocation: confirmed.
- Payment after revocation: confirmed reverted receipt, SessionInactive.
- Session renewed for use, preserving rolling spend.
- Final wallet balance: 7 jUSD. Rolling allowance remaining: 2 jUSD.
- Live Claude not tested; deterministic harness used.
- Transaction evidence: deployment/fuji-verification.json.
