# Pre-deployment audit — Section 16 checklist (application logic paths)
$patterns = @(
  "pakistan",
  "army",
  "military",
  "pats",
  "jla",
  "ispr",
  "ghq",
  "coas"
)

$scanPaths = @(
  "src\app\api",
  "src\lib\compliance",
  "src\lib\auth.ts",
  "src\lib\constants.ts",
  "src\middleware.ts",
  "prisma\schema.prisma"
)

$exclude = @(
  "*army-content*",
  "*army-design*",
  "*pats-content*",
  "*pats-public*",
  "*branding*",
  "*contingents*",
  "*compliance\display*"
)

Write-Host "Audit scan (logic layers)..." -ForegroundColor Cyan
$found = $false

foreach ($path in $scanPaths) {
  if (-not (Test-Path $path)) { continue }
  foreach ($pattern in $patterns) {
    $hits = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -notmatch "node_modules" } |
      Select-String -Pattern $pattern -SimpleMatch -CaseSensitive:$false
    if ($hits) {
      $found = $true
      Write-Host "Pattern '$pattern' in $path" -ForegroundColor Yellow
      $hits | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
    }
  }
}

if ($found) {
  Write-Host "`nReview hits — public marketing folders may be excluded by policy." -ForegroundColor Yellow
  exit 1
}

Write-Host "`nNo forbidden terms in core logic paths." -ForegroundColor Green
exit 0
