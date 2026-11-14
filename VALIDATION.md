# JebKharch — Full test report

Checked 14/11/2026, 11:33:08 pm IST.

## Results

| Test area | Result |
| --- | --- |
| Automated contract/controller/API/provider suite | PASS: 12 tests, 0 failures after fixes |
| Production build | PASS: npm run build |
| Deployment diagnostics | PASS: npm run doctor |
| HTTP smoke/security checks | PASS: 17 routes/status checks, including private-file/traversal rejection and removed owner API |
| Real Fuji workflow | PASS: new wallet creation, three paid API calls, drain revert, revoke, revoked-key revert |
| Receipt checks | PASS: 11 recorded Fuji receipts reverified; fresh run evidence also recorded |
| Browser filtering/export | PASS: reference filtering, valid JSON download with no privateKey field |
| Browser wallet fallback | PASS: actionable missing-extension message |
| Responsive layout | PASS: no horizontal overflow at 390px and 1440px; logo loaded |
| Browser console | No errors observed during browser checks |
| Production dependency audit | PASS: 0 reported vulnerabilities |

## Issues fixed

1. Replacing a lost browser-tab session previously left the old key active. Renewal now revokes the old active session before granting a replacement. A regression test confirms revocation.
2. Upgraded ethers from 6.15.0 to 6.17.0 to remove the flagged production ethers/ws advisories.
3. Updated the compiler to solc 0.8.38 and pinned its tmp dependency to 0.2.7.
4. Contract test fixtures explicitly select an isolated local network, so tests cannot accidentally use a configured Fuji wallet.

## Covered security cases

Recipient allowlist; per-call and rolling caps; expiry; nonce replay; signature tampering; chain/contract domain separation; old-signature invalidation after policy renewal; non-owner rejection; failed-transfer rollback of nonce/spend; matching Paid and Transfer events; wrong amount/token/wallet/recipient rejection; reverted receipts; quote tampering/expiry; idempotent paid-quote redemption; malformed requests; RPC outage handling; browser provider rejection and network addition.

## Remaining dependency advisory scope

The full development dependency audit flags 7 packages (1 critical, 5 high, 1 moderate), all in the Ganache development/test dependency tree: @trufflesuite/uws-js-unofficial, bn.js, elliptic, ganache, lodash, secp256k1, ws. They are not imported by or deployed with the serverless API runtime. This report does not claim the full development dependency tree is advisory-free.

## Evidence and limits

Fresh Fuji controller smoke wallet: 0x7e434b072964f6ecc491B12943E0581B57F8aFd9. See deployment/browser-fuji-verification.json for transaction hashes. The exact controller used on the website was exercised using a local disposable test signer; actual MetaMask/Core permission and signing dialogs were not automated.

GitHub CI runs the tests and build on Ubuntu; current status is at https://github.com/siddhesh3607/JebKharch/actions/workflows/test.yml.

No hosted deployment URL was found in this repository's deployment records. The production build and serverless handlers were tested locally; actual hosted behavior still needs a deployed URL. External RPC availability and test AVAX remain necessary. This is functional/security regression testing, not an independent smart-contract audit.
