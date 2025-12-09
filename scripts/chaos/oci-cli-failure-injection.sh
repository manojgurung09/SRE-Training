#!/bin/bash
#
# OCI CLI Chaos/Failure Injection Script for BharatMart
#
# This script provides OCI CLI-based failure injection for chaos engineering
# demonstrations and testing (Day 4 Demo 5).
#
# Usage:
#   ./scripts/chaos/oci-cli-failure-injection.sh <action> [options]
#
# Actions:
#   baseline          - Show baseline system state
#   stop-instance     - Stop a backend instance
#   start-instance    - Start a stopped instance
#   check-health      - Check Load Balancer backend health
#   list-instances    - List all instances
#   enable-chaos      - Enable chaos engineering on instance (requires SSH)
#   disable-chaos     - Disable chaos engineering on instance (requires SSH)
#
# Prerequisites:
#   - OCI CLI installed and configured
#   - OCI config file: ~/.oci/config
#   - Appropriate OCI permissions
#
# Environment Variables:
#   COMPARTMENT_OCID    - OCI Compartment OCID (required)
#   LOAD_BALANCER_OCID  - Load Balancer OCID (for health checks)
#   BACKEND_SET_NAME    - Backend set name (default: backend-api-backendset)
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPARTMENT_OCID="${COMPARTMENT_OCID:-}"
LOAD_BALANCER_OCID="${LOAD_BALANCER_OCID:-}"
BACKEND_SET_NAME="${BACKEND_SET_NAME:-backend-api-backendset}"
INSTANCE_OCID="${INSTANCE_OCID:-}"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate prerequisites
check_oci_cli() {
    if ! command -v oci &> /dev/null; then
        log_error "OCI CLI not found. Please install OCI CLI first."
        exit 1
    fi
}

check_compartment() {
    if [ -z "$COMPARTMENT_OCID" ]; then
        log_error "COMPARTMENT_OCID environment variable is required"
        log_info "Example: export COMPARTMENT_OCID=ocid1.compartment.oc1..."
        exit 1
    fi
}

# Action: Show baseline system state
baseline() {
    log_info "=== BASELINE SYSTEM STATE ==="
    echo ""
    
    log_info "Listing all instances in compartment..."
    oci compute instance list \
        --compartment-id "$COMPARTMENT_OCID" \
        --query "data[*].{Name:\"display-name\",State:\"lifecycle-state\",OCID:id,AD:\"availability-domain\"}" \
        --output table
    
    echo ""
    
    if [ -n "$LOAD_BALANCER_OCID" ]; then
        log_info "Checking Load Balancer backend health..."
        oci lb backend-health get \
            --load-balancer-id "$LOAD_BALANCER_OCID" \
            --backend-set-name "$BACKEND_SET_NAME" \
            --query "data[*].{Instance:\"backend-name\",Health:\"health-check-status\",Reason:\"health-check-reason\"}" \
            --output table 2>/dev/null || log_warning "Could not retrieve backend health (backend set may not exist)"
    else
        log_warning "LOAD_BALANCER_OCID not set, skipping health check"
    fi
    
    echo ""
    log_info "Baseline state captured. Monitor metrics before injecting failures."
}

# Action: Stop an instance
stop_instance() {
    local instance_ocid="${INSTANCE_OCID:-$1:-}"
    
    if [ -z "$instance_ocid" ]; then
        log_error "Instance OCID is required"
        log_info "Usage: stop-instance <instance-ocid>"
        log_info "Or set: export INSTANCE_OCID=ocid1.instance.oc1..."
        exit 1
    fi
    
    log_warning "Stopping instance: $instance_ocid"
    log_info "This will cause the instance to stop and traffic to be rerouted."
    
    oci compute instance action \
        --instance-id "$instance_ocid" \
        --action STOP \
        --wait-for-state STOPPED \
        --max-wait-seconds 300
    
    log_success "Instance stopped successfully"
    log_info "Load Balancer should detect the failure and reroute traffic to healthy backends"
}

# Action: Start an instance
start_instance() {
    local instance_ocid="${INSTANCE_OCID:-$1:-}"
    
    if [ -z "$instance_ocid" ]; then
        log_error "Instance OCID is required"
        log_info "Usage: start-instance <instance-ocid>"
        log_info "Or set: export INSTANCE_OCID=ocid1.instance.oc1..."
        exit 1
    fi
    
    log_info "Starting instance: $instance_ocid"
    
    oci compute instance action \
        --instance-id "$instance_ocid" \
        --action START \
        --wait-for-state RUNNING \
        --max-wait-seconds 300
    
    log_success "Instance started successfully"
    log_info "Instance will be available after boot time. Health checks will mark it healthy when ready."
}

# Action: Check Load Balancer backend health
check_health() {
    if [ -z "$LOAD_BALANCER_OCID" ]; then
        log_error "LOAD_BALANCER_OCID environment variable is required"
        log_info "Example: export LOAD_BALANCER_OCID=ocid1.loadbalancer.oc1..."
        exit 1
    fi
    
    log_info "Checking Load Balancer backend health..."
    echo ""
    
    oci lb backend-health get \
        --load-balancer-id "$LOAD_BALANCER_OCID" \
        --backend-set-name "$BACKEND_SET_NAME" \
        --query "data[*].{Instance:\"backend-name\",Health:\"health-check-status\",Reason:\"health-check-reason\",Port:port}" \
        --output table
}

# Action: List all instances
list_instances() {
    log_info "Listing all instances in compartment: $COMPARTMENT_OCID"
    echo ""
    
    oci compute instance list \
        --compartment-id "$COMPARTMENT_OCID" \
        --all \
        --query "data[*].{Name:\"display-name\",State:\"lifecycle-state\",OCID:id,AD:\"availability-domain\",PrivateIP:\"private-ip\",PublicIP:\"public-ip\"}" \
        --output table
}

