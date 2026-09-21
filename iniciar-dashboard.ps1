$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$host.UI.RawUI.WindowTitle = "Dashboard de Trafego Pago"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Dashboard de Trafego Pago" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando o servidor, aguarde..."
Write-Host ""

$logFile = Join-Path $env:TEMP "trafego-dashboard-dev.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" `
    -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" `
    -WindowStyle Hidden -PassThru

$url = $null
$timeout = 60
$elapsed = 0
while (-not $url -and $elapsed -lt $timeout -and -not $proc.HasExited) {
    Start-Sleep -Seconds 1
    $elapsed++
    if (Test-Path $logFile) {
        $match = Select-String -Path $logFile -Pattern "Local:\s+(http://localhost:\d+)" -ErrorAction SilentlyContinue
        if ($match) {
            $url = $match.Matches[0].Groups[1].Value
        }
    }
}

if (-not $url) {
    Write-Host "Nao foi possivel iniciar o servidor." -ForegroundColor Red
    Write-Host "Log: $logFile"
    Read-Host "Pressione ENTER para sair"
    exit 1
}

Write-Host "Dashboard pronto em: $url" -ForegroundColor Green
Start-Process $url

Write-Host ""
Write-Host "O servidor esta rodando (PID $($proc.Id))."
Write-Host "NAO FECHE esta janela enquanto estiver usando o dashboard."
Write-Host "Para DESLIGAR o dashboard, feche esta janela."
Write-Host ""

try {
    Wait-Process -Id $proc.Id
}
finally {
    if (-not $proc.HasExited) {
        Start-Process -FilePath "taskkill.exe" -ArgumentList "/PID", "$($proc.Id)", "/T", "/F" -WindowStyle Hidden -Wait
    }
}
