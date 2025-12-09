# OCI CLI Chaos/Failure Injection Scripts

This directory contains scripts for chaos engineering and failure injection using OCI CLI.

## Purpose

These scripts support Day 4 Demo 5: "Run Failure Injection Using OCI CLI and Chaos Simulation Scripts"

## Scripts

### `oci-cli-failure-injection.sh`

Main script for OCI CLI-based failure injection.

**Features:**
- Stop/Start instances
- Check Load Balancer backend health
- List instances
- Enable/Disable chaos engineering (latency injection)
- Show baseline system state

**Usage:**

```bash
# Make executable
chmod +x scripts/chaos/oci-cli-failure-injection.sh

# Show help
./scripts/chaos/oci-cli-failure-injection.sh help

# Set environment variables
export COMPARTMENT_OCID=ocid1.compartment.oc1...
export LOAD_BALANCER_OCID=ocid1.loadbalancer.oc1...

# Show baseline state
./scripts/chaos/oci-cli-failure-injection.sh baseline

# Stop an instance
./scripts/chaos/oci-cli-failure-injection.sh stop-instance ocid1.instance.oc1...

# Enable chaos (latency injection)
./scripts/chaos/oci-cli-failure-injection.sh enable-chaos 10.0.2.5 500
```

## Prerequisites

- OCI CLI installed and configured
- OCI config file: `~/.oci/config`
- Appropriate OCI permissions
- SSH access to instances (for chaos enable/disable)

## Integration with BharatMart

These scripts work with:
- BharatMart application instances
- OCI Load Balancer backend sets
- Application chaos engineering features (latency injection)

