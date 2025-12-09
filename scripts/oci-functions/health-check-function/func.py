"""
OCI Function: Automated Health Check for BharatMart API

This function performs automated health checks on the BharatMart API,
reducing toil from manual monitoring tasks.

Use Case: Scheduled health checks (every 5 minutes) to monitor API availability
Toil Reduction: Eliminates manual health check tasks

Deployment:
    fn deploy --app <app-name> --local
"""

import io
import json
import requests
from datetime import datetime
from fdk import response


def handler(ctx, data: io.BytesIO = None):
    """
    Handler function for OCI Function.
    
    Performs health check on BharatMart API endpoint.
    
    Args:
        ctx: Function context (contains configuration)
        data: Input data (if any)
    
    Returns:
        JSON response with health check results
    """
    try:
        # Get configuration from environment or context
        config = dict(ctx.Config())
        
        # Health check endpoint (configurable via environment variable)
        health_endpoint = config.get("HEALTH_ENDPOINT", "http://localhost:3000/api/health")
        timeout = int(config.get("HEALTH_TIMEOUT", "5"))
        
        # Perform health check
        start_time = datetime.utcnow()
        try:
            api_response = requests.get(health_endpoint, timeout=timeout)
            end_time = datetime.utcnow()
            response_time_ms = (end_time - start_time).total_seconds() * 1000
            
            is_healthy = api_response.status_code == 200
            health_data = api_response.json() if api_response.headers.get('content-type', '').startswith('application/json') else {}
            
        except requests.exceptions.Timeout:
            is_healthy = False
            response_time_ms = timeout * 1000
            health_data = {"error": "Request timeout"}
        except requests.exceptions.ConnectionError:
            is_healthy = False
            response_time_ms = 0
            health_data = {"error": "Connection error"}
        except Exception as e:
            is_healthy = False
            response_time_ms = 0
            health_data = {"error": str(e)}
        
        # Prepare result
        result = {
            "status": "healthy" if is_healthy else "unhealthy",
            "endpoint": health_endpoint,
            "status_code": api_response.status_code if 'api_response' in locals() else None,
            "response_time_ms": round(response_time_ms, 2),
            "timestamp": datetime.utcnow().isoformat(),
            "health_data": health_data
        }
        
        # Log result
        print(json.dumps(result))
        
        # Return appropriate status code
        status_code = 200 if is_healthy else 503
        
        return response.Response(
            ctx,
            response_data=json.dumps(result),
            headers={"Content-Type": "application/json"},
            status_code=status_code
        )
        
    except Exception as e:
        error_result = {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        print(json.dumps(error_result))
        
        return response.Response(
            ctx,
            response_data=json.dumps(error_result),
            headers={"Content-Type": "application/json"},
            status_code=500
        )

