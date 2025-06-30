# PowerShell script to automate backend git add, commit, and push

# Change to backend directory
Set-Location "$PSScriptRoot"
Set-Location ..\backend

# Add relevant backend files (excluding node_modules)
git add package.json package-lock.json tsconfig.json src/index.ts src/roomUtils.ts src/roomUtils.js

# Commit with a default or custom message
$commitMsg = Read-Host "Enter commit message (default: 'Update backend source and config files')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update backend source and config files"
}
git commit -m "$commitMsg"

# Push to remote
git push

Write-Host "Backend changes committed and pushed to GitHub."
