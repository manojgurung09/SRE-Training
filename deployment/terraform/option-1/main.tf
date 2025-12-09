# Configure the OCI Provider
provider "oci" {
  region = var.region
}

# Get Availability Domain
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

locals {
  ad_name = var.availability_domain
  common_tags = merge(var.tags, {
    "Name"        = "${var.project_name}-${var.environment}"
    "Environment" = var.environment
  })
}

############################################
# NETWORKING – VCN / IGW
############################################

# Create VCN
resource "oci_core_vcn" "bharatmart_vcn" {
  compartment_id = var.compartment_id
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.project_name}-${var.environment}-vcn"
  dns_label      = "${var.project_name}${var.environment}"

  freeform_tags = local.common_tags
}

# Create Internet Gateway for public subnet
resource "oci_core_internet_gateway" "bharatmart_igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-igw"
  enabled        = true

  freeform_tags = local.common_tags
}

############################################
# ROUTE TABLES
############################################

# Public Route Table (routes traffic to Internet Gateway)
resource "oci_core_route_table" "public_route_table" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-public-rt"

  route_rules {
    network_entity_id = oci_core_internet_gateway.bharatmart_igw.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }

  freeform_tags = local.common_tags
}

############################################
# SECURITY LISTS
############################################

# Public Security List (for single all-in-one VM)
resource "oci_core_security_list" "public_security_list" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-public-sl"

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow all Traffic to connect to port 3000"
    tcp_options {
      min = 3000
      max = 3000
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow HTTP"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow HTTPS"
    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Allow SSH (dev only)"
    tcp_options {
      min = 22
      max = 22
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  freeform_tags = local.common_tags
}

############################################
# SUBNETS
############################################

# Create Public Subnet (for all-in-one VM)
resource "oci_core_subnet" "public_subnet" {
  compartment_id             = var.compartment_id
  vcn_id                     = oci_core_vcn.bharatmart_vcn.id
  cidr_block                 = var.public_subnet_cidr
  route_table_id             = oci_core_route_table.public_route_table.id
  security_list_ids          = [oci_core_security_list.public_security_list.id]
  prohibit_public_ip_on_vnic = false
  display_name               = "${var.project_name}-${var.environment}-public-subnet"
  dns_label                  = "public"

  freeform_tags = local.common_tags
}

############################################
# COMPUTE INSTANCE - ALL-IN-ONE VM
############################################

# Create single all-in-one VM (frontend + backend)
resource "oci_core_instance" "bharatmart_all_in_one" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "${var.project_name}-${var.environment}-all-in-one"
  shape               = var.compute_instance_shape

  shape_config {
    ocpus         = var.compute_instance_ocpus
    memory_in_gbs = var.compute_instance_memory_in_gb
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    hostname_label   = "bharatmart"
  }

  source_details {
    source_type = "image"
    source_id   = var.image_id
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(<<EOF
#!/bin/bash
# Update system
yum update -y

# Install Node.js 20 and Git
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# Clone BharatMart repo
cd /home/opc
git clone https://github.com/atingupta2006/oci-multi-tier-web-app-ecommerce.git
cd oci-multi-tier-web-app-ecommerce

# Install dependencies
npm install

# OPTIONAL: build production frontend (you will manually configure env later)
# npm run build

EOF
    )
  }

  freeform_tags = merge(local.common_tags, {
    "Role" = "all-in-one"
    "Type" = "bharatmart-all-in-one"
  })
}
