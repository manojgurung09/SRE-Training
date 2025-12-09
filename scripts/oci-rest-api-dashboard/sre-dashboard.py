#!/usr/bin/env python3
"""
SRE Dashboard using OCI REST APIs

This script builds a custom SRE dashboard by querying OCI Monitoring APIs
to display key metrics, alarm status, and service health.

Usage:
    python3 scripts/oci-rest-api-dashboard/sre-dashboard.py

Environment Variables:
    OCI_COMPARTMENT_ID    - OCI Compartment OCID (required)
    OCI_INSTANCE_ID       - Optional: Instance OCID for specific metrics
    OCI_CONFIG_FILE       - OCI config file path (default: ~/.oci/config)
"""

import os
import sys
import oci
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

# Configuration from environment variables
COMPARTMENT_OCID = os.getenv('OCI_COMPARTMENT_ID', '')
INSTANCE_OCID = os.getenv('OCI_INSTANCE_ID', '')
OCI_CONFIG_FILE = os.getenv('OCI_CONFIG_FILE', '~/.oci/config')


def get_latest_metric_value(
    monitoring_client: oci.monitoring.MonitoringClient,
    namespace: str,
    metric_name: str,
    compartment_id: str,
    resource_id: Optional[str] = None,
    minutes_back: int = 5
) -> Optional[float]:
    """
    Get latest metric value from OCI Monitoring.
    
    Args:
        monitoring_client: OCI Monitoring client
        namespace: Metric namespace (e.g., 'oci_computeagent', 'custom.bharatmart')
        metric_name: Metric name (e.g., 'CpuUtilization')
        compartment_id: Compartment OCID
        resource_id: Optional resource OCID to filter
        minutes_back: Minutes to look back for data
        
    Returns:
        Latest metric value or None if not available
    """
    try:
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=minutes_back)
        
        query = f"{namespace}.{metric_name}"
        if resource_id:
            query += f"{{resourceId=\"{resource_id}\"}}"
        
        response = monitoring_client.summarize_metrics_data(
            compartment_id=compartment_id,
            summarize_metrics_data_details=oci.monitoring.models.SummarizeMetricsDataDetails(
                namespace=namespace,
                query=query,
                start_time=start_time.isoformat(),
                end_time=end_time.isoformat(),
                resolution="1m"
            )
        )
        
        if response.data and response.data[0].datapoints:
            return float(response.data[0].datapoints[-1].value)
        return None
    except Exception as e:
        print(f"  Error querying {metric_name}: {e}", file=sys.stderr)
        return None


def get_alarm_summary(
    monitoring_client: oci.monitoring.MonitoringClient,
    compartment_id: str
) -> Dict[str, Any]:
    """Get summary of alarms in compartment."""
    try:
        response = monitoring_client.list_alarms(compartment_id=compartment_id)
        if response.data:
            enabled_count = sum(1 for a in response.data if a.is_enabled)
            firing_count = sum(1 for a in response.data if getattr(a, 'severity', None) == 'CRITICAL')
            return {
                "total": len(response.data),
                "enabled": enabled_count,
                "disabled": len(response.data) - enabled_count,
                "firing": firing_count
            }
        return {"total": 0, "enabled": 0, "disabled": 0, "firing": 0}
    except Exception as e:
        return {"error": str(e)}


def get_instance_status(
    compute_client: oci.core.ComputeClient,
    compartment_id: str
) -> Dict[str, Any]:
    """Get compute instance status summary."""
    try:
        response = compute_client.list_instances(compartment_id=compartment_id)
        if response.data:
            running = sum(1 for i in response.data if i.lifecycle_state == "RUNNING")
            stopped = sum(1 for i in response.data if i.lifecycle_state == "STOPPED")
            return {
                "total": len(response.data),
                "running": running,
                "stopped": stopped,
                "instances": [
                    {
                        "name": inst.display_name,
                        "state": inst.lifecycle_state,
                        "ocid": inst.id
                    }
                    for inst in response.data
                ]
            }
        return {"total": 0, "running": 0, "stopped": 0, "instances": []}
    except Exception as e:
        return {"error": str(e)}


