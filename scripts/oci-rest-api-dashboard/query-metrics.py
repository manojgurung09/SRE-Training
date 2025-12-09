#!/usr/bin/env python3
"""
Query OCI Monitoring Metrics via REST API

Example script to query metrics from OCI Monitoring.

Usage:
    python3 scripts/oci-rest-api-dashboard/query-metrics.py

Environment Variables:
    OCI_COMPARTMENT_ID    - OCI Compartment OCID (required)
    OCI_INSTANCE_ID       - Optional: Instance OCID
    METRIC_NAMESPACE      - Namespace (default: oci_computeagent)
    METRIC_NAME           - Metric name (default: CpuUtilization)
"""

import os
import sys
import oci
from datetime import datetime, timedelta

COMPARTMENT_OCID = os.getenv('OCI_COMPARTMENT_ID', '')
INSTANCE_OCID = os.getenv('OCI_INSTANCE_ID', '')
NAMESPACE = os.getenv('METRIC_NAMESPACE', 'oci_computeagent')
METRIC_NAME = os.getenv('METRIC_NAME', 'CpuUtilization')


def query_metrics(namespace: str, metric_name: str, compartment_id: str, resource_id: str = None):
    """Query metrics from OCI Monitoring."""
    
    # Load OCI config
    config = oci.config.from_file()
    
    # Create Monitoring client
    monitoring = oci.monitoring.MonitoringClient(config)
    
    # Calculate time range (last 1 hour)
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=1)
    
    # Build query
    query = f"{namespace}.{metric_name}"
    if resource_id:
        query += f"{{resourceId=\"{resource_id}\"}}"
    
    print(f"Query: {query}")
    print(f"Time Range: {start_time.isoformat()} to {end_time.isoformat()}")
    print("-" * 60)
    
    try:
        # Query metrics
        response = monitoring.summarize_metrics_data(
            compartment_id=compartment_id,
            summarize_metrics_data_details=oci.monitoring.models.SummarizeMetricsDataDetails(
                namespace=namespace,
                query=query,
                start_time=start_time.isoformat(),
                end_time=end_time.isoformat(),
                resolution="1m"
            )
        )
        
        # Process results
        if response.data:
            for metric in response.data:
                print(f"\nMetric: {metric.name}")
                print(f"Namespace: {metric.namespace}")
                if metric.datapoints:
                    print(f"Data Points: {len(metric.datapoints)}")
                    print("\nRecent Values:")
                    for dp in metric.datapoints[-10:]:  # Last 10 points
                        timestamp = dp.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                        value = dp.value
                        print(f"  {timestamp}: {value}")
                else:
                    print("No data points available")
        else:
            print("No metrics returned")
            
        return response.data
        
    except oci.exceptions.ServiceError as e:
        print(f"Error querying metrics: {e.message}")
        raise


if __name__ == "__main__":
    if not COMPARTMENT_OCID:
        print("Error: OCI_COMPARTMENT_ID environment variable is required", file=sys.stderr)
        sys.exit(1)
    
    print("=== OCI Metrics Query ===")
    print("")
    query_metrics(NAMESPACE, METRIC_NAME, COMPARTMENT_OCID, INSTANCE_OCID)

