# Free local AI — no API key

This project now includes a real, local Qwen2.5-0.5B-Instruct model served by the CPU build of llama.cpp. No Anthropic, OpenAI or Ollama account is needed. The model API runs only on this computer at http://127.0.0.1:8087.

## Start on this computer

Open http://127.0.0.1:3000 and choose **Local AI / ready - no API key** in Mission Control. Click **Prepare Next Demo** in Owner Desk if the allowance is low, then **Launch Agent**.

The workflow buys three paid data calls through the wallet, computes the cheapest offer deterministically, and asks the local model to generate a recommendation using those verified facts. The answer is shown in the outcome banner and ledger. If the tiny model misattributes the winner, the explanation is withheld and the verified comparison is shown instead. It is a real inference request, with a grounded result, rather than a simulated Claude response.

## Run the full download elsewhere

Extract JebKharch.zip on a Windows x64 computer. Install Node.js 20+ (22 recommended), then double-click **Start-JebKharch.cmd**. Dependencies install on the first run. The included model/runtime starts automatically. With no private .env, the download uses a fresh local blockchain with funded demo accounts. The original Desktop checkout retains its private Fuji configuration.

If you download source without runtime assets, double-click **Setup-Free-AI.cmd** to download and verify the official runtime and model, then start the app. Initial dependency/model downloads need internet. Local inference itself needs no internet. Fuji payments still require network connectivity and test AVAX.

## Modes

- **Local AI**: a fixed paid research workflow plus genuine local model explanation. No model API key. Vendor instructions are excluded from the model's facts, and this workflow does not expose a transfer tool to the model.
- **Attack harness**: deliberately follows the poisoned vendor instruction so the on-chain rejection can be demonstrated repeatedly.
- **Live Claude**: optional autonomous tool-use mode for users who later configure their own Anthropic credentials.

## Hardware and sources

The chosen model is small enough for this 8 GB RAM computer and runs on CPU. It is less capable than a hosted frontier model; numeric results are verified in code. Model file is about 491 MB. Runtime and model are stored under runtime/ inside the project, with source URLs, SHA-256 checksums and license notices.

Runtime source: https://github.com/ggml-org/llama.cpp/releases/tag/b12383

Model source: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF

No payment keys or private .env are included in the downloadable project.
