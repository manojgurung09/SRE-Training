# OCI Service Connector Hub Configuration for Automated Incident Response
#
# This Terraform configuration creates a Service Connector that routes
# monitoring alarms to an OCI Function for automated incident response.
#
# Prerequisites:
#   - OCI Function application and function already created
#   - Monitoring alarms configured
#   - Appropriate IAM policies
#
# Usage:
#   Add this to your Terraform configuration or use as standalone module

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.20.0"
    }
  }
}

# Variables
variable "compartment_id" {
  description = "OCID of the compartment"
  type        = string
}

variable "function_app_ocid" {
  description = "OCID of the OCI Function application"
  type        = string
}

variable "function_name" {
  description = "Name of the function to invoke"
  type        = string
  default     = "incident-response-handler"
}

variable "connector_name" {
  description = "Display name for the service connector"
  type        = string
  default     = "bharatmart-incident-response-connector"
}

variable "monitoring_namespace" {
  description = "Monitoring namespace for alarm events (e.g., oci_computeagent, custom.bharatmart)"
  type        = string
  default     = "oci_computeagent"
}

variable "description" {
  description = "Description for the service connector"
  type        = string
  default     = "Routes BharatMart monitoring alarms to incident response function"
}

# Service Connector
resource "oci_sch_service_connector" "incident_response_connector" {
  compartment_id = var.compartment_id
  display_name   = var.connector_name
  description    = var.description

  source {
    kind = "monitoring"

    monitoring_source_details {
      namespace = var.monitoring_namespace
      # Route all alarms in the compartment
      # You can filter by resource groups if needed
    }
  }

  target {
    kind = "functions"

    function_target_details {
      function_id = oci_functions_function.incident_response_function.id
    }
  }

  freeform_tags = {
    "Service"     = "BharatMart"
    "Purpose"     = "IncidentResponse"
    "Environment" = "production"
  }
}

# Data source to get function by name (if function already exists)
data "oci_functions_functions" "existing_function" {
  application_id = var.function_app_ocid
  display_name   = var.function_name
}

# Reference to existing function
resource "oci_functions_function" "incident_response_function" {
  application_id = var.function_app_ocid
  display_name   = var.function_name
  image          = data.oci_functions_functions.existing_function.functions[0].image
  memory_in_mbs  = 256
  timeout_in_seconds = 30
}

# Outputs
output "service_connector_id" {
  description = "OCID of the created service connector"
  value       = oci_sch_service_connector.incident_response_connector.id
}

output "service_connector_state" {
  description = "State of the service connector"
  value       = oci_sch_service_connector.incident_response_connector.state
}

