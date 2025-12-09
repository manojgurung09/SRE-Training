"""
OCI Function: Automated Incident Response Handler

This function receives alarm events from Service Connector Hub and performs
automated incident response actions.

Use Case: Automated incident response when alarms fire
Integration: OCI Service Connector Hub routes monitoring alarms to this function

Deployment:
    fn deploy --app <app-name> --local
"""

import io
import json
import oci
import logging
from datetime import datetime
from fdk import response

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def handler(ctx, data: io.BytesIO = None):
    """
    Incident response handler for BharatMart alarms.
    
    Processes alarm events from Service Connector Hub and performs
    automated response actions.
    
    Args:
        ctx: Function context (contains configuration)
        data: Alarm event data from Service Connector Hub
    
    Returns:
        JSON response with incident processing results
    """
    try:
        # Parse incoming alarm event
        if data:
            event_str = data.read().decode('utf-8')
            try:
                event_data = json.loads(event_str)
            except json.JSONDecodeError:
                # Handle non-JSON format (OCI events may be wrapped)
                event_data = {"raw_event": event_str, "message": event_str}
            logger.info(f"Received alarm event: {json.dumps(event_data, indent=2)}")
        else:
            # Test event structure
            event_data = {
                "alarmId": "test-alarm-id",
                "message": "Test alarm event",
                "severity": "CRITICAL",
                "timestamp": datetime.utcnow().isoformat()
            }

        # Extract alarm information
        alarm_id = event_data.get("alarmId") or event_data.get("alarm_id") or "unknown"
        message = event_data.get("message") or event_data.get("summary") or "No message"
        severity = event_data.get("severity") or event_data.get("severityLevel") or "UNKNOWN"
        timestamp = event_data.get("timestamp") or datetime.utcnow().isoformat()
        alarm_name = event_data.get("alarmName") or event_data.get("resourceDisplayName") or "Unknown Alarm"

        # Log incident details
        incident_log = {
            "incident_id": alarm_id,
            "timestamp": timestamp,
            "severity": severity,
            "message": message,
            "alarm_name": alarm_name,
            "service": "BharatMart",
            "status": "acknowledged",
            "actions_taken": []
        }

        logger.info(f"Incident logged: {json.dumps(incident_log, indent=2)}")

        # Get configuration from context
        config = dict(ctx.Config())
        topic_ocid = config.get("TOPIC_OCID", "")
        
        # Send notification (optional - requires ONS topic)
        if topic_ocid:
            try:
                # Initialize OCI client using default config
                notification_client = oci.ons.NotificationDataPlaneClient({})
                
                notification_client.publish_message(
                    topic_id=topic_ocid,
                    message_details=oci.ons.models.MessageDetails(
                        title=f"BharatMart Incident: {severity}",
                        body=f"""Alarm: {alarm_name}
Message: {message}
Time: {timestamp}
Alarm ID: {alarm_id}"""
                    )
                )
                logger.info(f"Notification sent to topic: {topic_ocid}")
                incident_log["actions_taken"].append("notification_sent")
            except Exception as e:
                logger.warning(f"Could not send notification: {e}")
                incident_log["actions_taken"].append(f"notification_failed: {str(e)}")
        else:
            logger.info("No notification topic configured, skipping notification")
            incident_log["actions_taken"].append("notification_skipped")

        # Additional response actions based on severity
        if severity in ["CRITICAL", "ERROR"]:
            incident_log["actions_taken"].append("incident_escalated")
            logger.info(f"Critical incident detected - escalation recommended")

        # Return response
        result = {
            "status": "success",
            "incident_id": alarm_id,
            "timestamp": datetime.utcnow().isoformat(),
            "actions_taken": incident_log["actions_taken"],
            "message": f"Incident {alarm_id} processed successfully"
        }

        return response.Response(
            ctx,
            response_data=json.dumps(result),
            headers={"Content-Type": "application/json"},
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error processing incident: {e}", exc_info=True)
        error_result = {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return response.Response(
            ctx,
            response_data=json.dumps(error_result),
            headers={"Content-Type": "application/json"},
            status_code=500
        )

