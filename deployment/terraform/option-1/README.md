# BharatMart OCI Deployment - Terraform Configuration (Single All-in-One VM)

This directory contains Terraform configuration files for deploying BharatMart infrastructure on Oracle Cloud Infrastructure (OCI) using a **single all-in-one VM** that hosts both frontend and backend services.

## Overview

This Terraform configuration creates a minimal but complete infrastructure setup for BharatMart:

- **VCN** (Virtual Cloud Network) with public subnet only
- **Internet Gateway** for public subnet connectivity
- **Security Lists** with appropriate rules for direct access to the VM
- **Single Compute Instance** (all-in-one) hosting both frontend and backend API

**Note:** This is a simplified deployment option ideal for development, testing, or training purposes. For production, consider using `option-2` (multi-VM with Load Balancer) or `option-3` (instance pools with auto-scaling).

## Prerequisites

1. **OCI Account** with appropriate permissions
2. **OCI Compartment** OCID where resources will be created
3. **Terraform** version >= 1.5.0 (for local testing, or use OCI Resource Manager)
4. **OCI Image** OCID (Oracle Linux or Ubuntu)
5. **SSH Public Key** for Compute instance access

## File Structure

```
deployment/terraform/option-1/
├── versions.tf          # Terraform and provider version requirements
├── variables.tf         # Input variable definitions
├── main.tf              # Main infrastructure resources
├── outputs.tf           # Output values (resource IDs, IPs, etc.)
├── terraform.tfvars.example  # Example variables file
└── README.md            # This file
```

## Quick Start

### Using OCI Resource Manager (Recommended for Training)

1. **Create a ZIP file** of the Terraform configuration:
   ```bash
   cd deployment/terraform/option-1
   zip -r bharatmart-option1.zip *.tf
   ```

2. **Upload to Resource Manager**:
   - Go to OCI Console → Menu (☰) → Developer Services → Resource Manager → Stacks
   - Click "Create Stack"
   - Choose "My Local Machine"
   - Upload `bharatmart-option1.zip`
   - Fill in variables (compartment_id, image_id, ssh_public_key, etc.)
   - Review and create stack

3. **Run Plan**:
   - Open your stack
   - Click "Terraform Actions → Plan"
   - Review the plan output

4. **Apply**:
   - Click "Terraform Actions → Apply"
   - Wait for resources to be created

### Using Terraform CLI (Optional)

1. **Initialize Terraform**:
   ```bash
   cd deployment/terraform/option-1
   terraform init
   ```

2. **Configure variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan**:
   ```bash
   terraform plan
   ```

4. **Apply**:
   ```bash
   terraform apply
   ```

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `compartment_id` | OCI Compartment OCID | `ocid1.compartment.oc1..aaaaaaa...` |
| `image_id` | OCI Image OCID | `ocid1.image.oc1.iad.aaaaaaaa...` |
| `ssh_public_key` | SSH public key content | `ssh-rsa AAAAB3...` |

## Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `region` | `ap-mumbai-1` | OCI region |
| `project_name` | `bharatmart` | Project name for resource naming |
| `environment` | `dev` | Environment (dev/staging/prod) |
| `compute_instance_shape` | `VM.Standard.A1.Flex` | Compute instance shape |
| `compute_instance_ocpus` | `2` | Number of OCPUs for the VM |
| `compute_instance_memory_in_gb` | `12` | Memory in GB for the VM |
| `public_subnet_cidr` | `10.0.1.0/24` | CIDR block for public subnet |

## What Gets Created

### Networking
- **VCN** with CIDR block (default: 10.0.0.0/16)
- **Public Subnet** (default: 10.0.1.0/24) - for all-in-one VM
- **Internet Gateway** - for public subnet

### Security
- **Public Security List** - allows:
  - HTTP (80) from internet
  - HTTPS (443) from internet
  - API (3000) from internet
  - SSH (22) from internet (dev only)

### Compute
- **Single Compute Instance** (all-in-one) - hosts both frontend and backend
  - Deployed in public subnet with public IP
  - Basic Node.js installation via user_data
  - SSH access configured
  - Direct access to application on port 3000

## Outputs

After successful deployment, the following outputs are available:

- `vcn_id` - VCN OCID
- `public_subnet_id` - Public subnet OCID
- `compute_instance_id` - All-in-one VM OCID
- `compute_instance_public_ip` - Public IP of the VM
- `compute_instance_private_ip` - Private IP of the VM
- `application_url` - Full URL to access application (`http://<public-ip>:3000`)
- `ssh_command` - SSH command to connect to the instance

## Post-Deployment Steps

After Terraform creates the infrastructure:

1. **SSH to the Compute instance**:
   ```bash
   ssh -i ~/.ssh/your_key opc@<public_ip>
   ```

2. **Deploy BharatMart application**:
   - Install Node.js (already done via user_data)
   - Clone repository
   - Configure environment variables
   - Start application (both frontend and backend)

3. **Verify Application**:
   ```bash
   curl http://<public_ip>:3000/api/health
   ```

4. **Access Application**:
   - Open browser to `http://<public_ip>:3000`
   - API available at `http://<public_ip>:3000/api/*`

## Architecture Differences from Other Options

### Option-1 (This Option)
- ✅ Single VM for everything
- ✅ Simple setup
- ✅ Lower cost
- ❌ No high availability
- ❌ No load balancing
- ❌ Single point of failure

### Option-2 (Multi-VM with Load Balancer)
- Multiple VMs
- Load Balancer for high availability
- Better for production workloads

### Option-3 (Instance Pools with Auto-Scaling)
- Instance pools for scalability
- Auto-scaling based on metrics
- Best for production with variable load

## Version Information

- **Terraform**: >= 1.5.0
- **OCI Provider**: ~> 5.0
