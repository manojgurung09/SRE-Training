############################################################
# outputs.tf
# Detailed Outputs for BharatMart Multi-AD Deployment
############################################################

############################################################
# COMMON LOCALS
############################################################

# Protects against async LB IP availability issues
locals {
  lb_public_ips = flatten([
    for ip in oci_load_balancer_load_balancer.app_lb.ip_address_details : ip.ip_address
  ])
}


############################################################
# VCN & SUBNET OUTPUTS
############################################################

output "vcn_id" {
  description = "OCID of the BharatMart VCN"
  value       = oci_core_vcn.bharatmart_vcn.id
}

output "vcn_cidr" {
  description = "CIDR block of the VCN"
  value       = oci_core_vcn.bharatmart_vcn.cidr_blocks[0]
}

output "public_subnet_id" {
  description = "Subnet used by Frontend + Load Balancer"
  value       = oci_core_subnet.public_subnet.id
}

output "backend_subnet_ids" {
  description = "List of backend private subnets created (AD-safe)"
  value = [
    for sn in oci_core_subnet.backend_subnet : sn.id
  ]
}

output "backend_subnet_map" {
  description = "AD → backend subnet mapping for instance pool placement"
  value       = local.backend_subnet_map
}


############################################################
# INTERNET GATEWAY / NAT GATEWAY
############################################################

output "internet_gateway_id" {
  description = "OCID of the Internet Gateway"
  value       = oci_core_internet_gateway.igw.id
}

output "nat_gateway_id" {
  description = "OCID of the NAT Gateway"
  value       = oci_core_nat_gateway.nat.id
}


############################################################
# LOAD BALANCER OUTPUTS
############################################################

output "load_balancer_id" {
  description = "OCID of the Load Balancer"
  value       = oci_load_balancer_load_balancer.app_lb.id
}

output "load_balancer_public_ip" {
  description = "Public IP of the Load Balancer (first assigned IP)"
  value       = local.lb_public_ips[0]
}

output "load_balancer_urls" {
  description = "Convenience URLs for accessing BharatMart frontend and backend"
  value = {
    frontend_url = "http://${local.lb_public_ips[0]}"
    backend_api  = "http://${local.lb_public_ips[0]}:${var.backend_api_port}"
  }
}


############################################################
# FRONTEND INSTANCE OUTPUTS
############################################################

output "frontend_instance_ids" {
  description = "OCIDs of the frontend VM instances"
  value       = [for fe in oci_core_instance.frontend : fe.id]
}

output "frontend_public_ips" {
  description = "Public IP addresses of frontend instances"
  value       = [for fe in oci_core_instance.frontend : fe.public_ip]
}

output "frontend_private_ips" {
  description = "Private IP addresses of frontend instances"
  value       = [for fe in oci_core_instance.frontend : fe.private_ip]
}

output "frontend_urls" {
  description = "Direct URLs to each frontend instance (useful for debugging)"
  value = [
    for fe in oci_core_instance.frontend :
    "http://${fe.public_ip}"
  ]
}


############################################################
# BACKEND INSTANCE POOL OUTPUTS
############################################################

output "backend_instance_pool_id" {
  description = "OCID of the backend instance pool"
  value       = oci_core_instance_pool.backend_pool.id
}

output "backend_instance_pool_size" {
  description = "Current size of the backend instance pool"
  value       = oci_core_instance_pool.backend_pool.size
}

output "backend_instance_configuration_id" {
  description = "OCID of the instance configuration used for backend workers"
  value       = oci_core_instance_configuration.backend_config.id
}

output "backend_autoscaling_configuration_id" {
  description = "OCID of the autoscaling configuration attached to backend pool"
  value       = oci_autoscaling_auto_scaling_configuration.backend_autoscaling.id
}

# No direct backend instance IPs are shown because backend VMs are ephemeral and created by instance pool.
# To get instance IPs, use the OCI Console or OCI CLI:
#   oci compute-management instance-pool list-instances --instance-pool-id <pool-id>
# This output is commented out because instance pools don't expose instances as a direct attribute.
# output "backend_pool_instance_private_ips" {
#   description = "Private IPs of backend instances (dynamic; may change)"
#   value       = []  # Use OCI Console or CLI to get instance details
# }

