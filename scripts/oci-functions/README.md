# OCI Functions Examples for BharatMart

This directory contains example OCI Functions for scheduled automation and toil reduction (Day 3 Lab 7).

## Purpose

These functions demonstrate how to use OCI Functions + Events for scheduled automation to reduce operational toil.

## Functions

### Health Check Function

**Location:** `health-check-function/`

**Purpose:** Automated health check monitoring for BharatMart API

**Files:**
- `func.py` - Python function code
- `func.yaml` - Function configuration
- `requirements.txt` - Python dependencies

**Deployment:**

```bash
# Prerequisites: Install Fn CLI
# https://fnproject.io/tutorials/install/

# Set OCI configuration
export OCI_REGION=ap-mumbai-1
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...

# Create function application (via OCI Console or CLI)
# Then deploy function:
cd scripts/oci-functions/health-check-function
fn deploy --app <your-app-name> --local
```

**Configuration:**

Set environment variables in function application:
- `HEALTH_ENDPOINT` - BharatMart health endpoint URL (default: http://localhost:3000/api/health)
- `HEALTH_TIMEOUT` - Request timeout in seconds (default: 5)

**Schedule with OCI Events:**

1. Navigate to OCI Console → Application Integration → Events Service → Rules
2. Create Rule with:
   - Condition: Schedule (e.g., `cron(0/5 * * * ? *)` for every 5 minutes)
   - Action: Functions → Select your function

## Use Cases

### 1. Automated Health Checks

**Toil Reduction:** Eliminates manual health check tasks
- Manual: 5 minutes/day × 30 days = 150 minutes/month
- Automated: 0 minutes/month
- **Toil Reduction: 150 minutes/month**

### 2. Log Cleanup Automation

**Future Enhancement:** Automated log rotation and cleanup

### 3. Metric Collection

**Future Enhancement:** Scheduled metric aggregation and reporting

## Integration with BharatMart

These functions integrate with:
- BharatMart API health endpoints (`/api/health`)
- OCI Monitoring for metrics
- OCI Logging for function logs
- OCI Events for scheduling

## Documentation

See training material: `Day-3/07-reduce-toil-scheduled-functions-lab.md`

