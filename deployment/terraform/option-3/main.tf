############################################################
# main.tf – Network + Frontend + Load Balancer (AD-safe)
############################################################

########################
# Availability Domains
########################

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

locals {
  ad_names = [for ad in data.oci_identity_availability_domains.ads.availability_domains : ad.name]
  ad_count = length(local.ad_names)

  backend_subnet_cidrs = [
    "10.0.2.0/24",
    "10.0.3.0/24",
    "10.0.4.0/24",
  ]

  max_backend_ads = local.ad_count > length(local.backend_subnet_cidrs) ? length(local.backend_subnet_cidrs) : local.ad_count

  is_frontend_flexible_shape = can(regex("Flex$", var.frontend_shape))
  is_backend_flexible_shape  = can(regex("Flex$", var.backend_shape))
}

########################
# VCN
########################

resource "oci_core_vcn" "bharatmart_vcn" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-vcn"
  dns_label      = "bmartvcn"
}

########################
# Gateways
########################

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  enabled        = true
  display_name   = "${var.project_name}-igw"
}

resource "oci_core_nat_gateway" "nat" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-nat"
}

########################
# Route Tables
########################

resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_route_table" "private_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.nat.id
  }
}

########################
# Security Lists
########################

resource "oci_core_security_list" "public_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-public-sl"

  # SSH
  ingress_security_rules {
    protocol    = "6"
    source      = var.ssh_ingress_cidr
    description = "SSH ingress"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP frontend
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "HTTP to frontend"
    tcp_options {
      min = var.frontend_port
      max = var.frontend_port
    }
  }

  # Backend API listener (public LB)
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    description = "Backend API LB listener"
    tcp_options {
      min = var.backend_api_port
      max = var.backend_api_port
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

resource "oci_core_security_list" "backend_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.bharatmart_vcn.id
  display_name   = "${var.project_name}-backend-sl"

  ingress_security_rules {
    protocol    = "6"
    source      = "10.0.0.0/16"
    description = "Backend service port"
    tcp_options {
      min = var.backend_api_port
      max = var.backend_api_port
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "10.0.0.0/16"
    description = "SSH within VCN"
    tcp_options {
      min = 22
      max = 22
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

########################
# Subnets
########################

resource "oci_core_subnet" "public_subnet" {
  cidr_block                 = "10.0.1.0/24"
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.bharatmart_vcn.id
  display_name               = "${var.project_name}-public-subnet"
  dns_label                  = "pub"
  route_table_id             = oci_core_route_table.public_rt.id
  security_list_ids          = [oci_core_security_list.public_sl.id]
  prohibit_public_ip_on_vnic = false
}

resource "oci_core_subnet" "backend_subnet" {
  count = local.max_backend_ads

  cidr_block                 = local.backend_subnet_cidrs[count.index]
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.bharatmart_vcn.id
  display_name               = "${var.project_name}-backend-subnet-${count.index + 1}"
  dns_label                  = "bk${count.index + 1}"
  route_table_id             = oci_core_route_table.private_rt.id
  security_list_ids          = [oci_core_security_list.backend_sl.id]
  availability_domain        = local.ad_names[count.index]
  prohibit_public_ip_on_vnic = true
}

locals {
  backend_subnet_map = {
    for idx in range(local.max_backend_ads) :
    local.ad_names[idx] => oci_core_subnet.backend_subnet[idx].id
  }
}

########################
# Load Balancer
########################

resource "oci_load_balancer_load_balancer" "app_lb" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-lb"

  shape = "flexible"
  shape_details {
    minimum_bandwidth_in_mbps = var.lb_min_bandwidth_mbps
    maximum_bandwidth_in_mbps = var.lb_max_bandwidth_mbps
  }

  subnet_ids = [oci_core_subnet.public_subnet.id]
  is_private = false
}

########################
# ENV FILE (generated from env.tpl + LB IP + vars)
########################

locals {
  app_env = templatefile("${path.module}/env.tpl", {
    lb_ip                     = oci_load_balancer_load_balancer.app_lb.ip_address_details[0].ip_address
    supabase_url              = var.supabase_url
    supabase_anon_key         = var.supabase_anon_key
    supabase_service_role_key = var.supabase_service_role_key
    jwt_secret                = var.jwt_secret
    admin_email               = var.admin_email
    admin_password            = var.admin_password
  })

  app_env_b64 = base64encode(local.app_env)
}

########################
# Frontend Image
########################

data "oci_core_images" "frontend_image" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Oracle Linux"
  operating_system_version = var.os_version
  shape                    = var.frontend_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

########################
# Frontend cloud-init
########################

locals {
  frontend_cloud_init = <<-EOF
    #cloud-config
    package_update: true
    packages:
      - git
      - nginx

    runcmd:
      # Wait for yum locks to clear and update system
      - |
        for i in {1..30}; do
          if ! pgrep -x yum > /dev/null && ! pgrep -x dnf > /dev/null; then
            break
          fi
          echo "Waiting for package manager lock (attempt $i/30)..."
          sleep 2
        done
      - yum update -y || true

      # Install Node.js with retry logic and handle GPG issues
      - |
        for i in {1..5}; do
          echo "Attempting Node.js installation (attempt $i/5)..."
          if curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -; then
            if yum install -y nodejs --nogpgcheck || yum install -y nodejs; then
              echo "Node.js installed successfully"
              break
            fi
          fi
          if [ $i -eq 5 ]; then
            echo "Failed to install Node.js after 5 attempts"
            exit 1
          fi
          sleep 5
        done

      # Verify Node.js installation
      - |
        if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
          echo "Node.js or npm not found after installation"
          exit 1
        fi
        echo "Node.js version: $(node --version)"
        echo "npm version: $(npm --version)"

      # Disable firewalls
      - systemctl stop firewalld || true
      - systemctl disable firewalld || true
      - systemctl stop nftables || true
      - systemctl disable nftables || true

      # Create directory and clone repo
      - mkdir -p /opt/bharatmart
      - chown -R opc:opc /opt/bharatmart
      - |
        if [ ! -d /opt/bharatmart/.git ]; then
          git clone --branch main --depth 1 ${var.github_repo_url} /opt/bharatmart || {
            echo "Failed to clone repository"
            exit 1
          }
        fi

      # Set correct ownership
      - chown -R opc:opc /opt/bharatmart

      # Create .env file
      - bash -c 'echo "${local.app_env_b64}" | base64 -d > /opt/bharatmart/.env'
      - chown opc:opc /opt/bharatmart/.env

      # Install dependencies and build (as opc user to avoid permission issues)
      - |
        cd /opt/bharatmart
        su - opc -c "cd /opt/bharatmart && npm install" || {
          echo "npm install failed"
          exit 1
        }

      # Build frontend only (not server code)
      - |
        cd /opt/bharatmart
        su - opc -c "cd /opt/bharatmart && npm run build:client" || {
          echo "Frontend build failed"
          exit 1
        }

      # Verify dist directory exists
      - |
        if [ ! -d /opt/bharatmart/dist ] || [ -z "$(ls -A /opt/bharatmart/dist)" ]; then
          echo "dist directory is empty or missing"
          exit 1
        fi

      # Copy files to nginx directory
      - rm -rf /usr/share/nginx/html/*
      - cp -r /opt/bharatmart/dist/* /usr/share/nginx/html/
      - chown -R nginx:nginx /usr/share/nginx/html/
      - chmod -R 755 /usr/share/nginx/html/

      # Configure nginx
      - |
        cat > /etc/nginx/conf.d/bharatmart.conf << 'NGINXCONF'
        server {
          listen 80 default_server;
          listen [::]:80 default_server;

          root /usr/share/nginx/html;
          index index.html;

          server_name _;

          location / {
            try_files $uri $uri/ /index.html;
          }
        }
        NGINXCONF

      # Remove default nginx config
      - rm -f /etc/nginx/conf.d/default.conf || true

      # Enable IP forwarding
      - |
        sysctl -w net.ipv4.ip_forward=1
        echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
        sysctl -p

      # Test nginx configuration
      - |
        nginx -t || {
          echo "Nginx configuration test failed"
          exit 1
        }

      # Enable and start nginx
      - systemctl enable nginx
      - systemctl restart nginx

      # Verify nginx is running
      - |
        if ! systemctl is-active --quiet nginx; then
          echo "Nginx failed to start"
          systemctl status nginx
          exit 1
        fi
        echo "Frontend deployment completed successfully"
  EOF
}

########################
# Frontend Instances
########################

resource "oci_core_instance" "frontend" {
  count = var.frontend_instance_count

  availability_domain = local.ad_names[count.index % local.ad_count]
  compartment_id      = var.compartment_ocid
  display_name        = "${var.project_name}-fe-${count.index + 1}"
  shape               = var.frontend_shape

  dynamic "shape_config" {
    for_each = local.is_frontend_flexible_shape ? [1] : []
    content {
      ocpus         = var.frontend_flex_ocpus
      memory_in_gbs = var.frontend_flex_memory_gbs
    }
  }

  source_details {
    source_type = "image"
    source_id   = var.use_custom_images && var.frontend_custom_image_id != null ? var.frontend_custom_image_id : data.oci_core_images.frontend_image.images[0].id
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(local.frontend_cloud_init)
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    hostname_label   = "fe-${count.index + 1}"
  }
}

########################
# Backend Sets & Listeners
########################

resource "oci_load_balancer_backendset" "frontend_bs" {
  name             = "frontend-backendset"
  load_balancer_id = oci_load_balancer_load_balancer.app_lb.id
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol = "HTTP"
    url_path = "/"
    port     = var.frontend_port
  }
}

resource "oci_load_balancer_backendset" "backend_api_bs" {
  name             = "backend-api-backendset"
  load_balancer_id = oci_load_balancer_load_balancer.app_lb.id
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol = "HTTP"
    url_path = "/api/health"
    port     = var.backend_api_port
  }
}

resource "oci_load_balancer_listener" "frontend_listener" {
  load_balancer_id         = oci_load_balancer_load_balancer.app_lb.id
  name                     = "listener-frontend"
  default_backend_set_name = oci_load_balancer_backendset.frontend_bs.name
  port                     = var.frontend_port
  protocol                 = "HTTP"
}

resource "oci_load_balancer_listener" "backend_listener" {
  load_balancer_id         = oci_load_balancer_load_balancer.app_lb.id
  name                     = "listener-backend-api"
  default_backend_set_name = oci_load_balancer_backendset.backend_api_bs.name
  port                     = var.backend_api_port
  protocol                 = "HTTP"
}

########################
# Frontend → LB Backend registration
########################

resource "oci_load_balancer_backend" "frontend_backends" {
  count = var.frontend_instance_count

  load_balancer_id = oci_load_balancer_load_balancer.app_lb.id
  backendset_name  = oci_load_balancer_backendset.frontend_bs.name

  ip_address = oci_core_instance.frontend[count.index].private_ip
  port       = var.frontend_port
  weight     = 1
  backup     = false
  drain      = false
  offline    = false
}
