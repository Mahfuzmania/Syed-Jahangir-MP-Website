$ErrorActionPreference = "Stop"
$base = "http://localhost:4010"

function Get-StatusCode {
  param([scriptblock]$RequestBlock)
  try {
    $response = & $RequestBlock
    return [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode
    }
    throw
  }
}

function Add-Result {
  param(
    [ref]$Results,
    [string]$Test,
    [int]$Status,
    [int]$Expected
  )
  $Results.Value += [PSCustomObject]@{
    Test = $Test
    Status = $Status
    Expected = $Expected
    Pass = ($Status -eq $Expected)
  }
}

$results = @()

# Basic readiness probe
$probeCode = Get-StatusCode { Invoke-WebRequest -Uri "$base/en" -UseBasicParsing -TimeoutSec 4 }
Add-Result -Results ([ref]$results) -Test "GET /en (probe)" -Status $probeCode -Expected 200

$routes = @(
  "/bn", "/en",
  "/bn/profile", "/en/profile",
  "/bn/development-projects", "/en/development-projects",
  "/bn/government-projects", "/en/government-projects",
  "/bn/media-gallery", "/en/media-gallery",
  "/bn/track-request", "/en/track-request",
  "/bn/write-to-mp", "/en/write-to-mp",
  "/bn/news", "/en/news",
  "/bn/contact", "/en/contact",
  "/bn/admin/login", "/en/admin/login"
)

foreach ($path in $routes) {
  $code = Get-StatusCode { Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -TimeoutSec 6 }
  Add-Result -Results ([ref]$results) -Test "GET $path" -Status $code -Expected 200
}

$chatStartBody = '{"name":"Smoke QA","phone":"01700000000","category":"government_projects","lang":"en"}'
$chatStart = Invoke-WebRequest -Method Post -Uri "$base/api/chatbot/start" -ContentType "application/json" -Body $chatStartBody -UseBasicParsing -TimeoutSec 8
$chatStartJson = $chatStart.Content | ConvertFrom-Json
$chatStartPass = ($chatStart.StatusCode -eq 200 -and [bool]$chatStartJson.conversationId)
$results += [PSCustomObject]@{ Test = "POST /api/chatbot/start"; Status = [int]$chatStart.StatusCode; Expected = 200; Pass = $chatStartPass }

