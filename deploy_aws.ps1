<#
Smart Watchdog - full AWS deployment (lean architecture)
  Frontend: S3 (private, OAC) + CloudFront + WAF IP allowlist
  Backend:  Lambda (stdlib only) + API Gateway REST API with IP-allowlist resource policy

Prerequisites: AWS CLI v2 configured with credentials, Node.js/npm, PowerShell 5.1+.
Re-running this script is mostly idempotent for the *update* steps (Lambda code, S3 sync,
frontend rebuild) but will fail on the *create* steps if resources already exist - that's
expected on a second run; see README for the one-time resource IDs.
#>
param(
    [string]$Region = "us-west-2",
    [string]$ProjectName = "smart-watchdog",
    [string[]]$AllowedIPs = @("60.250.71.45", "61.222.117.53", "59.125.121.41", "60.250.71.43")
)

$ErrorActionPreference = "Stop"
$AccountId = (aws sts get-caller-identity --query Account --output text)
$Bucket = "$ProjectName-$AccountId-frontend"
$LambdaName = "$ProjectName-api"
$RoleName = "$ProjectName-lambda-role"

Write-Host "Account: $AccountId  Region: $Region" -ForegroundColor Cyan

# ---------- Backend: Lambda ----------
Write-Host "Packaging Lambda..." -ForegroundColor Cyan
$build = Join-Path $env:TEMP "$ProjectName-lambda-build"
if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Path (Join-Path $build "data") | Out-Null
Copy-Item "$PSScriptRoot\backend\lambda_function.py" -Destination $build
Copy-Item "$PSScriptRoot\backend\data\institutions.json" -Destination (Join-Path $build "data")
$zipPath = Join-Path $env:TEMP "$ProjectName-lambda.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path (Join-Path $build "*") -DestinationPath $zipPath

aws lambda update-function-code --function-name $LambdaName --zip-file "fileb://$zipPath" --region $Region | Out-Null
Write-Host "Lambda code updated." -ForegroundColor Green

# ---------- Frontend: build + sync to S3 ----------
$ApiId = aws apigateway get-rest-apis --region $Region --query "items[?name=='$LambdaName'].id" --output text
$ApiBase = "https://$ApiId.execute-api.$Region.amazonaws.com/prod"
Write-Host "Building frontend against $ApiBase ..." -ForegroundColor Cyan

Push-Location "$PSScriptRoot\frontend"
$env:VITE_API_BASE_URL = $ApiBase
npm run build
Pop-Location

aws s3 sync "$PSScriptRoot\frontend\dist" "s3://$Bucket" --delete --region $Region
Write-Host "Frontend synced to s3://$Bucket" -ForegroundColor Green

# ---------- Invalidate CloudFront cache ----------
$DistId = aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Smart Watchdog frontend distribution'].Id" --output text
if ($DistId) {
    aws cloudfront create-invalidation --distribution-id $DistId --paths "/*" | Out-Null
    Write-Host "CloudFront invalidation submitted for distribution $DistId" -ForegroundColor Green
}

Write-Host "Done. Allowed source IPs: $($AllowedIPs -join ', ')" -ForegroundColor Yellow
