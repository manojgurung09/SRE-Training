# OCI REST API Dashboard Scripts

This directory contains Python scripts for building custom SRE dashboards using OCI REST APIs (Day 5 Lab 7).

## Purpose

These scripts demonstrate how to use OCI REST APIs to query metrics, alarms, and compute status to build custom SRE dashboards programmatically.

## Scripts

### `sre-dashboard.py`

**Main SRE Dashboard Script**

Displays comprehensive SRE metrics including:
- Infrastructure metrics (CPU, Memory)
- Application metrics (API latency, request rate)
- Service health (instance status)
- Alarm status
- SLO compliance

**Usage:**

```bash
# Set environment variables
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
export OCI_INSTANCE_ID=ocid1.instance.oc1...  # Optional

# Run dashboard
python3 scripts/oci-rest-api-dashboard/sre-dashboard.py
```

**Output:**
- Real-time console dashboard with key SRE metrics
- Color-coded status indicators (✅ ⚠️ ❌)
- SLO compliance information

### `query-metrics.py`

**Metrics Query Example Script**

Example script showing how to query specific metrics from OCI Monitoring.

**Usage:**

```bash
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
export METRIC_NAMESPACE=custom.bharatmart
export METRIC_NAME=api_latency_seconds

python3 scripts/oci-rest-api-dashboard/query-metrics.py
```

## Prerequisites

- OCI CLI configured (`~/.oci/config`)
- OCI Python SDK installed: `pip install oci`
- Appropriate OCI permissions (Monitoring, Compute APIs)
- Python 3.8+

## Setup

```bash
# Install OCI Python SDK
pip install oci

# Verify OCI CLI configuration
oci iam region list

# Set environment variables
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
```

## Integration with BharatMart

These scripts integrate with:
- BharatMart infrastructure metrics (CPU, Memory)
- BharatMart custom metrics (if ingested via telemetry script)
- OCI Monitoring alarms
- OCI Compute instances

## Customization

### Adding Custom Metrics

Edit `sre-dashboard.py` to add custom metric queries:

```python
custom_metric = get_latest_metric_value(
    monitoring_client,
    "custom.bharatmart",
    "your_metric_name",
    compartment_id
)
```

### Creating HTML Dashboard

The scripts can be extended to generate HTML dashboards. See training material for HTML generation examples.

## Documentation

See training material: `Day-5/07-oci-rest-apis-sre-dashboard-lab.md`

## Examples

### Basic Dashboard

```bash
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
python3 scripts/oci-rest-api-dashboard/sre-dashboard.py
```

### Query Specific Metric

```bash
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
export METRIC_NAMESPACE=oci_computeagent
export METRIC_NAME=CpuUtilization
python3 scripts/oci-rest-api-dashboard/query-metrics.py
```

