param(
    [string]$Region = "us-west-2",
    [string]$Bucket = "hackathonbyteach"
)

Write-Host "🔨 正在建置最新版本前端..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
cmd.exe /c "npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 建置失敗！" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 正在同步上傳至 AWS S3 (s3://$Bucket)..." -ForegroundColor Cyan
aws s3 sync dist/ "s3://$Bucket" --delete

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 部署成功！網站已上線：" -ForegroundColor Green
    Write-Host "👉 http://$Bucket.s3-website-$Region.amazonaws.com" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ S3 上傳失敗，請確認是否已設定有效之 AWS 憑證 (aws configure 或環境變數)。" -ForegroundColor Red
}