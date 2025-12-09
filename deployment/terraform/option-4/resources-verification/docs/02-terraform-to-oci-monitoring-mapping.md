# **Document 02 — Terraform → OCI Monitoring & Logging Mapping (Reference Guide)**

This document provides a clear, tabular reference mapping between **Terraform resources** and the corresponding **OCI Console objects** for Monitoring, Logging, Alarms, Notifications, and Flow Logs. It is designed as a quick lookup for DevOps, SRE, and Cloud Engineers.

All examples reference realistic OCIDs from a deployed environment (sample values only).

---

# **1. Log Groups Mapping**

| Terraform Resource      | Purpose                                                | OCI Console Object | Console Navigation                                    | CLI Verification                                |
| ----------------------- | ------------------------------------------------------ | ------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| `oci_logging_log_group` | Creates a log group to store all service & custom logs | Log Group          | **Observability & Management → Logging → Log Groups** | `oci logging log-group get --log-group-id <id>` |

**Sample Value:**

```
log_group_id = "ocid1.loggroup.oc1.eu-frankfurt-1.amaaaaaahqssvraaa4eqcigolxmpfbvkbzt7kls6ftgxxhhgj4f3rqgmxoha"
```

---

# **2. VCN Flow Logs Mapping**

| Terraform Resource                         | Purpose                          | OCI Console Object | Console Navigation                         | CLI Verification                    |
| ------------------------------------------ | -------------------------------- | ------------------ | ------------------------------------------ | ----------------------------------- |
| `oci_logging_log` (source = VCN Flow Logs) | Enables VCN flow logs per subnet | Flow Log           | **Networking → VCN → Subnets → Flow Logs** | `oci logging log get --log-id <id>` |

**Sample Values:**

```
vcn_flow_log_backend_subnet_ids = {
  "backend-subnet-1" = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaxj2t44hdyadblrkugojhroszwp4wnk45xafcq6drmxxa"
  "backend-subnet-2" = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaghsoup4e75mz4wqoo5y7hthlgid3c3kqhye2l4fvrifa"
  "backend-subnet-3" = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaqts6btgkmifwirhwvhcleg46vccfctkl3wxohkymbi3q"
}
```

---

# **3. Load Balancer Logs Mapping**

| Terraform Resource                         | Purpose                       | OCI Console Object | Console Navigation                     | CLI Verification                    |
| ------------------------------------------ | ----------------------------- | ------------------ | -------------------------------------- | ----------------------------------- |
| `oci_logging_log` (source = Load Balancer) | LB Access Logs, LB Error Logs | Load Balancer Logs | **Networking → Load Balancers → Logs** | `oci logging log get --log-id <id>` |

**Sample Values:**

```
load_balancer_access_log_id = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraa7wjevpbh4pysars3k6fxz5mmqy2hw3v76oums2zt6klq"
load_balancer_error_log_id  = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraafswiidpfwaa2jmxywpdv25kvvowo2tnwqqwlkpof5aoa"
```

---

# **4. Compute Instance Logs (Unified Agent) Mapping**

| Terraform Resource                     | Purpose                                            | OCI Console Object | Console Navigation                              | CLI Verification                    |
| -------------------------------------- | -------------------------------------------------- | ------------------ | ----------------------------------------------- | ----------------------------------- |
| `oci_logging_log` + Cloud Agent Config | Enables ingestion of custom logs (NGINX, app logs) | Custom Logs        | **Observability → Logging → Log Groups → Logs** | `oci logging log get --log-id <id>` |

**Sample Values:**

```
frontend_nginx_access_log_id = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraakqou4lyyvu63yxw7gcff32ybz5h76gzg22e3igscpmsq"
frontend_nginx_error_log_id  = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraatzkzcdxgv4nyaeaoiwjxjksfajtzbylh742nqjbhoeea"
backend_app_log_id = "ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraagdlycyekjn7uocpiv3dyklsu2e6sztikey3zwofpweba"
```

---

# **5. Native Metrics Mapping**

| Terraform Resource | Purpose                                        | OCI Console Object | Console Navigation                                | CLI Verification                  |
| ------------------ | ---------------------------------------------- | ------------------ | ------------------------------------------------- | --------------------------------- |
| None (OCI-native)  | CPU, Memory, Disk, LB Metrics, Network metrics | Native Metrics     | **Observability → Monitoring → Metrics Explorer** | `oci monitoring metric-data list` |

**Examples of native metrics:**

* `CpuUtilization`
* `MemoryUtilization`
* `DiskUtilization`
* `BytesIn`, `BytesOut`
* `BackendResponseTime`

---

# **6. Custom Metrics Mapping (Prometheus)**

| Terraform Resource                                    | Purpose                                | OCI Console Object       | Console Navigation                                               | CLI Verification                                                |
| ----------------------------------------------------- | -------------------------------------- | ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| `oci_monitoring_metric_data` or Agent-based ingestion | Sends Prometheus-format metrics to OCI | Custom Metrics Namespace | **Monitoring → Metrics Explorer → Namespace: bharatmart_custom** | `oci monitoring metric-data list --namespace bharatmart_custom` |

**Metrics typically include:**

