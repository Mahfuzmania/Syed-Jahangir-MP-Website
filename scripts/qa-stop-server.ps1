$ErrorActionPreference = "Stop"
$port = 4010
$pidFile = Join-Path $PSScriptRoot "qa-server.pid"

$stopped = @()

if (Test-Path $pidFile) {
  $storedPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($storedPid) {
    try {
      Stop-Process -Id ([int]$storedPid) -Force -ErrorAction SilentlyContinue
      $stopped += [int]$storedPid
    } catch {}
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $procIds = $conn | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $procIds) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      $stopped += $procId
    } catch {}
  }
}

$uniq = $stopped | Sort-Object -Unique
if ($uniq.Count -gt 0) {
  Write-Output ("Stopped PIDs: " + ($uniq -join ", "))
} else {
  Write-Output "No QA server processes found."
}
