# ReviewSmart AI - 1-Click Automated Hostinger Build & Release Package
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ReviewSmart AI - Hostinger Zero-Downtime Release Engine " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host ">>> Step 1: Building optimized standalone production bundle..." -ForegroundColor Yellow
npm run build:hostinger

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting release." -ForegroundColor Red
    exit 1
}

$standalonePath = ".next\standalone"
$zipPath = "reviewsmart-hostinger-release.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Write-Host ">>> Step 2: Packaging standalone bundle to $zipPath..." -ForegroundColor Yellow
Compress-Archive -Path "$standalonePath\*" -DestinationPath $zipPath -Force

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host (">>> Standalone bundle compressed: {0:N2} MB" -f $zipSize) -ForegroundColor Green
Write-Host ">>> SUCCESS! reviewsmart-hostinger-release.zip is ready for Hostinger upload." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
