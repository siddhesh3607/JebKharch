# Validation

- Contract security tests: passed (real local EVM).
- API owner lifecycle tests: passed, including fund, withdraw, revoke, renewal, rolling-spend preservation, malicious origin rejection, custom control header, and unmatched receipt rejection.
- Fuji: actual owner deposit, withdrawal, revoke and renewal confirmed; see deployment/owner-controls-verification.json.
- Fuji: another three-call mission completed; drain transaction reverted with RecipientNotAllowed.
- Current state after verification: 6 jUSD balance, 10 jUSD rolling cap, 2 jUSD remaining. Owner Desk can raise the cap for another full mission. Prior rolling spend is intentionally preserved.
- Connect Wallet button, missing-extension guidance, Fuji state, and owner editor checked in the in-app browser.
- A live browser-extension signing flow was not tested; the in-app browser has no wallet provider.
- Live Claude remains untested without ANTHROPIC_API_KEY and CLAUDE_MODEL. The configured deterministic harness is fully functional.
- jUSD is a demo ERC-20. HTTP 402 protocol is custom, not x402 compatibility.
- Local test owner is a localhost demo signer, not a production custody setup. Private .env is excluded from Git and downloads.
