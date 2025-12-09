@echo off
REM SRE End-to-End Validation Script (Windows)
REM This script runs all E2E tests and provides a release gate decision

echo ==========================================
echo SRE E2E Validation Framework
echo ==========================================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found
    echo    Some tests may fail without proper environment configuration
)

echo Running E2E test suite...
echo.

REM Run Jest tests
call npm test -- --testPathPattern=e2e --verbose

REM Capture exit code
set TEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo ==========================================

if %TEST_EXIT_CODE% EQU 0 (
    echo [SUCCESS] SAFE TO DEPLOY
    echo.
    echo All E2E tests passed successfully.
    echo The system is ready for production deployment.
    exit /b 0
) else (
    echo [FAILURE] BLOCK RELEASE
    echo.
    echo One or more E2E tests failed.
    echo Please fix the issues before deploying to production.
    exit /b 1
)

