# JebKharch submission notes

## One-line pitch

Pocket money for AI agents: session-key payments governed by Solidity, with human-controlled budgets and an on-chain kill switch.

## What is built

- AgentWallet contract with EIP-712 signatures, nonce replay protection, immutable payment token, generation-scoped recipient allowlist, per-call and rolling 24h caps, expiry, and revocation.
- Two paid vendor endpoints with a custom HTTP 402 quote-and-receipt flow, durable single-use quote journal, and confirmed payment checks.
- Deterministic attack harness plus optional Claude tool-use integration.
- Owner dashboard with browser wallet connection, local test-owner mode, policy editor, funding, withdrawal, session gas, renewal, and a live receipt ledger with filters/export.
- Avalanche Fuji deployment, recorded successful and reverted receipts, automated contract/API/agent/provider tests and a local-chain fallback.

## 90-second presentation

0–15 seconds: Show wallet balance, allowance and the two allowed vendors. Explain that the agent has a separate signing key; it cannot grant itself new permissions.

15–35 seconds: Enable the poisoned response and launch the harness. Watch the three paid requests succeed and open a successful Fuji receipt.

35–60 seconds: The poisoned vendor asks the harness to drain the balance to an unapproved address. Show the blocked row and reverted transaction. Explain the recipient policy is enforced before token transfer.

60–75 seconds: Revoke the session and run again. Show SessionInactive. Revocation takes effect after the owner transaction confirms.

75–90 seconds: Export the receipts, then use Prepare Next Demo. Explain that renewal preserves the rolling spend history and the owner explicitly increases the cap to grant more allowance.

## Honest boundaries

The repeatable presentation uses a deterministic harness that deliberately follows malicious instructions. It is not evidence that Claude itself was compromised. Live Claude integration is implemented and covered by controlled-response tests, but needs a real API key to run. The payment protocol is custom HTTP 402, not claimed x402 specification compatibility. jUSD is a demo ERC-20, not official USDC. The local owner signer is a testnet convenience; browser-only ownership is available. The contracts have functional tests but have not received an independent security audit.

## Evidence

Public contract addresses: deployment/fuji.json.

Most recent end-to-end run and restored ready state: deployment/demo-ready.json.

Additional verified receipts: deployment/latest-receipt-check.json.

All code lives in the JebKharch folder. Runtime keys are excluded from the source download.
