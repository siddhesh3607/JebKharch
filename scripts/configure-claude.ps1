$ErrorActionPreference = 'Stop'
if ($PSScriptRoot) { Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot) }
$secret = Read-Host 'Anthropic API key (hidden; saved only in this project .env)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    if ([string]::IsNullOrWhiteSpace($apiKey)) { throw 'API key is required.' }
    $headers = @{ 'x-api-key' = $apiKey; 'anthropic-version' = '2023-06-01' }
    $models = Invoke-RestMethod -Method Get -Uri 'https://api.anthropic.com/v1/models' -Headers $headers -TimeoutSec 30
    $available = @($models.data | ForEach-Object { $_.id })
    if ($available.Count -eq 0) { throw 'No models available for this API account.' }
    Write-Host 'Available models:'
    $available | ForEach-Object { Write-Host "  $_" }
    $model = Read-Host 'Enter a model ID from the list'
    if ($available -notcontains $model) { throw 'Choose one of the model IDs shown above.' }
    Write-Host 'Checking one short API response...'
    $body = @{ model = $model; max_tokens = 64; messages = @(@{ role = 'user'; content = 'Reply with READY.' }) } | ConvertTo-Json -Depth 6
    $result = Invoke-RestMethod -Method Post -Uri 'https://api.anthropic.com/v1/messages' -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 60
    if (-not $result.content) { throw 'The API returned no content.' }
    $envFile = Join-Path (Get-Location) '.env'
    $lines = if (Test-Path -LiteralPath $envFile) { @(Get-Content -LiteralPath $envFile) } else { @('NETWORK=local') }
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*(ANTHROPIC_API_KEY|CLAUDE_MODEL)=' })
    $lines += "ANTHROPIC_API_KEY=$apiKey"
    $lines += "CLAUDE_MODEL=$model"
    [IO.File]::WriteAllLines($envFile, $lines, (New-Object Text.UTF8Encoding($false)))
    Write-Host 'API verified and saved locally. Restart JebKharch, then select Live Claude.' -ForegroundColor Green
} catch {
    Write-Host 'Setup did not finish. Check your API key, model access, billing and internet connection. Existing configuration has been preserved.' -ForegroundColor Yellow
    exit 1
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $apiKey = $null
    $headers = $null
}
