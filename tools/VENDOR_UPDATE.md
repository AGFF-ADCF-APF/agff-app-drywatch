# Vendor Auto-Update

## Manual run
./tools/update_vendor.sh

## Dry run
DRY_RUN=1 ./tools/update_vendor.sh

## What it does
- Downloads local vendor JS files from configured CDN URLs.
- Verifies basic content markers to avoid broken downloads.
- Rebuilds and deploys docker stack when files changed.
- Runs smoke tests:
  - /drycalc/
  - /drycalc/api/evaporation
- Rolls back vendor files if smoke test fails.

## Cron setup
1. Open crontab for deployment user.
2. Copy line from tools/cron.drywatch-vendor-update.example.
3. Ensure user can run docker compose.

## Notes
- URLs use latest streams intentionally for auto-updates.
- Current file checksums are written to public/assets/vendor/checksums.txt.
