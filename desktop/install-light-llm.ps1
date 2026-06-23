param(
  [string] $Model = "llama3.2:1b"
)

$ErrorActionPreference = "Stop"
$LogPath = Join-Path $env:TEMP "magistra-llm-install.log"

function Write-Log {
  param([string] $Message)
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  Write-Host $line
  Add-Content -LiteralPath $LogPath -Value $line
}

function Find-Ollama {
  $command = Get-Command "ollama" -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $candidates = @(
    (Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"),
    (Join-Path $env:LOCALAPPDATA "Ollama\ollama.exe"),
    (Join-Path $env:ProgramFiles "Ollama\ollama.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }

  return $null
}

function Wait-OllamaApi {
  param([int] $TimeoutSeconds = 60)

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 | Out-Null
      return $true
    }
    catch {
      Start-Sleep -Seconds 2
    }
  }

  return $false
}

try {
  "" | Set-Content -LiteralPath $LogPath
  Write-Log "Magistra local LLM bootstrap started. Model: $Model"

  $ollama = Find-Ollama
  if (-not $ollama) {
    Write-Log "Ollama not found. Installing from official install.ps1."
    $installer = Invoke-RestMethod -Uri "https://ollama.com/install.ps1" -UseBasicParsing
    Invoke-Expression $installer
    Start-Sleep -Seconds 5
    $ollama = Find-Ollama
  }

  if (-not $ollama) {
    throw "Ollama executable not found after installation."
  }

  Write-Log "Ollama executable: $ollama"

  if (-not (Wait-OllamaApi -TimeoutSeconds 15)) {
    Write-Log "Ollama API not responding. Starting ollama serve."
    Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Hidden | Out-Null
  }

  if (-not (Wait-OllamaApi -TimeoutSeconds 90)) {
    throw "Ollama API did not become available on http://127.0.0.1:11434."
  }

  Write-Log "Pulling model: $Model"
  & $ollama pull $Model
  if ($LASTEXITCODE -ne 0) {
    throw "ollama pull exited with code $LASTEXITCODE."
  }

  Write-Log "Model ready: $Model"
  exit 0
}
catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  exit 1
}
