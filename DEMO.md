# JebKharch — live demo guide

## Open it

On this computer, double-click `Start-JebKharch.cmd`, then open http://127.0.0.1:3000. If it is already running, just open the URL.

The Desktop checkout is configured for the real Avalanche Fuji contracts. Private keys stay on this computer. The code download excludes them.

## A clean demonstration, every time

1. Go to **The rules → Owner Desk**. Choose **Local test owner / this computer** for the built-in demo. You can instead use the owning account through **Connect Wallet** in Chrome/Edge with a wallet extension.
2. Click **Prepare Next Demo**. Wait for confirmation. This tops up the wallet to 10 jUSD, renews the session for 24 hours, and grants 5 jUSD of available rolling allowance. It raises the total cap to account for previous spend, without erasing history.
3. Turn on **Unleash the Poison** and click **Launch Agent**.
4. Watch three 1-jUSD payments confirm in the money trail. The vendor returns headphone quotes.
5. The poisoned response asks for a wallet drain. The harness attempts it; Solidity rejects it with **RecipientNotAllowed**. Follow its transaction link to see the reverted receipt.
6. Click **Pull the Plug**. Wait for the confirmed owner revocation, then launch again. All attempted payments are blocked with **SessionInactive**. Revocation also remains available while an agent mission runs.
7. Click **Prepare Next Demo** to restore a ready session for the next viewer.

## Suggested narration

"The agent holds a session key, not the owner's authority. It can pay these two vendors, within a per-call and rolling-day budget. Now the vendor tries to instruct it to drain the account. Our attack harness follows that instruction. The contract refuses the payment. I can also revoke the key on-chain. The prompt doesn't decide the budget; Solidity does."

## Try the other controls

- Change per-call and daily caps, expiry and recipient allowlist in **Edit Policy / Renew Session**.
- Deposit tokens, withdraw to a chosen address, or top up the agent's gas under **Fund / Withdraw / Session Gas**.
- Connect Wallet shows the selected browser account and network. A non-owner can view and deposit, but cannot change policy or withdraw.
- Live Claude is disabled until local API credentials are configured. The deterministic attack harness is ready without any AI API key.

## Portable offline-chain demo

On another computer, extract the ZIP, install Node.js, and double-click `Start-Local-Demo.cmd`. It installs dependencies on first launch and runs the exact wallet logic on a local EVM with fresh test funds. No private keys, faucet or Claude account are needed. Dependency installation still needs internet.

## Evidence

`deployment/demo-ready.json` records the latest real Fuji payments, blocked drain, revocation, revoked-key attempts and final ready state. Earlier evidence is also retained in `deployment/`.

This is a testnet prototype with demo jUSD and a custom HTTP 402 protocol. The harness deliberately follows the injected instruction; it is not evidence that Claude itself was compromised.