$chatMessageBody = "{`"conversationId`":`"$($chatStartJson.conversationId)`",`"message`":`"Please share project status.`"}"
$chatMsg = Invoke-WebRequest -Method Post -Uri "$base/api/chatbot/message" -ContentType "application/json" -Body $chatMessageBody -UseBasicParsing -TimeoutSec 8
$chatMsgJson = $chatMsg.Content | ConvertFrom-Json
$chatMsgPass = ($chatMsg.StatusCode -eq 200 -and @($chatMsgJson.conversation.messages).Count -ge 2)
$results += [PSCustomObject]@{ Test = "POST /api/chatbot/message"; Status = [int]$chatMsg.StatusCode; Expected = 200; Pass = $chatMsgPass }

$unauthUsers = Get-StatusCode { Invoke-WebRequest -Method Get -Uri "$base/api/admin/users" -UseBasicParsing -TimeoutSec 6 }
Add-Result -Results ([ref]$results) -Test "GET /api/admin/users (unauth)" -Status $unauthUsers -Expected 403

$qaUserScript = @'
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

const usersPath = path.join(process.cwd(), "data", "users.json");
const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

const id = randomUUID();
const email = `qa.smoke.${Date.now()}@local.test`;
const password = "QASmoke#12345";
const passwordHash = bcrypt.hashSync(password, 10);

users.push({
  id,
  name: "QA Smoke Admin",
  email,
  passwordHash,
  role: "admin",
  isActive: true,
  createdAt: new Date().toISOString()
});

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2) + "\n");
process.stdout.write(JSON.stringify({ id, email, password }));
'@

$qaUserRaw = ($qaUserScript | node - 2>$null).Trim()
if (-not $qaUserRaw) {
  throw "Failed to create QA admin user."
}
$qaUser = $qaUserRaw | ConvertFrom-Json

try {
  $loginBody = "{`"email`":`"$($qaUser.email)`",`"password`":`"$($qaUser.password)`"}"
  $loginResp = Invoke-WebRequest -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $loginBody -UseBasicParsing -SessionVariable sess -TimeoutSec 8
  Add-Result -Results ([ref]$results) -Test "POST /api/auth/login (QA user)" -Status ([int]$loginResp.StatusCode) -Expected 200

  $cookieHeader = @($loginResp.Headers["Set-Cookie"])[0]
  $cookieMatch = [regex]::Match($cookieHeader, "mp_admin_session=([^;]+)")
  if (-not $cookieMatch.Success) {
    throw "Login succeeded but session cookie was not present."
  }
  $sessionToken = $cookieMatch.Groups[1].Value
  $authSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $cookie = New-Object System.Net.Cookie
  $cookie.Name = "mp_admin_session"
  $cookie.Value = $sessionToken
  $cookie.Path = "/"
  $cookie.Domain = "localhost"
  $authSession.Cookies.Add($cookie)

  $adminContent = Get-StatusCode { Invoke-WebRequest -Method Get -Uri "$base/api/admin/content" -UseBasicParsing -WebSession $authSession -TimeoutSec 8 }
  Add-Result -Results ([ref]$results) -Test "GET /api/admin/content" -Status $adminContent -Expected 200

  $adminSubs = Get-StatusCode { Invoke-WebRequest -Method Get -Uri "$base/api/admin/submissions" -UseBasicParsing -WebSession $authSession -TimeoutSec 8 }
  Add-Result -Results ([ref]$results) -Test "GET /api/admin/submissions" -Status $adminSubs -Expected 200

  $adminChats = Get-StatusCode { Invoke-WebRequest -Method Get -Uri "$base/api/admin/chatbot" -UseBasicParsing -WebSession $authSession -TimeoutSec 8 }
  Add-Result -Results ([ref]$results) -Test "GET /api/admin/chatbot" -Status $adminChats -Expected 200

  $adminUsers = Get-StatusCode { Invoke-WebRequest -Method Get -Uri "$base/api/admin/users" -UseBasicParsing -WebSession $authSession -TimeoutSec 8 }
  Add-Result -Results ([ref]$results) -Test "GET /api/admin/users" -Status $adminUsers -Expected 200

  $invalidPatch = Get-StatusCode {
    Invoke-WebRequest -Method Patch -Uri "$base/api/admin/submissions" -UseBasicParsing -WebSession $authSession -ContentType "application/json" -Body '{"id":"non-existent","status":"processing"}' -TimeoutSec 8
  }
  Add-Result -Results ([ref]$results) -Test "PATCH /api/admin/submissions invalid id" -Status $invalidPatch -Expected 404

  $invalidUserCreate = Get-StatusCode {
    Invoke-WebRequest -Method Post -Uri "$base/api/admin/users" -UseBasicParsing -WebSession $authSession -ContentType "application/json" -Body '{"name":"Smoke","email":"bad-email","password":"12345678","role":"editor"}' -TimeoutSec 8
  }
  Add-Result -Results ([ref]$results) -Test "POST /api/admin/users invalid email" -Status $invalidUserCreate -Expected 400
}
finally {
  $cleanupScript = @'
const fs = require("fs");
const path = require("path");

const userId = process.argv[2];
if (!userId) process.exit(0);

const usersPath = path.join(process.cwd(), "data", "users.json");
const users = JSON.parse(fs.readFileSync(usersPath, "utf8")).filter((u) => u.id !== userId);
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2) + "\n");

const sessionsPath = path.join(process.cwd(), "data", "sessions.json");
const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
for (const [sid, entry] of Object.entries(sessions)) {
  if (entry && entry.userId === userId) {
    delete sessions[sid];
  }
}
fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2) + "\n");
'@
  $cleanupScript | node - "$($qaUser.id)" 2>$null | Out-Null
}

$passCount = ($results | Where-Object { $_.Pass }).Count
$totalCount = $results.Count

Write-Output "SMOKE_SUMMARY pass=$passCount total=$totalCount"
$results | Format-Table -AutoSize