# Action: Enable chaos engineering on instance (requires SSH)
enable_chaos() {
    local instance_ip="${1:-}"
    local latency_ms="${2:-500}"
    local ssh_user="${SSH_USER:-opc}"
    
    if [ -z "$instance_ip" ]; then
        log_error "Instance IP address is required"
        log_info "Usage: enable-chaos <instance-ip> [latency-ms]"
        exit 1
    fi
    
    log_warning "Enabling chaos engineering on instance: $instance_ip"
    log_info "Latency injection: ${latency_ms}ms"
    
    # SSH to instance and enable chaos
    log_info "Connecting to instance via SSH..."
    
    ssh -o StrictHostKeyChecking=no "$ssh_user@$instance_ip" << EOF
        echo "Enabling chaos engineering..."
        export CHAOS_ENABLED=true
        export CHAOS_LATENCY_MS=${latency_ms}
        
        # Add to environment if using systemd service
        if [ -f /etc/systemd/system/bharatmart-api.service ]; then
            sudo sed -i '/Environment=/d' /etc/systemd/system/bharatmart-api.service
            echo "Environment=CHAOS_ENABLED=true" | sudo tee -a /etc/systemd/system/bharatmart-api.service
            echo "Environment=CHAOS_LATENCY_MS=${latency_ms}" | sudo tee -a /etc/systemd/system/bharatmart-api.service
            sudo systemctl daemon-reload
            sudo systemctl restart bharatmart-api
            echo "Chaos enabled via systemd service"
        else
            echo "Systemd service not found. Set environment variables manually:"
            echo "  export CHAOS_ENABLED=true"
            echo "  export CHAOS_LATENCY_MS=${latency_ms}"
        fi
EOF
    
    log_success "Chaos engineering enabled on instance"
    log_info "Latency injection: ${latency_ms}ms will be added to all requests"
}

# Action: Disable chaos engineering on instance (requires SSH)
disable_chaos() {
    local instance_ip="${1:-}"
    local ssh_user="${SSH_USER:-opc}"
    
    if [ -z "$instance_ip" ]; then
        log_error "Instance IP address is required"
        log_info "Usage: disable-chaos <instance-ip>"
        exit 1
    fi
    
    log_info "Disabling chaos engineering on instance: $instance_ip"
    
    ssh -o StrictHostKeyChecking=no "$ssh_user@$instance_ip" << EOF
        echo "Disabling chaos engineering..."
        export CHAOS_ENABLED=false
        
        # Remove from systemd service if exists
        if [ -f /etc/systemd/system/bharatmart-api.service ]; then
            sudo sed -i '/CHAOS_ENABLED/d' /etc/systemd/system/bharatmart-api.service
            sudo sed -i '/CHAOS_LATENCY_MS/d' /etc/systemd/system/bharatmart-api.service
            sudo systemctl daemon-reload
            sudo systemctl restart bharatmart-api
            echo "Chaos disabled via systemd service"
        else
            echo "Systemd service not found. Set environment variable manually:"
            echo "  export CHAOS_ENABLED=false"
        fi
EOF
    
    log_success "Chaos engineering disabled on instance"
}

# Main script logic
main() {
    local action="${1:-help}"
    
    check_oci_cli
    
    case "$action" in
        baseline)
            check_compartment
            baseline
            ;;
        stop-instance)
            check_compartment
            stop_instance "${2:-}"
            ;;
        start-instance)
            check_compartment
            start_instance "${2:-}"
            ;;
        check-health)
            check_health
            ;;
        list-instances)
            check_compartment
            list_instances
            ;;
        enable-chaos)
            enable_chaos "${2:-}" "${3:-500}"
            ;;
        disable-chaos)
            disable_chaos "${2:-}"
            ;;
        help|--help|-h)
            cat << EOF
OCI CLI Chaos/Failure Injection Script for BharatMart

Usage:
    $0 <action> [options]

Actions:
    baseline <compartment-ocid>
        Show baseline system state (instances, health checks)
        
    stop-instance <instance-ocid>
        Stop a backend instance to simulate failure
        
    start-instance <instance-ocid>
        Start a stopped instance to restore service
        
    check-health <lb-ocid> [backend-set-name]
        Check Load Balancer backend health status
        
    list-instances <compartment-ocid>
        List all instances in compartment
        
    enable-chaos <instance-ip> [latency-ms]
        Enable chaos engineering on instance (requires SSH access)
        Default latency: 500ms
        
    disable-chaos <instance-ip>
        Disable chaos engineering on instance (requires SSH access)

Environment Variables:
    COMPARTMENT_OCID       - OCI Compartment OCID (required for most actions)
    LOAD_BALANCER_OCID     - Load Balancer OCID (for health checks)
    BACKEND_SET_NAME       - Backend set name (default: backend-api-backendset)
    INSTANCE_OCID          - Instance OCID (can be provided as argument instead)
    SSH_USER               - SSH user (default: opc)

Examples:
    # Show baseline state
    export COMPARTMENT_OCID=ocid1.compartment.oc1...
    $0 baseline
    
    # Stop an instance
    $0 stop-instance ocid1.instance.oc1...
    
    # Enable chaos with 500ms latency
    $0 enable-chaos 10.0.2.5 500
    
    # Check Load Balancer health
    export LOAD_BALANCER_OCID=ocid1.loadbalancer.oc1...
    $0 check-health

EOF
            ;;
        *)
            log_error "Unknown action: $action"
            log_info "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