def display_dashboard(
    monitoring_client: oci.monitoring.MonitoringClient,
    compute_client: oci.core.ComputeClient,
    compartment_id: str,
    instance_id: Optional[str] = None
):
    """Display SRE Dashboard with metrics and status."""
    print("=" * 80)
    print(" " * 25 + "SRE DASHBOARD - BharatMart")
    print("=" * 80)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Compartment: {compartment_id[:50]}...")
    print()
    
    # Infrastructure Metrics
    print("-" * 80)
    print("INFRASTRUCTURE METRICS")
    print("-" * 80)
    
    cpu = get_latest_metric_value(
        monitoring_client,
        "oci_computeagent",
        "CpuUtilization",
        compartment_id,
        instance_id
    )
    cpu_display = f"{cpu:.2f}%" if cpu is not None else "Not available"
    cpu_status = "⚠️ " if cpu and cpu > 80 else "✅" if cpu is not None else "❓"
    print(f"{cpu_status} CPU Utilization: {cpu_display}")
    
    memory = get_latest_metric_value(
        monitoring_client,
        "oci_computeagent",
        "MemoryUtilization",
        compartment_id,
        instance_id
    )
    memory_display = f"{memory:.2f}%" if memory is not None else "Not available"
    memory_status = "⚠️ " if memory and memory > 85 else "✅" if memory is not None else "❓"
    print(f"{memory_status} Memory Utilization: {memory_display}")
    
    # Application Metrics (BharatMart Custom Metrics)
    print()
    print("-" * 80)
    print("APPLICATION METRICS (BharatMart)")
    print("-" * 80)
    
    latency = get_latest_metric_value(
        monitoring_client,
        "custom.bharatmart",
        "api_latency_seconds",
        compartment_id
    )
    if latency is not None:
        latency_ms = latency * 1000
        latency_status = "⚠️ " if latency_ms > 500 else "✅"
        print(f"{latency_status} API Latency (avg): {latency_ms:.2f}ms ({latency:.3f}s)")
    else:
        print("❓ API Latency: Not available (custom metrics may not be ingested yet)")
    
    request_rate = get_latest_metric_value(
        monitoring_client,
        "custom.bharatmart",
        "http_requests_total",
        compartment_id
    )
    if request_rate is not None:
        print(f"✅ Request Rate: {request_rate:.0f} requests/min")
    else:
        print("❓ Request Rate: Not available")
    
    # Service Health
    print()
    print("-" * 80)
    print("SERVICE HEALTH")
    print("-" * 80)
    
    instance_status = get_instance_status(compute_client, compartment_id)
    if "error" not in instance_status:
        running = instance_status.get('running', 0)
        total = instance_status.get('total', 0)
        health_status = "✅" if running == total and total > 0 else "⚠️ " if running > 0 else "❌"
        print(f"{health_status} Compute Instances: {running}/{total} running")
        
        if instance_status.get('instances'):
            print("\nInstance Details:")
            for inst in instance_status['instances'][:5]:  # Show first 5
                state_icon = "✅" if inst['state'] == "RUNNING" else "❌"
                print(f"  {state_icon} {inst['name']}: {inst['state']}")
            if len(instance_status['instances']) > 5:
                print(f"  ... and {len(instance_status['instances']) - 5} more")
    else:
        print(f"❌ Error getting instance status: {instance_status['error']}")
    
    # Alarm Status
    print()
    print("-" * 80)
    print("ALARM STATUS")
    print("-" * 80)
    
    alarm_summary = get_alarm_summary(monitoring_client, compartment_id)
    if "error" not in alarm_summary:
        total = alarm_summary.get('total', 0)
        enabled = alarm_summary.get('enabled', 0)
        firing = alarm_summary.get('firing', 0)
        
        alarm_icon = "✅" if firing == 0 else "⚠️ " if firing < 3 else "❌"
        print(f"{alarm_icon} Total Alarms: {total}")
        print(f"   Enabled: {enabled}")
        print(f"   Firing: {firing}")
    else:
        print(f"❌ Error getting alarm status: {alarm_summary['error']}")
    
    # SLO Status (Example)
    print()
    print("-" * 80)
    print("SLO STATUS")
    print("-" * 80)
    
    if "error" not in instance_status:
        total = instance_status.get('total', 0)
        running = instance_status.get('running', 0)
        if total > 0:
            availability = (running / total) * 100
            slo_target = 99.9
            slo_status = "✅" if availability >= slo_target else "⚠️ "
            print(f"{slo_status} Availability: {availability:.2f}%")
            print(f"   SLO Target: {slo_target}%")
            
            if availability >= slo_target:
                print("   Status: Meeting SLO")
            else:
                breach = slo_target - availability
                print(f"   Status: SLO Breach (-{breach:.2f}%)")
        else:
            print("❓ No instances found for SLO calculation")
    else:
        print("❓ Cannot calculate SLO (instance status unavailable)")
    
    # Error Budget (Example calculation)
    if latency is not None and latency_ms > 500:
        print()
        print("-" * 80)
        print("ERROR BUDGET")
        print("-" * 80)
        print("⚠️  High latency detected - consuming error budget")
        print("   Consider investigating latency issues")
    
    print()
    print("=" * 80)
    print()
    print("Note: Some metrics may take a few minutes to appear after deployment.")
    print("      Custom metrics require ingestion script to be running.")


def main():
    """Main function to run SRE Dashboard."""
    if not COMPARTMENT_OCID:
        print("Error: OCI_COMPARTMENT_ID environment variable is required", file=sys.stderr)
        print("Usage: export OCI_COMPARTMENT_ID=ocid1.compartment.oc1...", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Load OCI configuration
        config = oci.config.from_file(
            file_location=os.path.expanduser(OCI_CONFIG_FILE),
            profile_name=os.getenv('OCI_PROFILE', 'DEFAULT')
        )
        
        # Create OCI clients
        monitoring_client = oci.monitoring.MonitoringClient(config)
        compute_client = oci.core.ComputeClient(config)
        
        # Display dashboard
        display_dashboard(
            monitoring_client,
            compute_client,
            COMPARTMENT_OCID,
            INSTANCE_OCID if INSTANCE_OCID else None
        )
        
    except oci.exceptions.ConfigFileNotFound:
        print("Error: OCI config file not found", file=sys.stderr)
        print(f"Expected location: {os.path.expanduser(OCI_CONFIG_FILE)}", file=sys.stderr)
        print("Please configure OCI CLI first: https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

