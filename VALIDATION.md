# Key-free AI completion report

Tested 14/11/2026, 10:35:09 pm IST.

- Installed a CPU-only llama.cpp server and the official Qwen2.5-0.5B-Instruct Q4_K_M model inside runtime/. Download sources and SHA-256 hashes are recorded in runtime/sources.json.
- Local API confirmed running at 127.0.0.1:8087. No hosted model key, account or subscription.
- All 12 automated tests passed, including local AI fact isolation and withholding an invalid model explanation.
- Real Fuji local-AI workflow confirmed three paid calls and a genuine, fact-checked local-model recommendation.
- Recommendation: The winning vendor for wireless headphones is Bazaar Insights, with an INR 2499 price. This is the cheapest option and saves INR 200.
- Public transaction evidence: deployment/local-ai-verification.json.
- Browser checked: local mode is enabled and selected; live model result appears in the banner and ledger; no console errors observed.
- Restored: 10.0 jUSD balance; 5.0 jUSD allowance; active session.

The paid workflow is orchestrated by code; its price comparison is deterministic and the model writes the grounded explanation. This mode does not give the model arbitrary payment tools or follow poisoned instructions. Use Attack harness for the deliberate drain-attempt demonstration. Live Claude remains optional, not required.

The full Windows x64 project bundle includes model/runtime assets. Node.js is required and npm dependencies install on first launch. The original Desktop checkout is configured for Fuji. The download excludes private keys and runs a local chain by default.
