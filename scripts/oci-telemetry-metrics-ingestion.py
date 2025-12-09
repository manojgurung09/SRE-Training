#!/usr/bin/env python3
"""
OCI Telemetry SDK Metrics Ingestion Script for BharatMart

This script reads Prometheus metrics from the BharatMart application's /metrics endpoint
and posts them to OCI Monitoring as custom metrics.

Requirements:
- OCI Python SDK installed: pip install oci
- OCI configuration file: ~/.oci/config
- BharatMart application running and exposing metrics at /metrics endpoint

Usage:
    python3 scripts/oci-telemetry-metrics-ingestion.py

Configuration:
    Set environment variables or modify script variables:
    - COMPARTMENT_OCID: OCI Compartment OCID
    - METRICS_ENDPOINT: BharatMart metrics endpoint URL (default: http://localhost:3000/metrics)
    - NAMESPACE: OCI Monitoring namespace (default: custom.bharatmart)
"""

import os
import sys
import oci
import requests
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
import argparse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration - can be overridden by environment variables
COMPARTMENT_OCID = os.getenv('OCI_COMPARTMENT_ID', '')
METRICS_ENDPOINT = os.getenv('METRICS_ENDPOINT', 'http://localhost:3000/metrics')
NAMESPACE = os.getenv('OCI_METRICS_NAMESPACE', 'custom.bharatmart')
OCI_CONFIG_FILE = os.getenv('OCI_CONFIG_FILE', '~/.oci/config')
OCI_PROFILE = os.getenv('OCI_PROFILE', 'DEFAULT')


def parse_prometheus_metrics(prometheus_text: str) -> Dict[str, Any]:
    """
    Parse Prometheus format metrics from /metrics endpoint.
    
    Handles:
    - Counters: http_requests_total{labels} value
    - Histograms: http_request_duration_seconds_sum{labels} value
    - Gauges: simulated_latency_ms{labels} value
    
    Args:
        prometheus_text: Raw Prometheus metrics text
        
    Returns:
        Dictionary mapping metric names to their values and labels
    """
    metrics = {}
    current_metric = None
    current_labels = {}
    
    for line in prometheus_text.split('\n'):
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('#'):
            continue
        
        # Parse metric line: name{labels} value [timestamp]
        # Example: http_requests_total{method="GET",route="/api/products",status_code="200"} 42
        match = re.match(r'^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]+)\})?\s+([\d.]+)(?:\s+(\d+))?$', line)
        if match:
            metric_name = match.group(1)
            labels_str = match.group(2) if match.group(2) else ""
            value = float(match.group(3))
            
            # Parse labels
            labels = {}
            if labels_str:
                # Split by comma, handle quoted values
                label_pattern = r'([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"'
                for label_match in re.finditer(label_pattern, labels_str):
                    key = label_match.group(1)
                    val = label_match.group(2)
                    labels[key] = val
            
            # Store metric with full name including labels as key
            metric_key = f"{metric_name}"
            if metric_key not in metrics:
                metrics[metric_key] = []
            
            metrics[metric_key].append({
                'value': value,
                'labels': labels,
                'name': metric_name
            })
    
    return metrics


def post_metrics_to_oci(
    monitoring_client: oci.monitoring.MonitoringClient,
    compartment_id: str,
    namespace: str,
    metrics_data: List[Dict[str, Any]]
) -> bool:
    """
    Post metrics to OCI Monitoring.
    
    Args:
        monitoring_client: OCI Monitoring client
        compartment_id: OCI Compartment OCID
        namespace: OCI Monitoring namespace
        metrics_data: List of metric data dictionaries
        
    Returns:
        True if successful, False otherwise
    """
    if not metrics_data:
        logger.warning("No metrics to post")
        return False
    
    try:
        post_metric_data_details = oci.monitoring.models.PostMetricDataDetails(
            metric_data=metrics_data
        )
        
        response = monitoring_client.post_metric_data(
            post_metric_data_details=post_metric_data_details,
            compartment_id=compartment_id
        )
        
        logger.info(f"Successfully posted {len(metrics_data)} metrics to OCI Monitoring")
        logger.debug(f"Response: {response.data}")
        return True
        
    except Exception as e:
        logger.error(f"Error posting metrics to OCI: {e}")
        return False


