############################################
# DATA SOURCES
############################################

# Availability Domains (correct data sources)
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_identity_availability_domain" "primary" {
  compartment_id = var.tenancy_ocid
  ad_number      = 1  # First AD (was "AD-1")
}

locals {
  common_tags = merge(var.tags, {
    "Name"        = "${var.project_name}-${var.environment}"
    "Environment" = var.environment
  })
}

############################################
# NETWORKING – VCN / IGW / NAT
############################################

resource "oci_core_vcn" "bharatmart_vcn" {
  compartment_id = var.compartment_id
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.project_name}-${var.environment}-vcn"
  dns_label      = "${var.project_name}${var.environment}"

  freeform_tags = local.common_tags
}

resource "oci_core_internet_gateway" "bharatmart_igw" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-igw"
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  enabled        = true

  freeform_tags = local.common_tags
}

resource "oci_core_nat_gateway" "bharatmart_nat" {
  count = var.enable_nat_gateway ? 1 : 0

  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-nat"
  vcn_id         = oci_core_vcn.bharatmart_vcn.id

  freeform_tags = local.common_tags
}

############################################
# ROUTE TABLES
############################################

resource "oci_core_route_table" "public_route_table" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.bharatmart_igw.id
  }

  freeform_tags = local.common_tags
}

resource "oci_core_route_table" "private_route_table" {
  count = var.enable_nat_gateway ? 1 : 0

  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.bharatmart_nat[0].id
  }

  freeform_tags = local.common_tags
}

############################################
# SECURITY LISTS
############################################

# Public Subnet SL
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

# Private Subnet SL (Backend)
resource "oci_core_security_list" "private_security_list" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-${var.environment}-private-sl"

  ingress_security_rules {
    protocol    = "6"
    source      = var.public_subnet_cidr
    description = "LB → Backend API"
    tcp_options {
      min = 3000
      max = 3000
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = var.vcn_cidr
    description = "SSH from VCN"
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

resource "oci_core_subnet" "private_subnet" {
  compartment_id             = var.compartment_id
  vcn_id                     = oci_core_vcn.bharatmart_vcn.id
  cidr_block                 = var.private_subnet_cidr
  route_table_id             = var.enable_nat_gateway ? oci_core_route_table.private_route_table[0].id : oci_core_vcn.bharatmart_vcn.default_route_table_id
  security_list_ids          = [oci_core_security_list.private_security_list.id]
  prohibit_public_ip_on_vnic = true
  display_name               = "${var.project_name}-${var.environment}-private-subnet"
  dns_label                  = "private"

  freeform_tags = local.common_tags
}

############################################
# FRONTEND VM (Public)
############################################

resource "oci_core_instance" "bharatmart_frontend" {
  count               = var.frontend_instance_count
  availability_domain = data.oci_identity_availability_domain.primary.name
  compartment_id      = var.compartment_id
  display_name        = "${var.project_name}-${var.environment}-frontend-${count.index + 1}"
  shape               = var.frontend_instance_shape

  shape_config {
    ocpus         = var.compute_instance_ocpus
    memory_in_gbs = var.compute_instance_memory_in_gb
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    hostname_label   = "frontend-${count.index + 1}"
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
    "Role" = "frontend"
  })
}

############################################
# BACKEND VMs (Private by default)
############################################

resource "oci_core_instance" "bharatmart_backend" {
  count               = var.compute_instance_count
  availability_domain = data.oci_identity_availability_domain.primary.name
  compartment_id      = var.compartment_id
  display_name        = "${var.project_name}-${var.environment}-backend-${count.index + 1}"
  shape               = var.compute_instance_shape

  shape_config {
    ocpus         = var.compute_instance_ocpus
    memory_in_gbs = var.compute_instance_memory_in_gb
  }

  create_vnic_details {
    subnet_id        = var.enable_backend_public_ip ? oci_core_subnet.public_subnet.id : oci_core_subnet.private_subnet.id
    assign_public_ip = var.enable_backend_public_ip
    hostname_label   = "backend-${count.index + 1}"
  }

  source_details {
    source_type = "image"
    source_id   = var.image_id
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(<<EOF
#!/bin/bash
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git
# Clone BharatMart repo
cd /home/opc
git clone https://github.com/atingupta2006/oci-multi-tier-web-app-ecommerce.git
cd oci-multi-tier-web-app-ecommerce

# Install dependencies
npm install


EOF
    )
  }

  freeform_tags = merge(local.common_tags, {
    "Role" = "backend"
  })
}

############################################
# LOAD BALANCER
############################################

resource "oci_load_balancer_load_balancer" "bharatmart_lb" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-lb"
  shape          = var.load_balancer_shape
  is_private     = false

  shape_details {
    minimum_bandwidth_in_mbps = var.load_balancer_shape_min_mbps
    maximum_bandwidth_in_mbps = var.load_balancer_shape_max_mbps
  }

  subnet_ids = [oci_core_subnet.public_subnet.id]

  freeform_tags = local.common_tags
}

############################################
# BACKEND SETS
############################################

resource "oci_load_balancer_backend_set" "frontend_set" {
  load_balancer_id = oci_load_balancer_load_balancer.bharatmart_lb.id
  name             = "frontend-backendset"
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol          = "HTTP"
    port              = 80
    url_path          = "/"
    retries           = 3
    timeout_in_millis = 3000
    interval_ms       = 10000
  }
}

resource "oci_load_balancer_backend_set" "backend_set" {
  load_balancer_id = oci_load_balancer_load_balancer.bharatmart_lb.id
  name             = "backend-api-backendset"
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol          = "HTTP"
    port              = 3000
    url_path          = "/api/health"
    retries           = 3
    timeout_in_millis = 3000
    interval_ms       = 10000
  }
}

############################################
# LB BACKENDS (Servers)
############################################

resource "oci_load_balancer_backend" "frontend_backend" {
  count = var.frontend_instance_count

  load_balancer_id = oci_load_balancer_load_balancer.bharatmart_lb.id
  backendset_name  = oci_load_balancer_backend_set.frontend_set.name
  ip_address       = oci_core_instance.bharatmart_frontend[count.index].private_ip
  port             = 80
}

resource "oci_load_balancer_backend" "backend_backend" {
  count = var.compute_instance_count

  load_balancer_id = oci_load_balancer_load_balancer.bharatmart_lb.id
  backendset_name  = oci_load_balancer_backend_set.backend_set.name
  ip_address       = oci_core_instance.bharatmart_backend[count.index].private_ip
  port             = 3000
}

############################################
# LB LISTENERS
############################################

resource "oci_load_balancer_listener" "frontend_listener" {
  load_balancer_id         = oci_load_balancer_load_balancer.bharatmart_lb.id
  name                     = "frontend-listener"
  default_backend_set_name = oci_load_balancer_backend_set.frontend_set.name
  port                     = 80
  protocol                 = "HTTP"
}

resource "oci_load_balancer_listener" "backend_listener" {
  load_balancer_id         = oci_load_balancer_load_balancer.bharatmart_lb.id
  name                     = "backend-listener"
  default_backend_set_name = oci_load_balancer_backend_set.backend_set.name
  port                     = 3000
  protocol                 = "HTTP"
}
