############################################################
# instance-pool-autoscaling.tf – Backend Pool + Autoscaling
############################################################

########################
# Backend Image
########################

data "oci_core_images" "backend_image" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Oracle Linux"
  operating_system_version = var.os_version
  shape                    = var.backend_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

########################
# Backend cloud-init (Node 20 + build + systemd)
########################

locals {
  # Cloud Agent logging configuration for backend
  backend_cloud_agent_config = jsonencode({
    logSources = [
      {
        logId   = oci_logging_log.backend_app_log.id
        logPath = "/opt/bharatmart/logs/api.log"
        logType = "custom"
        parser  = "json"
        labels = {
          service     = "bharatmart-backend"
          environment = "production"
        }
      }
    ]
  })
  backend_cloud_agent_config_b64 = base64encode(local.backend_cloud_agent_config)

  # Cloud Agent monitoring configuration for backend (Prometheus metrics)
  # Using prometheus_config format (NEW/CORRECT format)
  backend_cloud_agent_monitoring_config = jsonencode({
    prometheus_config = {
      scrape_configs = [
        {
          job_name     = "backend_metrics"
          metrics_path = "/metrics"
          scheme       = "http"
          static_configs = [
            {
              targets = ["localhost:3000"]
            }
          ]
        }
      ]
    }
  })
  backend_cloud_agent_monitoring_config_b64 = base64encode(local.backend_cloud_agent_monitoring_config)

  backend_cloud_init = <<-EOF
    #cloud-config
    package_update: true
    packages:
      - git

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

      # Enable IP forwarding
      - |
        sysctl -w net.ipv4.ip_forward=1
        echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
        sysctl -p

      # Create directory and clone repo
      - mkdir -p /opt/bharatmart
      - |
        if [ ! -d /opt/bharatmart/.git ]; then
          git clone --branch main --depth 1 ${var.github_repo_url} /opt/bharatmart || {
            echo "Failed to clone repository"
            exit 1
          }
        fi

      # Create .env file
      - bash -c 'echo "${local.app_env_b64}" | base64 -d > /opt/bharatmart/.env'

      # Install dependencies (including dev dependencies for TypeScript)
      - |
        cd /opt/bharatmart
        npm install || {
          echo "npm install failed"
          exit 1
        }

      # Build server code
      - |
        cd /opt/bharatmart
        npm run build:server || {
          echo "Server build failed"
          exit 1
        }

      # Verify dist/server directory exists
      - |
        if [ ! -f /opt/bharatmart/dist/server/index.js ]; then
          echo "Server build output not found at dist/server/index.js"
          exit 1
        fi
        echo "Server build completed successfully"

      # Create package.json in dist/server to enable CommonJS
      - |
        cat > /opt/bharatmart/dist/server/package.json << 'PKGEOF'
        {
          "type": "commonjs"
        }
        PKGEOF
        echo "Created package.json in dist/server to enable CommonJS"

      # Create systemd service
      - |
        cat > /etc/systemd/system/bharatmart-backend.service << 'SYSEOF'
        [Unit]
        Description=BharatMart Backend API
        After=network.target

        [Service]
        Type=simple
        WorkingDirectory=/opt/bharatmart
        EnvironmentFile=/opt/bharatmart/.env
        ExecStart=/usr/bin/node dist/server/index.js
        Restart=always
        RestartSec=5
        LimitNOFILE=65536
        User=opc
        Group=opc

        [Install]
        WantedBy=multi-user.target
        SYSEOF

      # Set correct permissions
      - chown -R opc:opc /opt/bharatmart

      # Reload systemd and enable service
      - systemctl daemon-reload
      - systemctl enable bharatmart-backend

      # Start service and verify it's running
      - |
        systemctl restart bharatmart-backend
        sleep 3
        if ! systemctl is-active --quiet bharatmart-backend; then
          echo "Backend service failed to start"
          systemctl status bharatmart-backend
          journalctl -u bharatmart-backend -n 50 --no-pager
          exit 1
        fi

      # Verify service is listening on port 3000
      - |
        for i in {1..30}; do
          if netstat -tlnp | grep -q ":3000 "; then
            echo "Backend service is listening on port 3000"
            break
          fi
          if [ $i -eq 30 ]; then
            echo "WARNING: Backend service may not be listening on port 3000"
          fi
          sleep 1
        done

      # Health check
      - |
        for i in {1..10}; do
          if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "Backend health check passed"
            break
          fi
          if [ $i -eq 10 ]; then
            echo "WARNING: Backend health check failed after 10 attempts"
          fi
          sleep 2
        done

      - echo "Backend deployment completed successfully"

      # Configure OCI Cloud Agent for log ingestion
      - |
        mkdir -p /opt/oracle-cloud-agent/plugins/logging
        echo "${local.backend_cloud_agent_config_b64}" | base64 -d > /opt/oracle-cloud-agent/plugins/logging/config.json

      # Configure OCI Cloud Agent for Prometheus metrics collection
      - |
        mkdir -p /opt/oracle-cloud-agent/plugins/monitoring
        echo "${local.backend_cloud_agent_monitoring_config_b64}" | base64 -d > /opt/oracle-cloud-agent/plugins/monitoring/config.json

      - systemctl restart unified-monitoring-agent || true
      - systemctl enable unified-monitoring-agent || true
  EOF
}

