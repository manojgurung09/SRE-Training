############################################################
# monitoring-logging.tf – OCI Observability & SRE Setup
############################################################

########################
# IAM for Custom Metrics (REQUIRED)
########################

# Data source to get compartment name (required for IAM policy statements)
data "oci_identity_compartment" "backend_compartment" {
  id = var.compartment_ocid
}

# Dynamic Group for Backend Instances
# Note: IAM resources must be created in home region (BOM)
resource "oci_identity_dynamic_group" "backend_instances" {
  provider       = oci.home_region
  name           = "${var.project_name}-backend-instances"
  compartment_id = var.tenancy_ocid
  description    = "Dynamic group for backend instances to write custom metrics"
  matching_rule  = "ALL {instance.compartment.id = '${var.compartment_ocid}'}"
}

# IAM Policy - Allow instances to write metrics
# Note: IAM resources must be created in home region (BOM)
resource "oci_identity_policy" "backend_metrics_policy" {
  provider       = oci.home_region
  compartment_id = var.tenancy_ocid
  name           = "${var.project_name}-backend-metrics-policy"
  description    = "Allow backend instances to write custom metrics"
  statements = [
    "ALLOW dynamic-group ${oci_identity_dynamic_group.backend_instances.name} TO manage metrics IN compartment ${data.oci_identity_compartment.backend_compartment.name}"
  ]
}

########################
# Log Groups
########################

resource "oci_logging_log_group" "bharatmart_log_group" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-log-group"
  description    = "Central log group for BharatMart application logs"
}

########################
# VCN Flow Logs (Subnet Level)
########################

# Note: Flow logs must be configured at subnet level, not VCN level
# Valid category values: "subnet", "vnic", "instance", "networkloadbalancer"
# Category "all" is not valid for VCN resources

# Flow Log - Public Subnet
resource "oci_logging_log" "vcn_flow_log_public" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-flow-log-public-subnet"
  log_type     = "SERVICE"
  is_enabled   = true

  configuration {
    source {
      source_type = "OCISERVICE"
      service     = "flowlogs"
      resource    = oci_core_subnet.public_subnet.id
      category    = "subnet"
    }
  }
}

# Flow Logs - Backend Subnets
resource "oci_logging_log" "vcn_flow_log_backend" {
  count        = local.max_backend_ads
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-flow-log-backend-subnet-${count.index + 1}"
  log_type     = "SERVICE"
  is_enabled   = true

  configuration {
    source {
      source_type = "OCISERVICE"
      service     = "flowlogs"
      resource    = oci_core_subnet.backend_subnet[count.index].id
      category    = "subnet"
    }
  }
}

########################
# Load Balancer Logs
########################

# Load Balancer Access Log
resource "oci_logging_log" "lb_access_log" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-lb-access-log"
  log_type     = "SERVICE"
  is_enabled   = true

  configuration {
    source {
      source_type = "OCISERVICE"
      service     = "loadbalancer"
      resource    = oci_load_balancer_load_balancer.app_lb.id
      category    = "access"
    }
  }
}

# Load Balancer Error Log
resource "oci_logging_log" "lb_error_log" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-lb-error-log"
  log_type     = "SERVICE"
  is_enabled   = true

  configuration {
    source {
      source_type = "OCISERVICE"
      service     = "loadbalancer"
      resource    = oci_load_balancer_load_balancer.app_lb.id
      category    = "error"
    }
  }
}

########################
# Custom Logs for Application Logs
########################

# Frontend NGINX Access Log
resource "oci_logging_log" "frontend_nginx_access_log" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-frontend-nginx-access-log"
  log_type     = "CUSTOM"
  is_enabled   = true
}

# Frontend NGINX Error Log
resource "oci_logging_log" "frontend_nginx_error_log" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-frontend-nginx-error-log"
  log_type     = "CUSTOM"
  is_enabled   = true
}

# Backend Application Log (Node.js app logs)
resource "oci_logging_log" "backend_app_log" {
  log_group_id = oci_logging_log_group.bharatmart_log_group.id
  display_name = "${var.project_name}-backend-app-log"
  log_type     = "CUSTOM"
  is_enabled   = true
}

########################
# Notification Topics for Alarms
########################

resource "oci_ons_notification_topic" "alarm_topic" {
  compartment_id = var.compartment_ocid
  name           = "${var.project_name}-alarm-topic"
  description    = "Notification topic for BharatMart monitoring alarms"
}

