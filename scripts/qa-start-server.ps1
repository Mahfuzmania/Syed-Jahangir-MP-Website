$ErrorActionPreference = "Stop"
$port = 4010
$pidFile = Join-Path $PSScriptRoot "qa-server.pid"
$outFile = Join-Path $env:TEMP "qa-next4010-out.log"
$errFile = Join-Path $env:TEMP "qa-next4010-err.log"

# Stop existing process by PID file if present.
if (Test-Path $pidFile) {
  $existingPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($existingPid) {
    try { Stop-Process -Id ([int]$existingPid) -Force -ErrorAction SilentlyContinue } catch {}
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# Stop anything already listening on the QA port.
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $procIds = $conn | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $procIds) {
    try { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue } catch {}
  }
}

if (Test-Path $outFile) { Remove-Item $outFile -Force }
if (Test-Path $errFile) { Remove-Item $errFile -Force }

$startCommand = "set JWT_SECRET=change-this-dev-jwt-secret&& npm run start -- --port $port"
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $startCommand -PassThru -WorkingDirectory "." -RedirectStandardOutput $outFile -RedirectStandardError $errFile
Set-Content -Path $pidFile -Value $proc.Id

Write-Output "QA server started on http://localhost:$port"
Write-Output "PID: $($proc.Id)"
Write-Output "STDOUT: $outFile"
Write-Output "STDERR: $errFile"
