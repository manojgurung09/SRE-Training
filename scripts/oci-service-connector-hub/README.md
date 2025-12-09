# OCI Service Connector Hub Configuration Examples

This directory contains examples for configuring OCI Service Connector Hub for automated incident response (Day 5 Lab 5).

## Purpose

Service Connector Hub enables automated routing of monitoring alarms to OCI Functions for automated incident response, reducing MTTR and operational toil.

## Contents

### Incident Response Function

**Location:** `incident-response-function/`

**Files:**
- `func.py` - Python function code for incident response
- `func.yaml` - Function configuration
- `requirements.txt` - Python dependencies

**Deployment:**

```bash
# Deploy function first
cd scripts/oci-service-connector-hub/incident-response-function
fn deploy --app <your-app-name> --local

# Configure function environment variables (via OCI Console or CLI):
# TOPIC_OCID - Optional: OCI Notification Topic OCID for notifications
```

### Terraform Configuration

**Location:** `service-connector-terraform.tf`

**Purpose:** Infrastructure as Code for creating Service Connector

**Usage:**

```hcl
module "service_connector" {
  source = "./scripts/oci-service-connector-hub"
  
  compartment_id     = var.compartment_id
  function_app_ocid  = oci_functions_application.incident_response_app.id
  function_name      = "incident-response-handler"
  connector_name     = "bharatmart-incident-response-connector"
  monitoring_namespace = "custom.bharatmart"
}
```

## Architecture

```
BharatMart Application
    ↓
OCI Monitoring (Metrics/Alarms)
    ↓ (Alarm triggers)
Service Connector Hub
    ↓ (Routes alarm event)
OCI Function (Incident Response)
    ↓ (Actions)
- Log incident
- Send notification (optional)
- Trigger remediation (optional)
```

## Setup Steps

### 1. Create Function Application

```bash
# Create function application via OCI Console:
# Developer Services → Functions → Applications → Create Application
# Or use Terraform/CLI
```

### 2. Deploy Incident Response Function

```bash
cd scripts/oci-service-connector-hub/incident-response-function
fn deploy --app <your-app-name> --local
```

### 3. Configure Dynamic Group and Policies

**Dynamic Group:**
```
resource.type = 'fnfunc'
resource.compartment.id = '<compartment-ocid>'
```

**Policy:**
```
Allow dynamic-group <dynamic-group-name> to manage objects in compartment <compartment-name>
Allow dynamic-group <dynamic-group-name> to use ons-topics in compartment <compartment-name>
Allow dynamic-group <dynamic-group-name> to read alarms in compartment <compartment-name>
```

### 4. Create Service Connector

**Via OCI Console:**
1. Navigate to: **Application Integration → Service Connector Hub**
2. Click **Create Connector**
3. Configure:
   - **Source:** Monitoring (alarms in compartment)
   - **Target:** Functions (select your function)
4. Create and wait for **Active** state

**Via Terraform:**
```bash
# Use service-connector-terraform.tf configuration
terraform apply
```

### 5. Test Incident Response

```bash
# Trigger a test alarm or use existing alarm
# Verify function is invoked:
# 1. Check function logs in OCI Console
# 2. Verify incident is logged
# 3. Check notifications (if configured)
```

## Configuration Options

### Monitoring Namespace

- `oci_computeagent` - Compute instance metrics/alarms
- `custom.bharatmart` - Custom BharatMart metrics (if using custom metrics)

### Function Configuration

Set environment variables in function:
- `TOPIC_OCID` - OCI Notification Topic OCID (optional, for notifications)

## Integration with BharatMart

This configuration integrates with:
- BharatMart monitoring alarms (from Day 2 labs)
- OCI Monitoring service
- OCI Functions platform
- OCI Notifications (optional)

## Documentation

See training material: `Day-5/05-service-connector-hub-incident-response-lab.md`

## Troubleshooting

### Function Not Invoked

- Verify Service Connector is **Active**
- Check connector policies are correct
- Verify alarm is in correct compartment
- Check function logs for errors

### Function Errors

- Verify function has required permissions (dynamic group policy)
- Check function code for syntax errors
- Verify OCI SDK is properly configured

### No Alarm Events

- Verify alarm actually fired (check alarm state)
- Wait 1-2 minutes for events to propagate
- Check Service Connector metrics for events received

