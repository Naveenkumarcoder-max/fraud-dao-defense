
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host "Fraud DAO Defense - GitHub Auto-Sync" -ForegroundColor Cyan
Write-Host "Checking for changes every 10 seconds..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

while ($true) {
    git add -A

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Staging failed. Check Git status." -ForegroundColor Red
    }
    else {
        git diff --cached --quiet
        $diffExit = $LASTEXITCODE

        if ($diffExit -eq 1) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto-sync: $timestamp"
        }
        elseif ($diffExit -gt 1) {
            Write-Host "Could not check staged changes." -ForegroundColor Red
        }
    }

    $ahead = git rev-list --count '@{u}..HEAD' 2>$null
    $upstreamOK = $LASTEXITCODE -eq 0

    if ($upstreamOK -and [int]$ahead -gt 0) {
        git push

        if ($LASTEXITCODE -eq 0) {
            Write-Host "GitHub sync successful!" -ForegroundColor Green
        }
        else {
            Write-Host "Push failed. Will retry shortly." -ForegroundColor Red
        }
    }

    Start-Sleep -Seconds 10
}
