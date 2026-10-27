$ErrorActionPreference = "Continue"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Fraud DAO Defense - GitHub Auto-Sync" -ForegroundColor Cyan
Write-Host " Checking every 10 seconds" -ForegroundColor Cyan
Write-Host " Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan

while ($true) {
    git add -A

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Could not stage files. Check Git status." -ForegroundColor Red
    }
    else {
        git diff --cached --quiet
        $diffExit = $LASTEXITCODE

        if ($diffExit -eq 1) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto-sync: $timestamp"

            if ($LASTEXITCODE -eq 0) {
                Write-Host "Changes committed at $timestamp" -ForegroundColor Green
            }
            else {
                Write-Host "Commit failed. Check the error above." -ForegroundColor Red
            }
        }
        elseif ($diffExit -gt 1) {
            Write-Host "Could not inspect staged changes." -ForegroundColor Red
        }
    }

    # Retry pushing any unpushed commits, including after a network failure.
    $ahead = git rev-list --count '@{u}..HEAD' 2>$null

    if ($LASTEXITCODE -eq 0 -and [int]$ahead -gt 0) {
        git push

        if ($LASTEXITCODE -eq 0) {
            Write-Host "GitHub sync successful!" -ForegroundColor Green
        }
        else {
            Write-Host "Push failed. Will retry in 10 seconds." -ForegroundColor Red
        }
    }

    Start-Sleep -Seconds 10
}
