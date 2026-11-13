# JebKharch test report

Tested: 14/11/2026, 1:37:08 am IST

## Results

| Check | Result |
| --- | --- |
| npm test | PASS: 2 automated tests with multiple contract/API assertions; 0 failures |
| Signature integrity and nonce replay | PASS |
| Recipient allowlist and per-call limit | PASS |
| Rolling cap, expiry and budget preservation | PASS |
| Owner access, funding and withdrawal | PASS |
| Revocation during an active local mission | PASS |
| Prepare Next Demo | PASS: balance restored, renewed session, spend preserved |
| HTTP 402 and unmatched receipt rejection | PASS |
| Cross-origin and missing control-header rejection | PASS |
| Live Fuji three-call mission | PASS: three confirmed payments |
| Live Fuji poisoned drain | PASS: reverted RecipientNotAllowed |
| Live Fuji revocation | PASS: subsequent payments reverted SessionInactive |
| Independent receipt verification | PASS: 12 Fuji receipts matched expected status; wallet bytecode present |
| Dashboard | PASS: wallet connection feedback, owner mode, live values, ledger, header/footer |
| Browser console | No errors observed |
| Horizontal overflow | None observed at tested viewport |

## Ready state after testing

Wallet: 0xa8Aa77610fc6bDD3864BDBB168001F3D9286EAe6

Balance: 10.0 jUSD. Available rolling allowance: 5.0 jUSD. Session active. Total rolling cap: 19.0 jUSD, including 14.0 jUSD already spent.

## Verification limits

The in-app browser has no injected wallet extension, so actual MetaMask/Core connection and browser-wallet transaction signing were not exercised. Missing-provider guidance was verified. Local test-owner signing was used for confirmed Fuji owner operations. Live Claude was not exercised because API credentials are absent. Tests use the deterministic harness and demo jUSD with the custom HTTP 402 protocol. This is functional testing, not a contract security audit.

## Evidence

See deployment/demo-ready.json for the latest mission, reverted transactions, owner revocation, and restoration hashes. See deployment/latest-receipt-check.json for independently fetched receipt status and block numbers.
