#!/bin/bash
# Deploy Backend API to OCI Compute Instance

set -e

echo "=========================================="
echo "Deploying Backend API to OCI Compute"
echo "=========================================="

# Configuration
INSTANCE_IP="${OCI_BACKEND_IP}"
SSH_KEY="${OCI_SSH_KEY:-~/.ssh/oci_key}"
SSH_USER="${OCI_SSH_USER:-ubuntu}"

echo "Step 1: Building backend..."
npm run build:server

echo "Step 2: Creating deployment package..."
tar -czf backend-deploy.tar.gz \
    dist/server \
    package.json \
    package-lock.json \
    config/

echo "Step 3: Copying files to OCI instance..."
scp -i "$SSH_KEY" backend-deploy.tar.gz ${SSH_USER}@${INSTANCE_IP}:/tmp/

echo "Step 4: Deploying on remote instance..."
ssh -i "$SSH_KEY" ${SSH_USER}@${INSTANCE_IP} << 'ENDSSH'
    set -e

    # Stop existing service
    sudo systemctl stop bharatmart-api || true

    # Extract files
    cd /opt/bharatmart-api
    tar -xzf /tmp/backend-deploy.tar.gz

    # Install dependencies
    npm ci --only=production

    # Copy environment file
    cp /opt/bharatmart-api/config/backend.env .env

    # Start service
    sudo systemctl start bharatmart-api
    sudo systemctl enable bharatmart-api

    # Check status
    sleep 3
    sudo systemctl status bharatmart-api
ENDSSH

echo "Step 5: Verifying deployment..."
sleep 5
curl -f http://${INSTANCE_IP}:3000/api/health || {
    echo "Health check failed!"
    exit 1
}

echo ""
echo "=========================================="
echo "Backend deployed successfully!"
echo "API URL: http://${INSTANCE_IP}:3000"
echo "=========================================="
