#!/bin/bash
#
# Verification Script for SRE Training Platform Implementation
#
# This script verifies that all implemented scripts and files exist and have
# valid syntax. It does NOT test functionality - use TESTING_AND_VALIDATION_CHECKLIST.md
# for functional testing.
#
# Usage:
#   ./scripts/verify-implementation.sh
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# Helper functions
log_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

log_skip() {
    echo -e "${YELLOW}⊘${NC} $1 (skipped)"
    ((SKIPPED++))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_file_exists() {
    if [ -f "$1" ]; then
        log_pass "File exists: $1"
        return 0
    else
        log_fail "File missing: $1"
        return 1
    fi
}

check_directory_exists() {
    if [ -d "$1" ]; then
        log_pass "Directory exists: $1"
        return 0
    else
        log_fail "Directory missing: $1"
        return 1
    fi
}

check_python_syntax() {
    if python3 -m py_compile "$1" 2>/dev/null; then
        log_pass "Python syntax valid: $1"
        return 0
    else
        log_fail "Python syntax error: $1"
        return 1
    fi
}

check_bash_syntax() {
    if bash -n "$1" 2>/dev/null; then
        log_pass "Bash syntax valid: $1"
        return 0
    else
        log_fail "Bash syntax error: $1"
        return 1
    fi
}

check_file_executable() {
    if [ -x "$1" ]; then
        log_pass "File is executable: $1"
        return 0
    else
        log_skip "File not executable: $1 (may be intentional)"
        return 0
    fi
}

echo "================================================================================"
echo "                    SRE TRAINING PLATFORM - VERIFICATION SCRIPT"
echo "================================================================================"
echo ""
echo "This script verifies file existence and syntax only."
echo "For functional testing, see: TESTING_AND_VALIDATION_CHECKLIST.md"
echo ""
echo "================================================================================"
echo ""

# 1. OCI Telemetry SDK Metrics Ingestion Script
echo "1. OCI Telemetry SDK Metrics Ingestion Script"
echo "-----------------------------------------------"
check_file_exists "scripts/oci-telemetry-metrics-ingestion.py"
if [ -f "scripts/oci-telemetry-metrics-ingestion.py" ]; then
    check_python_syntax "scripts/oci-telemetry-metrics-ingestion.py"
    check_file_executable "scripts/oci-telemetry-metrics-ingestion.py"
fi
echo ""

# 2. Instance Pools + Auto Scaling Terraform
echo "2. Instance Pools + Auto Scaling Terraform"
echo "-------------------------------------------"
check_file_exists "deployment/terraform/option-2/instance-pool-autoscaling.tf"
check_file_exists "deployment/terraform/option-2/variables.tf"
check_file_exists "deployment/terraform/option-2/outputs.tf"
echo ""

# 3. OCI CLI Chaos Scripts
echo "3. OCI CLI Chaos/Failure Injection Scripts"
echo "-------------------------------------------"
check_directory_exists "scripts/chaos"
check_file_exists "scripts/chaos/oci-cli-failure-injection.sh"
check_file_exists "scripts/chaos/README.md"
if [ -f "scripts/chaos/oci-cli-failure-injection.sh" ]; then
    check_bash_syntax "scripts/chaos/oci-cli-failure-injection.sh"
    check_file_executable "scripts/chaos/oci-cli-failure-injection.sh"
fi
echo ""

# 4. OCI Functions Examples
echo "4. OCI Functions Example Scripts"
echo "---------------------------------"
check_directory_exists "scripts/oci-functions"
check_file_exists "scripts/oci-functions/health-check-function/func.py"
check_file_exists "scripts/oci-functions/health-check-function/func.yaml"
check_file_exists "scripts/oci-functions/health-check-function/requirements.txt"
check_file_exists "scripts/oci-functions/README.md"
if [ -f "scripts/oci-functions/health-check-function/func.py" ]; then
    check_python_syntax "scripts/oci-functions/health-check-function/func.py"
fi
echo ""

# 5. OCI Service Connector Hub
echo "5. OCI Service Connector Hub Configuration"
echo "------------------------------------------"
check_directory_exists "scripts/oci-service-connector-hub"
check_file_exists "scripts/oci-service-connector-hub/incident-response-function/func.py"
check_file_exists "scripts/oci-service-connector-hub/incident-response-function/func.yaml"
check_file_exists "scripts/oci-service-connector-hub/service-connector-terraform.tf"
check_file_exists "scripts/oci-service-connector-hub/README.md"
if [ -f "scripts/oci-service-connector-hub/incident-response-function/func.py" ]; then
    check_python_syntax "scripts/oci-service-connector-hub/incident-response-function/func.py"
fi
echo ""

# 6. OCI REST API Dashboard Scripts
echo "6. OCI REST API Dashboard Scripts"
echo "----------------------------------"
check_directory_exists "scripts/oci-rest-api-dashboard"
check_file_exists "scripts/oci-rest-api-dashboard/sre-dashboard.py"
check_file_exists "scripts/oci-rest-api-dashboard/query-metrics.py"
check_file_exists "scripts/oci-rest-api-dashboard/README.md"
if [ -f "scripts/oci-rest-api-dashboard/sre-dashboard.py" ]; then
    check_python_syntax "scripts/oci-rest-api-dashboard/sre-dashboard.py"
fi
if [ -f "scripts/oci-rest-api-dashboard/query-metrics.py" ]; then
    check_python_syntax "scripts/oci-rest-api-dashboard/query-metrics.py"
fi
echo ""

# 7. OCI Cloud Agent Configuration Guide
echo "7. OCI Cloud Agent Configuration Guide"
echo "--------------------------------------"
check_file_exists "docs/06-observability/08-oci-cloud-agent-setup.md"
echo ""

# Summary
echo "================================================================================"
echo "                                 SUMMARY"
echo "================================================================================"
echo ""
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All verifications passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review TESTING_AND_VALIDATION_CHECKLIST.md for functional testing"
    echo "  2. Test scripts in a non-production OCI environment"
    echo "  3. Update validation report with test results"
    exit 0
else
    echo -e "${RED}✗ Some verifications failed. Please fix the issues above.${NC}"
    exit 1
fi