* `http_requests_total`
* `http_request_duration_seconds`
* `orders_created_total`
* `payment_processed_total`

---

# **7. Alarms Mapping**

| Terraform Resource     | Purpose                           | OCI Console Object | Console Navigation                      | CLI Verification                           |
| ---------------------- | --------------------------------- | ------------------ | --------------------------------------- | ------------------------------------------ |
| `oci_monitoring_alarm` | Alarm definitions with thresholds | Alarms             | **Observability → Monitoring → Alarms** | `oci monitoring alarm get --alarm-id <id>` |

**Sample Alarm OCIDs:**

```
monitoring_alarms = {
  backend_high_cpu            = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraaaqrb6p6yfeizwniwpgikxuzpxl2vgt5bgroyzhmn2rya"
  backend_high_memory         = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraa6w6k3sf6lsdkiicmmg62kjw2q7eo5ghsjvzx2oscobca"
  compute_disk_utilization    = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraasb5fbsvb75c6wjo6t3wkbuvlhmsugmcdvtesqnw7orda"
  frontend_high_cpu           = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraac4zqfsbnab5dwlvuidmz62xgton4ehnsyedg35c3osiq"
  frontend_high_memory        = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraayite76sxgjskv6tgq7duggg2icbzh5uxgvrpxiap7goq"
  instance_pool_high_size     = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraaaowqplpauyu463fsqkifyeeuv7qzcd55w43hxvqabe2a"
  instance_pool_low_size      = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraachf7j3bgc4w5clpgnpf3snwnnfbu4ahhknbyh2yn2umq"
  lb_backend_health           = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraa4i3yx3nengrpfqpkwqm33lv36hvlekbxfh77wfur5r6q"
  lb_high_request_rate        = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraadc3snz4pd2xpqlwxeakihzqjfjznebsr3ei4unwb4kua"
  lb_high_response_time       = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraaydyjpdsil5zyixept7dhf5g66j6eh3wasvbjlz2jyaka"
  network_high_egress         = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraabq4hvp5dltldnb3bphbgbztw3cf2mfgshtwtcv7thm4a"
  network_high_ingress        = "ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraa6a72eyzlm3xzxqo77zp7r5ryvyofy2xpuveupgxgh2za"
}
```

---

# **8. Notifications (ONS) Mapping**

| Terraform Resource           | Purpose                       | OCI Console Object | Console Navigation                                     | CLI Verification                                  |
| ---------------------------- | ----------------------------- | ------------------ | ------------------------------------------------------ | ------------------------------------------------- |
| `oci_ons_notification_topic` | Notification Topic for alarms | Topic              | **Developer Services → Notifications → Topics**        | `oci ons topic get --topic-id <id>`               |
| `oci_ons_subscription`       | Email/SMS subscriptions       | Subscription       | **Developer Services → Notifications → Subscriptions** | `oci ons subscription get --subscription-id <id>` |

**Sample Topic:**

```
notification_topic_id = "ocid1.onstopic.oc1.eu-frankfurt-1.amaaaaaahqssvraalyjsvt6opnlpba5w4qiibtslf7vqgtcthbbhoo27tt6q"
```

---

# **9. Instance Pool Autoscaling Signals**

| Terraform Resource              | Purpose                      | OCI Console Object        | Console Navigation                         | CLI Verification                                                         |
| ------------------------------- | ---------------------------- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `oci_autoscaling_configuration` | CPU-based scale-out/in rules | Autoscaling Configuration | **Compute → Instance Pools → Autoscaling** | `oci autoscaling configuration get --auto-scaling-configuration-id <id>` |

**Sample Value:**

```
backend_autoscaling_configuration_id = "ocid1.autoscalingconfiguration.oc1.eu-frankfurt-1.amaaaaaahqssvraa65l44n6yegd5onfslu33fwc676crlovmaqfsr4bmlp6q"
```

---

# **10. Summary Table (Master View)**

| Category       | TF Resource                       | OCI Object           | Console Path                           |
| -------------- | --------------------------------- | -------------------- | -------------------------------------- |
| Log Group      | `oci_logging_log_group`           | Log Group            | Logging → Log Groups                   |
| Flow Logs      | `oci_logging_log`                 | Flow Log             | VCN → Subnets → Flow Logs              |
| LB Logs        | `oci_logging_log`                 | LB Access/Error Logs | Load Balancer → Logs                   |
| Instance Logs  | Unified Agent + `oci_logging_log` | Custom Logs          | Logging → Log Groups                   |
| Native Metrics | None                              | Metrics              | Monitoring → Metrics Explorer          |
| Custom Metrics | Agent / ingestion                 | Custom Namespace     | Metrics Explorer                       |
| Alarms         | `oci_monitoring_alarm`            | Alarms               | Monitoring → Alarms                    |
| Notifications  | `oci_ons_notification_topic`      | ONS Topic            | Notifications → Topics                 |
| Subscriptions  | `oci_ons_subscription`            | ONS Subscription     | Notifications → Subscriptions          |
| Autoscaling    | `oci_autoscaling_configuration`   | Autoscaling Rules    | Compute → Instance Pools → Autoscaling |

