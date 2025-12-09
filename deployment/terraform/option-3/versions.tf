############################################################
# versions.tf – Terraform & Provider config
############################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 6.12.0"
    }
  }
}

provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  user_ocid    = var.user_ocid
  fingerprint  = var.fingerprint
  region       = var.region

  # Local CLI usage
  private_key_path = var.private_key_path != "" ? var.private_key_path : null

  # OCI Resource Manager usage
  private_key = var.private_key != "" ? var.private_key : null

  private_key_password = var.private_key_password
}
