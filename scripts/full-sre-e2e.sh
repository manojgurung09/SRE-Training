#!/bin/bash

# SRE End-to-End Validation Script
# This script runs all E2E tests and provides a release gate decision

set -e  # Exit on any error

echo "=========================================="
echo "SRE E2E Validation Framework"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "   Some tests may fail without proper environment configuration"
fi

echo "Running E2E test suite..."
echo ""

# Run Jest tests
npm test -- --testPathPattern=e2e --verbose

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ SAFE TO DEPLOY${NC}"
    echo ""
    echo "All E2E tests passed successfully."
    echo "The system is ready for production deployment."
    exit 0
else
    echo -e "${RED}❌ BLOCK RELEASE${NC}"
    echo ""
    echo "One or more E2E tests failed."
    echo "Please fix the issues before deploying to production."
    exit 1
fi

