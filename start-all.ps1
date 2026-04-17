$root = $PSScriptRoot

Write-Host "Killing any processes on ports 3000, 1234, 5173..." -ForegroundColor Gray
wsl bash -lc "fuser -k 3000/tcp 1234/tcp 5173/tcp 2>/dev/null; true"

Start-Sleep -Seconds 1

Write-Host "Starting Backend (WSL + Node 22)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "wsl bash -lc '. ~/.nvm/nvm.sh; nvm use 22 >/dev/null; cd /mnt/c/Users/asdul/OneDrive/Desktop/Winter2026/webDev/project/csci3230-group-project/backend; npm run dev'"

Start-Sleep -Seconds 2

Write-Host "Starting Yjs WebSocket Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "wsl bash -lc '. ~/.nvm/nvm.sh; nvm use 22 >/dev/null; cd /mnt/c/Users/asdul/OneDrive/Desktop/Winter2026/webDev/project/csci3230-group-project/backend; npm run yjs:dev'"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\web-dev-project'; npm run dev"

Write-Host ""
Write-Host "All services starting in new windows!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Yjs:      ws://localhost:1234" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
