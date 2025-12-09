# **Document 04 — Manual Monitoring & Metrics Configuration Guide (OCI Console)**

This document provides a complete step-by-step guide for **manual configuration of Monitoring, Metrics, and Alarms** in OCI. It covers native OCI metrics, custom metrics ingestion, alarm configuration, and console + CLI validation procedures.

Designed for Cloud Engineers, DevOps, and SRE teams needing manual (non-Terraform) monitoring setup.

---

# **1. Viewing Native OCI Metrics**

OCI automatically collects metrics for services like Compute, Load Balancers, Block Volumes, and Instance Pools.

### **Steps to View System Metrics:**

1. Go to **Observability & Management → Monitoring → Metrics Explorer**
2. Select the appropriate **Compartment**
3. Choose the **Namespace**, such as:

   * `oci_computeagent` (Compute: CPU, memory, disk)
   * `oci_loadbalancer` (LB metrics)
   * `oci_vcn` (Network metrics)
4. Select a metric, e.g.:

   * `CpuUtilization`
   * `MemoryUtilization`
   * `DiskUtilization`
   * `PacketsIn`, `PacketsOut`
5. Choose the **Dimension**, such as instance OCID or load balancer OCID
6. View the real-time graph

[SCREENSHOT-M1: OCI Metrics Explorer default screen]

---

# **2. Understanding Key Native Metrics**

Below are the most important native metrics for your BharatMart deployment.

### **2.1 Compute Metrics**

* **CpuUtilization** — percentage of CPU used
* **MemoryUtilization** — RAM usage
* **DiskUtilization** — filesystem usage
* **NetworkBytesIn/Out** — network throughput

### **2.2 Load Balancer Metrics**

* **BackendResponseTime** — response latency
* **ClientErrors/ServerErrors** — HTTP error responses
* **RequestCount** — total LB requests
* **HealthyBackendCount** — tracks backend server health

### **2.3 Instance Pool Metrics**

* **CurrentSize** — number of instances in pool
* **DesiredSize** — autoscaling target size

### **2.4 Network Metrics**

* **BytesIn**, **BytesOut** — egress/ingress volume
* **Connections** — TCP connection counters

[SCREENSHOT-M2: Common system metrics selection]

---

# **3. Configuring Custom Metrics Ingestion (Prometheus Format)**

The backend (Node.js) exposes a Prometheus `/metrics` endpoint. OCI can ingest these metrics into a custom namespace, such as:

```
bharatmart_custom
```

### **Supported Formats:**

* Prometheus exposition text format (`key value`)
* JSON format via API requests

### **3.1 Configure Instance to Push Metrics Manually**

You can use `curl` to send custom metrics:

#### **Example Command:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <InstancePrincipalToken>" \
  -d '{
        "metricData": [
          {
            "namespace": "bharatmart_custom",
            "resourceGroup": "backend",
            "compartmentId": "<COMPARTMENT_OCID>",
            "name": "orders_created_total",
            "dimensions": {"instanceId": "<INSTANCE_OCID>"},
            "datapoints": [{"value": 10, "timestamp": "2024-01-01T10:00:00Z"}]
          }
        ]
      }' \
  https://telemetry-ingestion.<region>.oci.oraclecloud.com/20180401/metrics
