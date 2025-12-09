#!/bin/bash
# Deploy Frontend to OCI Object Storage

set -e

echo "=========================================="
echo "Deploying Frontend to OCI Object Storage"
echo "=========================================="

# Configuration
BUCKET_NAME="${OCI_BUCKET_NAME:-bharatmart-frontend}"
REGION="${OCI_REGION:-ap-mumbai-1}"
BUILD_DIR="dist"

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | xargs)
fi

echo "Step 1: Building frontend..."
npm run build:client

echo "Step 2: Creating OCI bucket (if not exists)..."
oci os bucket create \
    --name "$BUCKET_NAME" \
    --compartment-id "$OCI_COMPARTMENT_ID" \
    --public-access-type ObjectRead \
    || echo "Bucket already exists"

echo "Step 3: Uploading files to OCI Object Storage..."
oci os object bulk-upload \
    --bucket-name "$BUCKET_NAME" \
    --src-dir "$BUILD_DIR" \
    --content-type-strategy auto

echo "Step 4: Configuring static website hosting..."
oci os bucket update \
    --bucket-name "$BUCKET_NAME" \
    --metadata '{"Website-Index-Document":"index.html","Website-Error-Document":"index.html"}'

echo ""
echo "=========================================="
echo "Frontend deployed successfully!"
echo "URL: https://objectstorage.${REGION}.oraclecloud.com/n/${OCI_NAMESPACE}/b/${BUCKET_NAME}/o/index.html"
echo "=========================================="