def convert_prometheus_to_oci_metrics(
    prometheus_metrics: Dict[str, Any],
    namespace: str,
    filter_metrics: Optional[List[str]] = None
) -> List[oci.monitoring.models.MetricData]:
    """
    Convert Prometheus metrics to OCI Monitoring format.
    
    Filters and converts key metrics:
    - http_request_duration_seconds (histogram -> average latency)
    - http_requests_total (counter)
    - orders_created_total, orders_success_total, orders_failed_total
    - payments_processed_total
    - errors_total
    
    Args:
        prometheus_metrics: Parsed Prometheus metrics
        namespace: OCI Monitoring namespace
        filter_metrics: Optional list of metric names to include (None = all)
        
    Returns:
        List of OCI MetricData objects
    """
    oci_metrics = []
    now = datetime.utcnow()
    
    # Track histogram sums and counts for averaging
    histogram_sums = {}
    histogram_counts = {}
    
    # First pass: collect histogram data
    for metric_key, metric_list in prometheus_metrics.items():
        for metric in metric_list:
            metric_name = metric['name']
            
            # Skip if filter is specified and metric not in filter
            if filter_metrics and metric_name not in filter_metrics:
                continue
            
            # Handle histogram sum and count separately
            if metric_name.endswith('_sum'):
                base_name = metric_name[:-4]
                if base_name not in histogram_sums:
                    histogram_sums[base_name] = []
                histogram_sums[base_name].append(metric)
            elif metric_name.endswith('_count'):
                base_name = metric_name[:-6]
                if base_name not in histogram_counts:
                    histogram_counts[base_name] = []
                histogram_counts[base_name].append(metric)
    
    # Calculate average latency from histogram
    if 'http_request_duration_seconds' in histogram_sums and 'http_request_duration_seconds' in histogram_counts:
        for sum_metric in histogram_sums['http_request_duration_seconds']:
            for count_metric in histogram_counts['http_request_duration_seconds']:
                if sum_metric['labels'] == count_metric['labels']:
                    count = count_metric['value']
                    if count > 0:
                        avg_latency = sum_metric['value'] / count
                        
                        dimensions = {**sum_metric['labels']}
                        metric_data = oci.monitoring.models.MetricData(
                            namespace=namespace,
                            name='api_latency_seconds',
                            dimensions=dimensions,
                            datapoints=[
                                oci.monitoring.models.Datapoint(
                                    timestamp=now,
                                    value=avg_latency
                                )
                            ]
                        )
                        oci_metrics.append(metric_data)
    
    # Convert counters and gauges
    key_metrics = [
        'http_requests_total',
        'orders_created_total',
        'orders_success_total',
        'orders_failed_total',
        'payments_processed_total',
        'errors_total',
        'chaos_events_total',
        'simulated_latency_ms'
    ]
    
    for metric_key, metric_list in prometheus_metrics.items():
        for metric in metric_list:
            metric_name = metric['name']
            
            # Skip histogram internal metrics (already processed)
            if metric_name.endswith('_sum') or metric_name.endswith('_count') or metric_name.endswith('_bucket'):
                continue
            
            # Apply filter if specified
            if filter_metrics and metric_name not in filter_metrics:
                continue
            
            # Include key metrics or all if no filter
            if not filter_metrics or metric_name in key_metrics:
                dimensions = {**metric['labels']}
                
                metric_data = oci.monitoring.models.MetricData(
                    namespace=namespace,
                    name=metric_name,
                    dimensions=dimensions,
                    datapoints=[
                        oci.monitoring.models.Datapoint(
                            timestamp=now,
                            value=metric['value']
                        )
                    ]
                )
                oci_metrics.append(metric_data)
    
    return oci_metrics


def main():
    """Main function to fetch metrics and post to OCI Monitoring."""
    parser = argparse.ArgumentParser(
        description='Ingest BharatMart Prometheus metrics into OCI Monitoring'
    )
    parser.add_argument(
        '--compartment-id',
        default=COMPARTMENT_OCID,
        help='OCI Compartment OCID (or set OCI_COMPARTMENT_ID env var)'
    )
    parser.add_argument(
        '--metrics-endpoint',
        default=METRICS_ENDPOINT,
        help='BharatMart metrics endpoint URL'
    )
    parser.add_argument(
        '--namespace',
        default=NAMESPACE,
        help='OCI Monitoring namespace'
    )
    parser.add_argument(
        '--config-file',
        default=OCI_CONFIG_FILE,
        help='OCI config file path'
    )
    parser.add_argument(
        '--profile',
        default=OCI_PROFILE,
        help='OCI config profile'
    )
    parser.add_argument(
        '--filter',
        nargs='+',
        help='Filter specific metrics to ingest'
    )
    parser.add_argument(
        '--verbose',
        '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate compartment ID
    compartment_id = args.compartment_id or os.getenv('OCI_COMPARTMENT_ID')
    if not compartment_id:
        logger.error("Compartment ID is required. Set OCI_COMPARTMENT_ID env var or use --compartment-id")
        sys.exit(1)
    
    logger.info(f"Fetching metrics from: {args.metrics_endpoint}")
    logger.info(f"Posting to OCI Monitoring namespace: {args.namespace}")
    logger.info(f"Compartment OCID: {compartment_id}")
    
    # Fetch metrics from BharatMart
    try:
        response = requests.get(args.metrics_endpoint, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching metrics from {args.metrics_endpoint}: {e}")
        sys.exit(1)
    
    # Parse Prometheus metrics
    logger.info("Parsing Prometheus metrics...")
    prometheus_metrics = parse_prometheus_metrics(response.text)
    logger.info(f"Parsed {len(prometheus_metrics)} metric types")
    
    # Convert to OCI format
    logger.info("Converting metrics to OCI format...")
    oci_metrics = convert_prometheus_to_oci_metrics(
        prometheus_metrics,
        args.namespace,
        filter_metrics=args.filter
    )
    logger.info(f"Converted {len(oci_metrics)} metrics to OCI format")
    
    if not oci_metrics:
        logger.warning("No metrics to post after conversion")
        sys.exit(0)
    
    # Initialize OCI Monitoring client
    try:
        config = oci.config.from_file(
            file_location=os.path.expanduser(args.config_file),
            profile_name=args.profile
        )
        monitoring_client = oci.monitoring.MonitoringClient(config)
        logger.info("OCI Monitoring client initialized")
    except Exception as e:
        logger.error(f"Error initializing OCI client: {e}")
        logger.error("Make sure OCI config file exists and is properly configured")
        sys.exit(1)
    
    # Post metrics to OCI Monitoring
    logger.info("Posting metrics to OCI Monitoring...")
    success = post_metrics_to_oci(
        monitoring_client,
        compartment_id,
        args.namespace,
        oci_metrics
    )
    
    if success:
        logger.info("✅ Metrics successfully posted to OCI Monitoring!")
        sys.exit(0)
    else:
        logger.error("❌ Failed to post metrics to OCI Monitoring")
        sys.exit(1)


if __name__ == '__main__':
    main()