```

### **3.2 Validate Custom Metrics in Console**

1. Go to **Monitoring → Metrics Explorer**
2. Select namespace: `bharatmart_custom`
3. Choose any metric:

   * `http_requests_total`
   * `orders_created_total`
   * `payment_processed_total`
4. Choose dimension: `instanceId`

[SCREENSHOT-M3: Custom metrics appearing in Metrics Explorer]

---

# **4. Creating Metric Alarms (CPU, Memory, Disk, LB Latency, etc.)**

Alarms are triggered when metrics exceed thresholds.

## **4.1 Create an Alarm for High CPU Usage**

### **Steps:**

1. Go to **Monitoring → Alarms**
2. Click **Create Alarm**
3. Enter:

   * **Display Name:** `backend-high-cpu`
   * **Compartment:** select your compartment
4. **Metric Query:**

```
CpuUtilization[1m].mean() > 80
```

5. **Metric Namespace:** `oci_computeagent`
6. **Dimensions:** `resourceId = <backend instance OCID>`
7. **Severity:** Critical
8. **Destination:** Select Notification Topic
9. **Repeat Notification:** Recommended
10. Click **Create Alarm**

[SCREENSHOT-M4: Create CPU alarm]

---

## **4.2 Create Memory Alarm**

### Metric Query:

```
MemoryUtilization[1m].mean() > 85
```

[SCREENSHOT-M5: Create memory alarm]

---

## **4.3 Disk Utilization Alarm**

### Metric Query:

```
DiskUtilization[5m].mean() > 90
```

---

## **4.4 Load Balancer High Response Time Alarm**

### Metric Query:

```
BackendResponseTime[1m].mean() > 2000
```

### Navigation:

* **Namespace:** `oci_loadbalancer`
* **Dimension:** `resourceId = <load balancer OCID>`

[SCREENSHOT-M6: LB response latency alarm]

---

## **4.5 Load Balancer High Request Count Alarm**

### Metric Query:

```
RequestCount[1m].sum() > 1000
```

---

## **4.6 Instance Pool Size Alarms**

Useful for detecting unexpected scaling.

### **High Size Alarm Query:**

```
CurrentSize > <max_threshold>
```

### **Low Size Alarm Query:**

```
CurrentSize < <min_threshold>
```

[SCREENSHOT-M7: Instance Pool alarm creation]

---

# **5. Creating Alarms for Custom Metrics**

### Example: alert when too many orders are created in short time.

### **Metric Query:**

```
orders_created_total[1m].rate() > 100
```

### **Steps:**

1. Go to **Monitoring → Alarms → Create Alarm**
2. Namespace: `bharatmart_custom`
3. Metric Name: `orders_created_total`
4. Dimensions: `instanceId`
5. Operator: `Greater Than`
6. Threshold: `100`
7. Severity: `Warning`
8. Notification Topic: Select your topic

[SCREENSHOT-M8: Custom metric alarm creation]

---

# **6. Validate Alarms Through Console & CLI**

## **6.1 Check Alarm State in Console**

1. Go to **Monitoring → Alarms**
2. View states:

   * OK
   * FIRING
   * INSUFFICIENT DATA

[SCREENSHOT-M9: Alarms list]

---

## **6.2 Validate Alarm via CLI**

```
oci monitoring alarm get --alarm-id <ALARM_OCID>
```

### Sample Alarm OCID:

```
backend_high_cpu = ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraaaqrb6p6yfeizwniwpgikxuzpxl2vgt5bgroyzhmn2rya
```

---

# **7. Recommended Alarm Thresholds (Best Practices)**

| Metric                 | Recommended Threshold | Notes                             |
| ---------------------- | --------------------- | --------------------------------- |
| CPU Utilization        | > 80%                 | Scale-out typically begins here   |
| Memory Utilization     | > 85%                 | Memory saturation causes OOM risk |
| Disk Utilization       | > 90%                 | Avoids file system exhaustion     |
| LB Response Time       | > 2000ms              | Indicates backend slowness        |
| LB Request Rate        | > 1000 req/min        | Detect sudden spikes              |
| Network Ingress/Egress | > 500 Mbps            | Detect DDoS or heavy load         |
| Orders Created Rate    | > 100/min             | App-level alert                   |

---

# **8. Troubleshooting Metrics & Alarms**

### **8.1 Missing Metrics**

* Check instance Cloud Agent status:

```
sudo systemctl status oracle-cloud-agent
sudo systemctl status unified-agent
```

### **8.2 Custom Metrics Not Visible**

* Ensure `/metrics` endpoint is reachable
* Check timestamp format: must be ISO8601
* Confirm namespace spelling matches your query

### **8.3 Alarms Always in ‘INSUFFICIENT DATA’**

* Metric is not emitted at expected frequency
* Wrong compartment selected
* Incorrect namespace or resourceId

### **8.4 LB Metrics Missing**

* Verify LB has traffic
* Ensure appropriate listener paths are active

---

# **9. Summary**

In this guide, you manually configured:

* Viewing and understanding native metrics
* Custom Prometheus metric ingestion
* Creating alarms for system metrics
* Creating alarms for custom business metrics
* Validating alarms using Console & CLI
* Applying recommended best-practice thresholds

You now have the full monitoring and alerting foundation for the OCI deployment.

**Next Document:** Notifications (ONS) Configuration Guide
