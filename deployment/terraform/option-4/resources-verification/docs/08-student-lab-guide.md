# **Document 08 — Student Lab Guide (Hands-On Observability Training)**

This document provides a **guided, step-by-step lab** for learners to practice configuring and validating Observability and Monitoring features in OCI. It is designed for instructor-led training, individual learners, or self-paced SRE practice.

Each lab includes:
✔ Learning objectives
✔ Prerequisites
✔ Step-by-step tasks
✔ Expected output
✔ Troubleshooting guidance

---

# **Lab Overview**

This lab contains **8 hands-on exercises** covering Logging, Metrics, Monitoring, Alarms, Notifications, and Autoscaling.

| Lab # | Title                                        | Skill Area                |
| ----- | -------------------------------------------- | ------------------------- |
| 1     | Explore OCI Logging & Log Groups             | Logging Fundamentals      |
| 2     | Enable VCN Flow Logs                         | Network Observability     |
| 3     | Enable Load Balancer Access/Error Logs       | LB Observability          |
| 4     | Configure Unified Agent for App & NGINX Logs | Compute Log Ingestion     |
| 5     | Explore Metrics Explorer                     | Metrics Fundamentals      |
| 6     | Create Native Metric Alarms                  | Monitoring & Alerting     |
| 7     | Create Custom Metrics + Alarm                | Custom Telemetry          |
| 8     | Trigger Alarms & Autoscaling                 | End-to-End SRE Validation |

---

# **Prerequisites**

Before starting, students must have:

* OCI account with necessary IAM policies
* Deployed BharatMart environment (Terraform or pre-created resources)
* Access to:

  * Load balancer public IP
  * Backend API URL
  * Compartment OCIDs
* SSH access to compute instances

---

# **LAB 1 — Explore OCI Logging & Log Groups**

### **Objective:**

Learn how logs are grouped, stored, and queried in OCI.

### **Steps:**

1. Go to **Observability & Management → Logging → Log Groups**
2. Identify your log group (e.g., `bharatmart-log-group`).
3. Open the log group.
4. Explore:

   * Load Balancer logs
   * VCN Flow Logs
   * App logs
   * NGINX logs
5. Open any log and run a basic query.

### **Expected Output:**

You can see fresh log entries within the last few minutes.

---

# **LAB 2 — Enable VCN Flow Logs**

### **Objective:**

Enable flow logs for network visibility.

### **Steps:**

1. Navigate to **Networking → VCNs → Subnets**
2. Open a subnet
3. Scroll to **Flow Logs → Create Flow Log**
4. Select your log group
5. Save

Repeat for at least 1 backend subnet.

### **Validation:**

1. Send API requests to backend
2. Return to log view
3. Flow logs should show allow/deny rules and traffic metadata

---

# **LAB 3 — Enable Load Balancer Access & Error Logs**

### **Objective:**

Enable LB-level observability.

### **Steps:**

1. Go to **Load Balancers → Your LB → Logs**
2. Enable:

   * **Access Logs**
   * **Error Logs**

### **Validation:**

Generate traffic:

```bash
curl -i http://<lb-ip>/
```

Logs should populate.

---

# **LAB 4 — Configure Unified Agent for NGINX & Backend App Logs**

### **Objective:**

Learn how to ingest custom logs using Cloud Agent.

### **Steps:**

1. Go to **Compute → Instances → Frontend Instance**
2. Navigate to **Management → Logging**
3. Create log sources:

   * `/var/log/nginx/access.log`
   * `/var/log/nginx/error.log`
4. Repeat for backend app log:

   * `/var/log/backend/app.log`

### **Validation:**

Run:

```bash
sudo tail -f /var/log/nginx/access.log
```

Generate traffic.
Log entries should appear in OCI Logging.

---

# **LAB 5 — Explore Metrics Explorer**

### **Objective:**

Visualize native and custom metrics.

### **Steps:**

1. Go to **Monitoring → Metrics Explorer**
2. Explore namespaces:

   * `oci_computeagent`
   * `oci_loadbalancer`
   * `bharatmart_custom`
3. Graph:

   * CPUUtilization
   * BackendResponseTime
   * http_requests_total

### **Expected Output:**

A graph showing metric values over time.

---

# **LAB 6 — Create Native Metric Alarms**

### **Objective:**

Learn how to configure alarms that detect threshold violations.

### **Steps:**

1. Go to **Monitoring → Alarms → Create Alarm**
2. Create **High CPU** alarm:

```
CpuUtilization[1m].mean() > 80
```

3. Severity: Critical
4. Notification Topic: select topic

### **Validation:**

Alarm state should show **OK** initially.

---

# **LAB 7 — Create Alarm for Custom Metrics**

### **Objective:**

Alert on application-level behavior.

### **Steps:**

1. Metrics Explorer → Namespace: `bharatmart_custom`
2. Create alarm on metric:

```
http_requests_total[1m].rate() > 200
```

3. Wire alarm to notification topic

### **Validation:**

Metric graph should show increasing values when generating traffic.

---

# **LAB 8 — Trigger Alarms & Autoscaling (End-to-End Test)**

### **Objective:**

Validate full observability pipeline: logs → metrics → alarms → notifications → autoscaling.

---

## **Part A — Trigger CPU Load**

SSH into backend instance:

```bash
sudo dnf install stress -y
stress --cpu 4 --timeout 120
```

Expected:

* High CPU alarm → FIRING
* Notification delivered
* Autoscaling triggers (pool size increases)

---

## **Part B — Trigger LB Response Alarm**

Send heavy requests:

```bash
for i in {1..2000}; do curl -s http://<lb-ip>/api/health > /dev/null; done
```

Expected:

* `lb_high_response_time` alarm might fire

---

## **Part C — Validate Autoscaling**

Check instance pool size:

```bash
oci compute-management instance-pool get --instance-pool-id <pool-id>
```

Expected:

```
current-size: increased by 1 or 2
```

After cooldown:

```
pool-size returns to baseline
```

---