########################
# Instance Configuration
########################

resource "oci_core_instance_configuration" "backend_config" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-backend-instance-config"

  instance_details {
    instance_type = "compute"

    launch_details {
      compartment_id = var.compartment_ocid
      shape          = var.backend_shape

      # Enable Cloud Agent with Monitoring Plugin
      # Note: Prometheus config is set via cloud-init script (see backend_cloud_init)
      # Temporarily commented out - will enable via cloud-init only to avoid provisioning issues
      # agent_config {
      #   is_management_disabled = false
      #   is_monitoring_disabled  = false
      # 
      #   plugins_config {
      #     name          = "Monitoring"
      #     desired_state = "ENABLED"
      #   }
      # }

      dynamic "shape_config" {
        for_each = local.is_backend_flexible_shape ? [1] : []
        content {
          ocpus         = var.backend_flex_ocpus
          memory_in_gbs = var.backend_flex_memory_gbs
        }
      }

      source_details {
        source_type = "image"
        image_id    = var.use_custom_images && var.backend_custom_image_id != null ? var.backend_custom_image_id : data.oci_core_images.backend_image.images[0].id
      }

      metadata = {
        ssh_authorized_keys = var.ssh_public_key
        user_data           = base64encode(local.backend_cloud_init)
      }

      create_vnic_details {
        assign_public_ip = false
        subnet_id        = local.backend_subnet_map[local.ad_names[0]]
      }
    }
  }
}

########################
# Instance Pool
########################

resource "oci_core_instance_pool" "backend_pool" {
  compartment_id            = var.compartment_ocid
  display_name              = "${var.project_name}-backend-pool"
  instance_configuration_id = oci_core_instance_configuration.backend_config.id
  size                      = var.backend_pool_initial_size

  dynamic "placement_configurations" {
    for_each = local.backend_subnet_map
    content {
      availability_domain = placement_configurations.key
      primary_subnet_id   = placement_configurations.value
    }
  }

  load_balancers {
    load_balancer_id = oci_load_balancer_load_balancer.app_lb.id
    backend_set_name = oci_load_balancer_backendset.backend_api_bs.name
    port             = var.backend_api_port
    vnic_selection   = "PrimaryVnic"
  }
}

########################
# Autoscaling
########################

resource "oci_autoscaling_auto_scaling_configuration" "backend_autoscaling" {
  compartment_id       = var.compartment_ocid
  display_name         = "${var.project_name}-backend-autoscaling"
  cool_down_in_seconds = 300
  is_enabled           = true

  auto_scaling_resources {
    id   = oci_core_instance_pool.backend_pool.id
    type = "instancePool"
  }

  policies {
    display_name = "${var.project_name}-backend-cpu-policy"
    policy_type  = "threshold"

    capacity {
      initial = var.backend_pool_initial_size
      min     = var.backend_pool_min_size
      max     = var.backend_pool_max_size
    }

    rules {
      display_name = "scale-out"
      action {
        type  = "CHANGE_COUNT_BY"
        value = 1
      }
      metric {
        metric_source    = "COMPUTE_AGENT"
        metric_type      = "CPU_UTILIZATION"
        pending_duration = "PT3M"
        threshold {
          operator = "GT"
          value    = tostring(var.backend_cpu_scale_out_threshold)
        }
      }
    }

    rules {
      display_name = "scale-in"
      action {
        type  = "CHANGE_COUNT_BY"
        value = "-1"
      }
      metric {
        metric_source    = "COMPUTE_AGENT"
        metric_type      = "CPU_UTILIZATION"
        pending_duration = "PT3M"
        threshold {
          operator = "LT"
          value    = tostring(var.backend_cpu_scale_in_threshold)
        }
      }
    }
  }
}
