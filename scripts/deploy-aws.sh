#!/usr/bin/env bash
# Deploy the public portfolio to agamagarwal.com (S3 + CloudFront).
#
#   scripts/deploy-aws.sh              build, then upload and refresh CloudFront
#   scripts/deploy-aws.sh --no-build   reuse the existing dist/
#   scripts/deploy-aws.sh --dry-run    show what would change, upload nothing
#
# Needs: the AWS CLI, signed in (`aws configure`) with write access to the bucket
# and permission to create CloudFront invalidations.
# BUCKET and DIST_ID can be set in the environment; otherwise they are looked up
# from the CloudFront distribution that serves www.agamagarwal.com.
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="www.agamagarwal.com"
BUILD=1; DRY=""
for a in "$@"; do
  case "$a" in
    --no-build) BUILD=0 ;;
    --dry-run) DRY="--dryrun" ;;
    *) echo "unknown option: $a" >&2; exit 2 ;;
  esac
done

command -v aws >/dev/null || { echo "AWS CLI not found. Install it: brew install awscli" >&2; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "Not signed in to AWS. Run: aws configure" >&2; exit 1; }

# 1. find the distribution and its S3 bucket
if [ -z "${DIST_ID:-}" ]; then
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, '$DOMAIN')].Id | [0]" --output text)
fi
[ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ] || { echo "No CloudFront distribution found for $DOMAIN" >&2; exit 1; }
if [ -z "${BUCKET:-}" ]; then
  ORIGIN=$(aws cloudfront get-distribution --id "$DIST_ID" \
    --query "Distribution.DistributionConfig.Origins.Items[0].DomainName" --output text)
  BUCKET="${ORIGIN%%.s3*}"
fi
echo "Distribution: $DIST_ID  Bucket: $BUCKET"

# 2. build the public site (home + case studies only), then drop lab-only folders
if [ "$BUILD" = 1 ]; then
  VITE_PUBLIC_SITE=1 npx vite build
  rm -rf dist/dj dist/ekam-content-system dist/shader-viewer dist/feedback-voice-harness.html dist/mobile-check.html dist/data/sd dist/data/sd_slot_availability_daily_2026.csv
fi
# private files never ship, even from a local build (public/ is copied whole):
# raw Zepto exports, and every resume except the one the header links
rm -rf dist/data/sd dist/data/sd_slot_availability_daily_2026.csv
find dist/resume -name "*.pdf" ! -name "agam-agarwal-product-design.pdf" -delete 2>/dev/null || true
find dist -name "*.bak*" -delete   # hand-made backups (e.g. prd/away-prd.html.bak-*)
[ -f dist/index.html ] || { echo "dist/index.html missing; build first" >&2; exit 1; }
for f in dist/data/sd dist/data/sd_slot_availability_daily_2026.csv dist/resume/agam-agarwal-headout.pdf; do
  [ ! -e "$f" ] || { echo "refusing to deploy: private file still in dist: $f" >&2; exit 1; }
done

# 3. upload. Hashed assets are cached for a year; everything else revalidates.
aws s3 sync dist/assets "s3://$BUCKET/assets" $DRY --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist "s3://$BUCKET" $DRY --exclude "assets/*" --exclude "index.html" --cache-control "public,max-age=3600"
aws s3 cp dist/index.html "s3://$BUCKET/index.html" $DRY --cache-control "no-cache"

# 4. tell CloudFront to fetch the new files
if [ -z "$DRY" ]; then
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" \
    --query "Invalidation.{Id:Id,Status:Status}" --output table
  echo "Deployed. CloudFront refresh takes a few minutes: https://$DOMAIN"
fi
