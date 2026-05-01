#!/usr/bin/env bash
# cleanup-staging.sh
#
# PURPOSE: After verifying that C:\Users\massi\Engram\ renders correctly and
#          all design source has been fully internalized into the repo, run
#          this script to remove the temporary staging directory and the
#          original source zip.
#
# GUARDS:
#   1. The new Engram repo must exist at /c/Users/massi/Engram
#   2. The sanity file src/screens/screen-chat.jsx must be present in that repo
#
# Run from Git Bash or any POSIX-compatible shell on Windows.

set -euo pipefail

REPO="/c/Users/massi/Engram"
SANITY_FILE="${REPO}/src/screens/screen-chat.jsx"
STAGING_DIR="/c/Users/massi/Engram-design-staging"
SOURCE_ZIP="/c/Users/massi/Downloads/Engram.zip"

# Guard 1: repo must exist
if [ ! -d "${REPO}" ]; then
  echo "REFUSE: Target repo does not exist at ${REPO}. Aborting." >&2
  exit 1
fi

# Guard 2: sanity-check file must exist
if [ ! -f "${SANITY_FILE}" ]; then
  echo "REFUSE: Sanity check failed — ${SANITY_FILE} is missing." >&2
  echo "        Verify the design migration is complete before cleaning up." >&2
  exit 1
fi

echo "Guards passed. Proceeding with cleanup..."

if [ -d "${STAGING_DIR}" ]; then
  rm -rf "${STAGING_DIR}"
  echo "Removed staging dir: ${STAGING_DIR}"
else
  echo "Staging dir not found (already removed?): ${STAGING_DIR}"
fi

if [ -f "${SOURCE_ZIP}" ]; then
  rm -f "${SOURCE_ZIP}"
  echo "Removed source zip: ${SOURCE_ZIP}"
else
  echo "Source zip not found (already removed?): ${SOURCE_ZIP}"
fi

echo "Staging cleared."
