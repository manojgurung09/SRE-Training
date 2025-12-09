# OCI Cloud Agent Setup for Log Ingestion

Complete guide for configuring OCI Cloud Agent to ingest BharatMart application logs into OCI Logging Service.

## Overview

**Purpose:** Configure OCI Cloud Agent to automatically collect and send BharatMart application logs to OCI Logging Service for centralized analysis, monitoring, and alerting.

**Use Case:** Day 3 Lab 5 - "Use OCI Logging Service for Real-Time Log Stream Analysis"

**Source:** Application logs are written to file at `logs/api.log` (or configured via `LOG_FILE` environment variable) in JSON format.

## Prerequisites

- OCI Compute instance with BharatMart application running
- OCI Log Group and Log created in OCI Logging Service
- SSH access to the Compute instance
- Appropriate OCI IAM permissions for log ingestion

## Architecture

```
BharatMart Application
    ↓ (writes logs)
logs/api.log (JSON format)
    ↓ (Cloud Agent reads)
OCI Cloud Agent
    ↓ (sends logs)
OCI Logging Service
    ↓ (query/analyze)
OCI Logging Console / APIs
```

## Step 1: Create OCI Log Group and Log

Before configuring Cloud Agent, create the OCI Log resources:

### 1.1 Create Log Group

1. **Navigate to OCI Console:**
   - Go to **Navigation Menu (☰) → Observability & Management → Logging → Log Groups**

2. **Create Log Group:**
   - Click **Create Log Group**
   - **Name:** `bharatmart-logs` (or your preferred name)
   - **Compartment:** Select your compartment
   - Click **Create**

### 1.2 Create Custom Log

1. **Navigate to Logs:**
   - Click on your Log Group
   - Click **Create Log**

2. **Configure Log:**
   - **Name:** `bharatmart-api-log`
   - **Log Type:** Custom Log
   - **Log Group:** Select your log group
   - Click **Create**

3. **Note the Log OCID:**
   - After creation, copy the Log OCID from the Log details page
   - You'll need this for Cloud Agent configuration

## Step 2: Verify OCI Cloud Agent Installation

OCI Cloud Agent should be pre-installed on OCI Compute instances, but verify:

### 2.1 Check Agent Status

SSH to your Compute instance and check:

```bash
# Check if Cloud Agent is installed
systemctl status unified-monitoring-agent

# If not running, start it
sudo systemctl start unified-monitoring-agent
sudo systemctl enable unified-monitoring-agent

# Check agent version
sudo /opt/oracle-cloud-agent/agent/cloud_agent_linux --version
```

**Expected Output:**
```
unified-monitoring-agent.service - Oracle Cloud Agent Service
   Loaded: loaded
   Active: active (running)
```

### 2.2 Install Cloud Agent (if not present)

If Cloud Agent is not installed:

```bash
# For Oracle Linux / CentOS / RHEL
sudo yum install -y oracle-cloud-agent

# Start and enable the service
sudo systemctl start unified-monitoring-agent
sudo systemctl enable unified-monitoring-agent
```

**Note:** Cloud Agent is typically pre-installed on Oracle Linux images from OCI Marketplace.

## Step 3: Configure Cloud Agent for Log Collection

### 3.1 Create Logging Plugin Configuration

The Cloud Agent uses plugins for different data sources. Configure the logging plugin:

```bash
# Navigate to Cloud Agent config directory
cd /opt/oracle-cloud-agent/plugins/logging/

# Create or edit configuration file
sudo nano config.json
```

### 3.2 Configuration File Format

Add the following configuration for BharatMart logs:

```json
{
  "logSources": [
    {
      "logId": "ocid1.log.oc1.ap-mumbai-1.xxxxx",
      "logPath": "/home/opc/bharatmart/logs/api.log",
      "logType": "custom",
      "parser": "json",
      "labels": {
        "service": "bharatmart-api",
        "environment": "production",
        "application": "bharatmart"
      },
      "metadata": {
        "source": "bharatmart-application"
      }
    }
  ]
}
```

**Configuration Fields:**

