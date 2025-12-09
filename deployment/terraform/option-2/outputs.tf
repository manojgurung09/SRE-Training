############################################
# Common Locals for Outputs
############################################

# This protects against async LB IP availability issues.
locals {
  lb_public_ips = flatten([
    for ip in oci_load_balancer_load_balancer.bharatmart_lb.ip_address_details : ip.ip_address
  ])
}

############################################
# VCN & Subnet Outputs
############################################

output "vcn_id" {
  description = "OCID of the created VCN"
  value       = oci_core_vcn.bharatmart_vcn.id
}

output "vcn_cidr" {
  description = "CIDR block of the VCN"
  value       = oci_core_vcn.bharatmart_vcn.cidr_blocks[0]
}

output "public_subnet_id" {
  description = "OCID of the public subnet"
  value       = oci_core_subnet.public_subnet.id
}

output "private_subnet_id" {
  description = "OCID of the private subnet"
  value       = oci_core_subnet.private_subnet.id
}

############################################
# Internet Gateway / NAT Gateway Outputs
############################################

output "internet_gateway_id" {
  description = "OCID of the Internet Gateway"
  value       = oci_core_internet_gateway.bharatmart_igw.id
}

output "nat_gateway_id" {
  description = "OCID of the NAT Gateway (if enabled)"
  value       = var.enable_nat_gateway ? oci_core_nat_gateway.bharatmart_nat[0].id : null
}

############################################
# Load Balancer Outputs
############################################

output "load_balancer_id" {
  description = "OCID of the Load Balancer"
  value       = oci_load_balancer_load_balancer.bharatmart_lb.id
}

output "load_balancer_public_ip" {
  description = "Public IP(s) assigned to Load Balancer"
  value       = local.lb_public_ips[0]
}

output "load_balancer_url" {
  description = "URL to access the frontend application"
  value       = "http://${local.lb_public_ips[0]}"
}

############################################
# Frontend VM Outputs
############################################

output "frontend_instance_ids" {
  description = "OCIDs of the frontend VM instances"
  value       = oci_core_instance.bharatmart_frontend[*].id
}

output "frontend_public_ips" {
  description = "Public IPs of the frontend VM instances"
  value       = oci_core_instance.bharatmart_frontend[*].public_ip
}

output "frontend_private_ips" {
  description = "Private IPs of the frontend VM instances"
  value       = oci_core_instance.bharatmart_frontend[*].private_ip
}

############################################
# Backend VM Outputs
############################################

output "backend_instance_ids" {
  description = "OCIDs of backend compute instances"
  value       = oci_core_instance.bharatmart_backend[*].id
}

output "backend_private_ips" {
  description = "Private IPs of backend compute instances"
  value       = oci_core_instance.bharatmart_backend[*].private_ip
}

output "backend_public_ips" {
  description = "Public IPs for backend instances (if enabled)"
  value       = var.enable_backend_public_ip ? oci_core_instance.bharatmart_backend[*].public_ip : []
}

############################################
# Convenience URLs
############################################

output "frontend_url" {
  description = "URL to access the frontend service"
  value       = "http://${local.lb_public_ips[0]}"
}

output "backend_api_url" {
  description = "Base URL for backend API via Load Balancer"
  value       = "http://${local.lb_public_ips[0]}:3000/api"
}