########################
# Monitoring Alarms - Compute Instances
########################

# High CPU Alarm for Frontend Instances
resource "oci_monitoring_alarm" "frontend_high_cpu" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-frontend-high-cpu"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "CpuUtilization[1m].mean() > 80"
  severity              = "CRITICAL"
  body                  = "Frontend instance CPU utilization is above 80%"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# High Memory Alarm for Frontend Instances
resource "oci_monitoring_alarm" "frontend_high_memory" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-frontend-high-memory"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "MemoryUtilization[1m].mean() > 85"
  severity              = "WARNING"
  body                  = "Frontend instance memory utilization is above 85%"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# High CPU Alarm for Backend Instances (Instance Pool)
resource "oci_monitoring_alarm" "backend_high_cpu" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-backend-high-cpu"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "CpuUtilization[1m].mean() > 80"
  severity              = "CRITICAL"
  body                  = "Backend instance pool CPU utilization is above 80%"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# High Memory Alarm for Backend Instances
resource "oci_monitoring_alarm" "backend_high_memory" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-backend-high-memory"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "MemoryUtilization[1m].mean() > 85"
  severity              = "WARNING"
  body                  = "Backend instance pool memory utilization is above 85%"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# Disk Utilization Alarm
resource "oci_monitoring_alarm" "compute_disk_utilization" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-compute-disk-utilization"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "DiskUtilization[1m].mean() > 90"
  severity              = "CRITICAL"
  body                  = "Compute instance disk utilization is above 90%"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

########################
# Monitoring Alarms - Load Balancer
########################

# Load Balancer Backend Server Health Alarm
resource "oci_monitoring_alarm" "lb_backend_health" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-lb-backend-health"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_lbaas"
  query                 = "HealthyBackendServers[1m].mean() < 1"
  severity              = "CRITICAL"
  body                  = "Load balancer has no healthy backend servers"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT2M"
  repeat_notification_duration = "PT1H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# Load Balancer Request Rate Alarm
resource "oci_monitoring_alarm" "lb_high_request_rate" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-lb-high-request-rate"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_lbaas"
  query                 = "RequestRate[1m].mean() > 1000"
  severity              = "WARNING"
  body                  = "Load balancer request rate is above 1000 requests/second"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT2H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# Load Balancer Response Time Alarm
resource "oci_monitoring_alarm" "lb_high_response_time" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-lb-high-response-time"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_lbaas"
  query                 = "ResponseTime[1m].mean() > 2000"
  severity              = "WARNING"
  body                  = "Load balancer response time is above 2000ms"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT2H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

########################
# Monitoring Alarms - Instance Pool
########################

# Instance Pool Size Alarm (too few instances)
resource "oci_monitoring_alarm" "instance_pool_low_size" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-instance-pool-low-size"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_compute_management"
  query                 = "InstancePoolSize[1m].mean() < ${var.backend_pool_min_size}"
  severity              = "WARNING"
  body                  = "Instance pool size is below minimum threshold"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT2H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# Instance Pool Size Alarm (too many instances)
resource "oci_monitoring_alarm" "instance_pool_high_size" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-instance-pool-high-size"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_compute_management"
  query                 = "InstancePoolSize[1m].mean() > ${var.backend_pool_max_size * 0.9}"
  severity              = "INFO"
  body                  = "Instance pool size is approaching maximum capacity"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

########################
# Monitoring Alarms - Network
########################

# Network Ingress Bytes Alarm
resource "oci_monitoring_alarm" "network_high_ingress" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-network-high-ingress"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "NetworkBytesIn[1m].mean() > 1000000000"
  severity              = "INFO"
  body                  = "High network ingress traffic detected"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

# Network Egress Bytes Alarm
resource "oci_monitoring_alarm" "network_high_egress" {
  compartment_id        = var.compartment_ocid
  display_name          = "${var.project_name}-network-high-egress"
  is_enabled            = true
  metric_compartment_id = var.compartment_ocid
  namespace             = "oci_computeagent"
  query                 = "NetworkBytesOut[1m].mean() > 1000000000"
  severity              = "INFO"
  body                  = "High network egress traffic detected"
  message_format        = "ONS_OPTIMIZED"
  pending_duration      = "PT5M"
  repeat_notification_duration = "PT4H"

  destinations = [oci_ons_notification_topic.alarm_topic.id]
}