- **logId:** OCID of the Log created in Step 1.2
- **logPath:** Full path to BharatMart log file (default: `logs/api.log` relative to app directory)
- **logType:** `"custom"` for application logs
- **parser:** `"json"` since BharatMart logs are in JSON format
- **labels:** Optional metadata tags for log organization
- **metadata:** Optional additional metadata

### 3.3 Alternative: Environment Variable Configuration

You can also configure via environment variables:

```bash
# Set log OCID
export OCI_LOG_OCID="ocid1.log.oc1.ap-mumbai-1.xxxxx"

# Set log path (if different from default)
export LOG_FILE="/home/opc/bharatmart/logs/api.log"
```

**Note:** The application uses `LOG_FILE` environment variable to set log path. Ensure Cloud Agent reads from the same path.

### 3.4 Restart Cloud Agent

After configuration:

```bash
# Restart Cloud Agent to apply changes
sudo systemctl restart unified-monitoring-agent

# Verify agent is running
sudo systemctl status unified-monitoring-agent

# Check agent logs for errors
sudo journalctl -u unified-monitoring-agent -f
```

## Step 4: Verify Log Ingestion

### 4.1 Generate Test Logs

Generate some application activity to create logs:

```bash
# Make API requests to generate logs
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
```

### 4.2 Check Log File

Verify logs are being written locally:

```bash
# View recent log entries
tail -f /path/to/bharatmart/logs/api.log

# Check log file exists and is readable
ls -lh /path/to/bharatmart/logs/api.log
```

### 4.3 Verify Logs in OCI Logging

1. **Navigate to OCI Console:**
   - Go to **Observability & Management → Logging → Log Groups**
   - Click your Log Group
   - Click your Log (`bharatmart-api-log`)

2. **Search Logs:**
   - Click **Search**
   - Wait 1-2 minutes for logs to appear (Cloud Agent sends logs in batches)
   - Query: `*` (search all logs)

3. **Verify Log Format:**
   - Logs should appear in JSON format
   - Should contain fields like: `timestamp`, `level`, `message`, `route`, `status_code`

## Step 5: Advanced Configuration

### 5.1 Multiple Log Sources

If you have multiple log files:

```json
{
  "logSources": [
    {
      "logId": "ocid1.log.oc1.ap-mumbai-1.xxxxx",
      "logPath": "/home/opc/bharatmart/logs/api.log",
      "logType": "custom",
      "parser": "json"
    },
    {
      "logId": "ocid1.log.oc1.ap-mumbai-1.yyyyy",
      "logPath": "/home/opc/bharatmart/logs/error.log",
      "logType": "custom",
      "parser": "json"
    }
  ]
}
```

### 5.2 Log Path Configuration

**Find Actual Log Path:**

The log path depends on where BharatMart is deployed:

```bash
# Check application environment
cat /home/opc/bharatmart/.env | grep LOG_FILE

# Or check process environment
ps aux | grep node

# Or find log file
find /home/opc -name "api.log" 2>/dev/null
```

**Common Log Paths:**
- Development: `./logs/api.log` (relative to app directory)
- Production: `/var/log/bharatmart/api.log`
- Custom: Check `LOG_FILE` environment variable

### 5.3 Log Rotation Configuration

For log rotation (recommended for production):

```json
{
  "logSources": [
    {
      "logId": "ocid1.log.oc1.ap-mumbai-1.xxxxx",
      "logPath": "/var/log/bharatmart/api.log",
      "logType": "custom",
      "parser": "json",
      "rotation": {
        "enabled": true,
        "maxSize": "100MB",
        "maxFiles": 10
      }
    }
  ]
}
```

## Step 6: Terraform Configuration (Optional)

If using Terraform for infrastructure, you can configure Cloud Agent via user data:

