############################################
# REQUIRED VARIABLES
############################################

variable "compartment_id" {
  description = "OCID of the compartment where resources will be created"
  type        = string
}

variable "tenancy_ocid" {
  description = "Tenancy OCID used for fetching availability domains"
  type        = string
}

variable "image_id" {
  description = "OCI Image OCID for compute instances"
  type        = string
}

variable "ssh_public_key" {
  description = "Public SSH key for VM access"
  type        = string
}

############################################
# GENERAL SETTINGS
############################################

variable "region" {
  description = "OCI region (e.g., ap-mumbai-1)"
  type        = string
}

variable "project_name" {
  description = "Project name used for tagging and resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/stage/prod)"
  type        = string
}

############################################
# NETWORK CONFIGURATION
############################################

variable "vcn_cidr" {
  description = "CIDR block for the VCN"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR block of the public subnet"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR block of the private subnet"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Boolean to enable or disable NAT Gateway"
  type        = bool
  default     = true
}

variable "enable_backend_public_ip" {
  description = "Assign public IP to backend VM"
  type        = bool
  default     = false
}

############################################
# FRONTEND VM CONFIGURATION
############################################

variable "frontend_instance_count" {
  description = "Number of frontend instances"
  type        = number
  default     = 1
}

variable "frontend_instance_shape" {
  description = "Shape for frontend compute instance (must be Flex for OCPU/RAM override)"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

############################################
# BACKEND VM CONFIGURATION
############################################

variable "compute_instance_count" {
  description = "Number of backend instances"
  type        = number
  default     = 1
}

variable "compute_instance_shape" {
  description = "Shape for backend compute instance"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "compute_instance_ocpus" {
  description = "Number of OCPUs for Flex shapes"
  type        = number
  default     = 2
}

variable "compute_instance_memory_in_gb" {
  description = "Memory (in GB) for Flex shapes"
  type        = number
  default     = 12
}

############################################
# LOAD BALANCER SETTINGS
############################################

variable "load_balancer_shape" {
  description = "Load Balancer shape (fixed or flexible)"
  type        = string
  default     = "flexible"
}

variable "load_balancer_shape_min_mbps" {
  description = "Minimum bandwidth for flexible LB"
  type        = number
  default     = 10
}

variable "load_balancer_shape_max_mbps" {
  description = "Maximum bandwidth for flexible LB"
  type        = number
  default     = 10
}

############################################
# TAGS
############################################

variable "tags" {
  description = "Common freeform tags applied to all resources"
  type        = map(string)
  default     = {}
}
