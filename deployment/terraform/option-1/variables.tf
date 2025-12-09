variable "compartment_id" {
  description = "OCI Compartment OCID where resources will be created"
  type        = string
}

variable "region" {
  description = "OCI region for deployment"
  type        = string
  default     = "ap-mumbai-1"
}

variable "availability_domain" {
  description = "Availability Domain name (e.g., AD-1, AD-2, AD-3)"
  type        = string
  default     = "AD-1"
}

variable "project_name" {
  description = "Project name used for resource naming (e.g., bharatmart, training)"
  type        = string
  default     = "bharatmart"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vcn_cidr" {
  description = "CIDR block for VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet (for all-in-one VM)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "compute_instance_shape" {
  description = "Shape for Compute instance"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "compute_instance_ocpus" {
  description = "Number of OCPUs for the Compute instance"
  type        = number
  default     = 2
}

variable "compute_instance_memory_in_gb" {
  description = "Memory in GB for the Compute instance"
  type        = number
  default     = 12
}

variable "ssh_public_key" {
  description = "SSH public key for Compute instance (content, not file path)"
  type        = string
}

variable "image_id" {
  description = "OCI image OCID for Compute instance (Oracle Linux or Ubuntu)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    "Project"     = "BharatMart"
    "ManagedBy"   = "Terraform"
    "Environment" = "dev"
  }
}
