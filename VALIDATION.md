# Validation results

- Real EVM contract security test: passed.
- Dashboard HTTP 200; vendor HTTP 402.
- Poisoned harness: three payments, 7 jUSD balance, 2 jUSD rolling allowance.
- Drain transaction reverted: RecipientNotAllowed.
- Owner revoke confirmed; subsequent payments reverted: SessionInactive.
- Fuji public RPC chain ID verified: 43113.
- Fuji deployment not performed: funded signing keys not configured.
- Redesigned dashboard visually checked in the in-app browser; live contract values populate correctly.
- Live Claude not tested.
