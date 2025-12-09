# OCI Deployment

Complete guide for deploying on Oracle Cloud Infrastructure.

## Overview

**Platform:** Oracle Cloud Infrastructure (OCI)

**Components:**
- OCI Compute VMs
- OCI Autonomous Database
- OCI Cache
- OCI Vault (secrets)
- OCI Load Balancer

**Source:** OCI adapter implementations in `server/adapters/`.

## Prerequisites

### OCI Account

- OCI account with appropriate permissions
- Compartment for resources
- VCN (Virtual Cloud Network) configured

**Source:** OCI account requirements.

### OCI CLI

**Install OCI CLI:**
```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

**Configure:**
```bash
oci setup config
```

**Source:** OCI CLI installation.

## Infrastructure Setup

### VCN Configuration

**Create VCN:**
- CIDR block: 10.0.0.0/16
- Subnets for each tier
- Internet Gateway
- Security Lists

**Source:** OCI VCN configuration.

### Compute Instances

**Backend VM:**
- Shape: VM.Standard.E2.1 (1 OCPU, 8GB RAM)
- Image: Oracle Linux 8 or Ubuntu 20.04
- Subnet: Backend subnet

**Worker VMs:**
- Shape: VM.Standard.E2.1 (1 OCPU, 8GB RAM)
- Image: Oracle Linux 8 or Ubuntu 20.04
- Subnet: Worker subnet

**Source:** OCI Compute instance configuration.

### Autonomous Database

**Create Database:**
- Type: Autonomous Transaction Processing
- Workload: Transaction Processing
- License: License Included
- Network: VCN with private endpoint

**Connection:**
- Use OCI Autonomous adapter
- Configure connection string
- Set up wallet

**Source:** OCI Autonomous Database setup.

### OCI Cache

**Create Cache:**
- Type: Redis
- Shape: Standard
- Memory: 1GB+
- Network: VCN with private endpoint

**Connection:**
- Use OCI Cache endpoint
- Configure in environment variables

**Source:** OCI Cache configuration.

## Deployment Steps

### 1. Create Infrastructure

**Using Terraform (Recommended):**
```hcl
# terraform configuration
resource "oci_core_instance" "backend" {
  # ... configuration
}
```

**Using OCI Console:**
- Create compute instances
- Create database
- Create cache
- Configure networking

**Source:** Infrastructure as Code.

### 2. Configure Backend VM

**SSH to VM:**
```bash
ssh opc@backend-vm-ip
```

**Install Software:**
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
npm install -g pm2
```

**Deploy Application:**
```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
npm install
npm run build:server
```

**Source:** Backend VM setup.

### 3. Configure Environment

**Environment Variables:**
```bash
# .env
NODE_ENV=production
DEPLOYMENT_MODE=multi-tier
DATABASE_TYPE=oci-autonomous
CACHE_TYPE=oci-cache
SECRETS_PROVIDER=oci-vault
SUPABASE_URL=...  # or OCI Autonomous connection
```

**Source:** OCI environment configuration.

### 4. Configure OCI Vault

**Create Vault:**
- Create vault in OCI Console
- Create secrets
- Configure IAM policies

**Use Secrets:**
- Configure OCI Vault adapter
- Set `SECRETS_PROVIDER=oci-vault`
- Configure vault endpoint

**Source:** OCI Vault configuration.

### 5. Configure Load Balancer

**Create Load Balancer:**
- Type: Public or Private
- Shape: Flexible
- Backend servers: Backend VMs
- Health check: `/api/health`

**SSL Configuration:**
- Upload SSL certificate
- Configure SSL termination

**Source:** OCI Load Balancer configuration.

## OCI-Specific Configuration

### Database Adapter

**Configuration:**
```bash
DATABASE_TYPE=oci-autonomous
OCI_DB_CONNECTION_STRING=...
OCI_DB_WALLET_PATH=...
```

**Source:** OCI Autonomous adapter in `server/adapters/database/oci-autonomous.ts`.

### Cache Adapter

**Configuration:**
```bash
CACHE_TYPE=oci-cache
OCI_CACHE_ENDPOINT=...
```

**Source:** OCI Cache adapter configuration.

### Secrets Provider

**Configuration:**
```bash
SECRETS_PROVIDER=oci-vault
OCI_VAULT_ENDPOINT=...
OCI_VAULT_COMPARTMENT=...
```

**Source:** OCI Vault adapter in `server/adapters/secrets/oci-vault.ts`.

## Monitoring

### OCI Monitoring

**Metrics:**
- Compute instance metrics
- Database metrics
- Load balancer metrics
- Custom application metrics

**Alarms:**
- CPU utilization
- Memory usage
- Request rate
- Error rate

**Source:** OCI Monitoring service.

### Prometheus Integration

**Scrape OCI Metrics:**
- Configure Prometheus
- Set up OCI metrics exporter
- Create dashboards

**Source:** Prometheus OCI integration.

## Security

### Security Lists

**Backend Security List:**
- Allow 3000 from load balancer
- Allow 9090 from Prometheus
- Allow 22 (SSH) from management

**Source:** OCI Security List configuration.

### IAM Policies

**Required Policies:**
- Read secrets from Vault
- Access Autonomous Database
- Access Cache
- Manage compute instances

**Source:** OCI IAM policies.

## Cost Optimization

### Resource Sizing

**Right-Size Instances:**
- Start with smaller shapes
- Monitor usage
- Scale as needed

**Source:** Cost optimization strategies.

### Reserved Instances

**Consider:**
- Reserved capacity for predictable workloads
- Savings plans
- Spot instances for non-critical workloads

**Source:** OCI pricing options.

## Training vs Production

### Training Mode

**Configuration:** Minimal OCI resources

**Use Case:** Learning OCI deployment

### Production Mode

**Configuration:** Full OCI setup with HA

**Use Case:** Production deployments

**Source:** OCI deployment modes.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Multi-Tier Deployment](04-multi-tier-deployment.md) - Multi-tier setup
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies

