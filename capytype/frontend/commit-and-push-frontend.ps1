# PowerShell script to automate frontend git add, commit, and push

# Change to frontend directory
Set-Location "$PSScriptRoot"
Set-Location ..\frontend

# Add relevant frontend files (excluding node_modules)
git add package.json package-lock.json public/index.html src/index.css src/pages/Game.tsx src/pages/Lobby.tsx src/components/Button.tsx src/utils/avatars.ts

# Commit with a default or custom message
$commitMsg = Read-Host "Enter commit message (default: 'Update frontend source and config files')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update frontend source and config files"
}
git commit -m "$commitMsg"

# Push to remote
git push

Write-Host "Frontend changes committed and pushed to GitHub."