############################################################
# BACKEND API ENDPOINTS
############################################################

output "backend_api_url" {
  description = "Public URL for backend API through the Load Balancer"
  value       = "http://${local.lb_public_ips[0]}:${var.backend_api_port}"
}

output "backend_health_check_url" {
  description = "Public health endpoint for backend API"
  value       = "http://${local.lb_public_ips[0]}:${var.backend_api_port}/api/health"
}


############################################################
# FULL SERVICE SUMMARY
############################################################

output "bharatmart_summary" {
  description = "High level summary of BharatMart service endpoints & resources"
  value = {
    load_balancer_ip   = local.lb_public_ips[0]
    frontend_url       = "http://${local.lb_public_ips[0]}"
    backend_api        = "http://${local.lb_public_ips[0]}:${var.backend_api_port}"
    health_check       = "http://${local.lb_public_ips[0]}:${var.backend_api_port}/api/health"
    frontend_instances = [for fe in oci_core_instance.frontend : fe.public_ip]
    backend_pool_id    = oci_core_instance_pool.backend_pool.id
  }
}

############################################################
# MONITORING & LOGGING OUTPUTS
############################################################

output "log_group_id" {
  description = "OCID of the central log group"
  value       = oci_logging_log_group.bharatmart_log_group.id
}

output "vcn_flow_log_public_subnet_id" {
  description = "OCID of the public subnet flow log"
  value       = oci_logging_log.vcn_flow_log_public.id
}

output "vcn_flow_log_backend_subnet_ids" {
  description = "OCIDs of the backend subnet flow logs"
  value = {
    for idx, log in oci_logging_log.vcn_flow_log_backend : "backend-subnet-${idx + 1}" => log.id
  }
}

output "load_balancer_access_log_id" {
  description = "OCID of the load balancer access log"
  value       = oci_logging_log.lb_access_log.id
}

output "load_balancer_error_log_id" {
  description = "OCID of the load balancer error log"
  value       = oci_logging_log.lb_error_log.id
}

output "frontend_nginx_access_log_id" {
  description = "OCID of the frontend NGINX access log"
  value       = oci_logging_log.frontend_nginx_access_log.id
}

output "frontend_nginx_error_log_id" {
  description = "OCID of the frontend NGINX error log"
  value       = oci_logging_log.frontend_nginx_error_log.id
}

output "backend_app_log_id" {
  description = "OCID of the backend application log (Node.js app logs - for Cloud Agent configuration)"
  value       = oci_logging_log.backend_app_log.id
}

output "notification_topic_id" {
  description = "OCID of the notification topic for alarms"
  value       = oci_ons_notification_topic.alarm_topic.id
}

output "monitoring_alarms" {
  description = "Map of monitoring alarm OCIDs"
  value = {
    frontend_high_cpu        = oci_monitoring_alarm.frontend_high_cpu.id
    frontend_high_memory     = oci_monitoring_alarm.frontend_high_memory.id
    backend_high_cpu         = oci_monitoring_alarm.backend_high_cpu.id
    backend_high_memory      = oci_monitoring_alarm.backend_high_memory.id
    compute_disk_utilization = oci_monitoring_alarm.compute_disk_utilization.id
    lb_backend_health        = oci_monitoring_alarm.lb_backend_health.id
    lb_high_request_rate     = oci_monitoring_alarm.lb_high_request_rate.id
    lb_high_response_time    = oci_monitoring_alarm.lb_high_response_time.id
    instance_pool_low_size   = oci_monitoring_alarm.instance_pool_low_size.id
    instance_pool_high_size  = oci_monitoring_alarm.instance_pool_high_size.id
    network_high_ingress      = oci_monitoring_alarm.network_high_ingress.id
    network_high_egress       = oci_monitoring_alarm.network_high_egress.id
  }
}

# IAM OUTPUTS
output "backend_instances_dynamic_group_id" {
  description = "OCID of the dynamic group for backend instances"
  value       = oci_identity_dynamic_group.backend_instances.id
}

output "backend_metrics_policy_id" {
  description = "OCID of the IAM policy allowing backend instances to write metrics"
  value       = oci_identity_policy.backend_metrics_policy.id
}