```hcl
resource "oci_core_instance" "bharatmart_backend" {
  # ... other configuration ...

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(<<EOF
#!/bin/bash
# Install Cloud Agent (if not pre-installed)
yum install -y oracle-cloud-agent || true

# Configure Cloud Agent logging plugin
mkdir -p /opt/oracle-cloud-agent/plugins/logging
cat > /opt/oracle-cloud-agent/plugins/logging/config.json <<'CFG'
{
  "logSources": [
    {
      "logId": "${oci_logging_log.bharatmart_api_log.id}",
      "logPath": "/home/opc/bharatmart/logs/api.log",
      "logType": "custom",
      "parser": "json"
    }
  ]
}
CFG

# Restart Cloud Agent
systemctl restart unified-monitoring-agent
systemctl enable unified-monitoring-agent
EOF
    )
  }
}
```

## Troubleshooting

### Cloud Agent Not Running

**Symptoms:** Logs not appearing in OCI Logging

**Solutions:**

```bash
# Check agent status
sudo systemctl status unified-monitoring-agent

# Check agent logs
sudo journalctl -u unified-monitoring-agent -n 100

# Restart agent
sudo systemctl restart unified-monitoring-agent

# Verify configuration file syntax
cat /opt/oracle-cloud-agent/plugins/logging/config.json | python3 -m json.tool
```

### Logs Not Appearing in OCI Logging

**Possible Causes:**

1. **Wrong Log Path:**
   ```bash
   # Verify log file exists and is being written
   ls -lh /path/to/bharatmart/logs/api.log
   tail -f /path/to/bharatmart/logs/api.log
   ```

2. **Wrong Log OCID:**
   - Verify Log OCID in configuration matches the OCID in OCI Console
   - Log OCID format: `ocid1.log.oc1.<region>.xxxxx`

3. **IAM Permissions:**
   - Instance needs permission to write to Log
   - Check instance principal policies or use API key authentication

4. **Log Format Issues:**
   - Verify logs are valid JSON
   - Check parser setting matches log format

### Permission Denied Errors

**Symptoms:** Cloud Agent cannot read log file

**Solutions:**

```bash
# Check file permissions
ls -l /path/to/bharatmart/logs/api.log

# Fix permissions (if needed)
sudo chmod 644 /path/to/bharatmart/logs/api.log
sudo chown opc:opc /path/to/bharatmart/logs/api.log

# Ensure Cloud Agent user can read
sudo chmod 755 /path/to/bharatmart/logs/
```

### JSON Parser Errors

**Symptoms:** Logs appear but fields are not parsed correctly

**Solutions:**

1. **Verify Log Format:**
   ```bash
   # Check if logs are valid JSON
   head -1 /path/to/bharatmart/logs/api.log | python3 -m json.tool
   ```

2. **Check Parser Setting:**
   - For JSON logs: `"parser": "json"`
   - For plain text: `"parser": "text"` or omit parser field

## Verification Checklist

- [ ] Log Group created in OCI Console
- [ ] Custom Log created with correct name
- [ ] Log OCID copied and saved
- [ ] Cloud Agent installed and running
- [ ] Configuration file created at `/opt/oracle-cloud-agent/plugins/logging/config.json`
- [ ] Log path matches actual log file location
- [ ] Cloud Agent restarted after configuration
- [ ] Test logs generated (API requests)
- [ ] Logs appear in OCI Logging Console (within 1-2 minutes)
- [ ] Log entries contain expected JSON fields
- [ ] Log queries work in OCI Logging Console

## Next Steps

After configuring log ingestion:

1. **Create Log Queries:** See Day 3 Lab 5 for log query examples
2. **Create Logging Metrics:** Convert log queries to metrics (Day 3 Lab 6)
3. **Set Up Alarms:** Create alarms based on log patterns
4. **Dashboard Creation:** Visualize log data in OCI Dashboards

## Additional Resources

- [OCI Cloud Agent Documentation](https://docs.oracle.com/en-us/iaas/Content/Monitoring/Tasks/managingplugins.htm)
- [OCI Logging Service Documentation](https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/loggingoverview.htm)
- [BharatMart Logging Documentation](../06-observability/03-logging.md)

## Training Material Reference

This setup supports:
- **Day 3 Lab 5:** Use OCI Logging Service for Real-Time Log Stream Analysis
- **Day 3 Lab 6:** Create Logging Metrics, Push to OCI Monitoring, and Visualize

