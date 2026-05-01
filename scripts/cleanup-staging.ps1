# cleanup-staging.ps1
#
# PURPOSE: After verifying that C:\Users\massi\Engram\ renders correctly and
#          all design source has been fully internalized into the repo, run
#          this script to remove the temporary staging directory and the
#          original source zip.
#
# GUARDS:
#   1. The new Engram repo must exist at C:\Users\massi\Engram
#   2. The sanity file src\screens\screen-chat.jsx must be present in that repo
#
# Run from PowerShell 5+ or PowerShell Core on Windows 11.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoPath    = "C:\Users\massi\Engram"
$SanityFile  = Join-Path $RepoPath "src\screens\screen-chat.jsx"
$StagingDir  = "C:\Users\massi\Engram-design-staging"
$SourceZip   = "C:\Users\massi\Downloads\Engram.zip"

# Guard 1: repo must exist
if (-not (Test-Path -LiteralPath $RepoPath -PathType Container)) {
    Write-Error "REFUSE: Target repo does not exist at $RepoPath. Aborting."
    exit 1
}

# Guard 2: sanity-check file must exist
if (-not (Test-Path -LiteralPath $SanityFile -PathType Leaf)) {
    Write-Error "REFUSE: Sanity check failed — $SanityFile is missing.`n        Verify the design migration is complete before cleaning up."
    exit 1
}

Write-Host "Guards passed. Proceeding with cleanup..."

if (Test-Path -LiteralPath $StagingDir -PathType Container) {
    Remove-Item -LiteralPath $StagingDir -Recurse -Force
    Write-Host "Removed staging dir: $StagingDir"
} else {
    Write-Host "Staging dir not found (already removed?): $StagingDir"
}

if (Test-Path -LiteralPath $SourceZip -PathType Leaf) {
    Remove-Item -LiteralPath $SourceZip -Force
    Write-Host "Removed source zip: $SourceZip"
} else {
    Write-Host "Source zip not found (already removed?): $SourceZip"
}

Write-Host "Staging cleared."
