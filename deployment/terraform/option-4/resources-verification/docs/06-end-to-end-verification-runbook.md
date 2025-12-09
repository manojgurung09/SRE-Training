# **Document 06 — End-to-End Verification Runbook (SRE Guide)**

This document provides an **SRE-style operational runbook** for validating end-to-end observability in the BharatMart OCI deployment. It verifies **logs, metrics, alarms, notifications, autoscaling, and application health** using real test procedures.

This runbook should be executed **after** completing manual configuration of Logging, Monitoring, and Notifications (Documents 03–05).

---

# **1. Objective of the Runbook**

This guide verifies:

| Component          | Verification Goal                                            |
| ------------------ | ------------------------------------------------------------ |
| Logging            | All system, network, LB, and application logs are received   |
| Native Metrics     | Compute, LB, Network, and Instance Pool metrics are updating |
| Custom Metrics     | Application-level Prometheus metrics are ingested            |
| Alarms             | Alarms fire correctly and transition states                  |
| Notifications      | Alerts are delivered via ONS topic                           |
| Autoscaling        | Instance pool scales out & in based on CPU load              |
| Application Health | Backend responds on health endpoint                          |

---

# **2. Environment Inputs (Sample Values)**

These values come from your Terraform deployment and are used during testing.

```
Backend API URL:         http://129.159.249.208:3000
Backend Health Check:     http://129.159.249.208:3000/api/health
Load Balancer Public IP:  129.159.249.208
Backend Pool ID:          ocid1.instancepool.oc1.eu-frankfurt-1.aaaaaaaay2zuwwzqi4kqlzoiugczntkdijlai2hot5tffrosbwtvk47yyu4a
Notification Topic ID:    ocid1.onstopic.oc1.eu-frankfurt-1.amaaaaaahqssvraalyjsvt6opnlpba5w4qiibtslf7vqgtcthbbhoo27tt6q
```

---

# **3. Verification Workflow Overview**

```
+----------------+       +------------------+       +------------------+
| Generate Load  | --->  | Logs Generated    | --->  | Logs Verify in    |
| / Traffic      |       | Native / Custom   |       | OCI Logging       |
+----------------+       +------------------+       +------------------+
          |                                                   |
          v                                                   v
+------------------+      +------------------+       +------------------+
| Metrics Update   | ---> | Alarms Fire      | --->  | ONS Notification |
+------------------+      +------------------+       +------------------+
          |                                                   |
          v                                                   v
   +--------------------+                              +--------------------+
   | Autoscaling Reacts | <----------------------------| High CPU Load      |
   +--------------------+                              +--------------------+
```

---

# **4. Step-by-Step Verification Procedures**

# **4.1 Verify Backend Application Health**

### **Command:**

```bash
curl -i http://129.159.249.208:3000/api/health
```

Expected Result:

```
HTTP/1.1 200 OK
{"status": "ok"}
```

[SCREENSHOT-R1: Successful health check response]

---

# **4.2 Generate Traffic to Produce Logs and Metrics**

Send repeated API traffic:

```bash
for i in {1..200}; do curl -s http://129.159.249.208:3000/api/health > /dev/null; done
```

Or using `watch`:

```bash
watch -n 1 curl -s http://129.159.249.208:3000/api/health
```

Expected Outcomes:

* LB Access Logs populate
* Backend app logs populate
* Metrics (request count, LB metrics) update

---

# **4.3 Verify Logs in OCI Console**

### Steps:

1. Go to **Observability → Logging → Log Groups**
2. Open your log group
3. Validate logs:
   ✔ Load Balancer Access Logs
   ✔ Load Balancer Error Logs
   ✔ Backend Application Logs
   ✔ Frontend NGINX Logs
   ✔ VCN Flow Logs

[SCREENSHOT-R2: Log search showing multiple log sources]

Logs should show timestamps within the last few minutes.

---

# **4.4 Verify Native Metrics Update**

### Steps:

1. Go to **Monitoring → Metrics Explorer**
2. Check namespaces:

   * `oci_computeagent`
   * `oci_loadbalancer`
   * `oci_vcn`
3. Validate:
   ✔ CPUUtilization is changing on frontend & backend
   ✔ BackendResponseTime shows values
   ✔ RequestCount increments
   ✔ NetworkBytesIn/Out increases

[SCREENSHOT-R3: Native metrics graph]

---

# **4.5 Verify Custom Metrics Update**

### Steps:

1. Metrics Explorer → Namespace: **`bharatmart_custom`**
2. Select metrics:

   * `http_requests_total`
   * `http_request_duration_seconds`
   * `orders_created_total`
3. Validate that values change as traffic is generated

[SCREENSHOT-R4: Custom metrics graph]

If no values appear:

* Ensure backend `/metrics` endpoint emits data
* Check unified agent logs on backend VM

---

# **4.6 Trigger CPU Load to Fire CPU Alarm**

SSH into a backend instance:

```bash
ssh -i ~/.ssh/id_rsa opc@<backend-private-ip>
```

Install stress tool:

```bash
sudo dnf install stress -y
```

Generate CPU load:

```bash
stress --cpu 4 --timeout 180
```

Expected Outcomes:

* **backend-high-cpu** alarm transitions to **FIRING** within 1–2 minutes
* Notification is sent via ONS topic

[SCREENSHOT-R5: CPU alarm firing state]

---

# **4.7 Validate Alarm State Changes**

### Steps:

1. Go to **Monitoring → Alarms**
2. Click each alarm to view:

   * Current state
   * Metric chart
   * History timeline

Expected:

```
State: FIRING  
Reason: CpuUtilization[1m].mean() > 80
```

[SCREENSHOT-R6: Alarm history showing firing transitions]

---

# **4.8 Validate Notifications Delivery**

### Email Notification Example:

Subject:

```
[ALARM] backend-high-cpu transitioned to FIRING
```

### Console Verification:

1. Go to **Notifications → Subscriptions**
2. Click subscription
3. Check **Recent Messages**

Expected:
✔ Status: Delivered
✔ Timestamp matches alarm firing

[SCREENSHOT-R7: ONS Recent Messages table]

---

# **4.9 Validate Autoscaling Behavior**

Autoscaling should scale **out** when CPU is high.

### Step 1 — Check Current Pool Size

```bash
oci compute-management instance-pool get --instance-pool-id <pool-id>
```

### Step 2 — During CPU Stress, expect:

```
Current Size: increases by 1 or more
```

### Step 3 — After load stops (5–10 minutes):

Pool scales back **in**.

[SCREENSHOT-R8: Instance Pool size change]

Expected Behaviour:

* Scale-out when CPU > threshold
* Scale-in when CPU returns to normal

---

# **4.10 Validate Backend Health Routings Through LB**

After scaling out, new instances must register as healthy.

### Steps:

1. Go to **Load Balancer → Backend Sets → Backend Health**
2. Confirm statuses:

```
backend-1: OK  
backend-2: OK (new instance)
```

[SCREENSHOT-R9: LB backend health]

---

# **5. Troubleshooting (SRE Quick Reference)**

### **5.1 Logs Not Appearing**

* Check unified agent:

```bash
sudo systemctl status unified-agent
```

* Ensure correct file paths
* Verify instance IAM permissions

### **5.2 Metrics Not Updating**

* Validate clock/time sync on VM
* Ensure app emits metrics to `/metrics`

### **5.3 Alarms in INSUFFICIENT DATA**

* Incorrect namespace or dimensions
* Metric data not emitted frequently enough

### **5.4 Notifications Not Delivered**

* Subscription not confirmed
* Email/SMS filters blocking sender
* Topic not attached to alarm

### **5.5 Autoscaling Not Triggering**

* Ensure metric query is correct
* Check min/max limits in autoscaling configuration
* Confirm backend instances are receiving load

---

# **6. Completion Criteria**

This runbook is considered *successfully completed* when:

* All logs sources show recent data
* Native & custom metrics are visible
* Alarms transition through states correctly
* Notifications are delivered
* Autoscaling scales out/in as expected
* LB backend health shows all instances as healthy
* Application health checks respond correctly

---

# **7. Summary**

This SRE runbook verifies full end-to-end Observability and operational readiness of your OCI deployment. After executing this guide, you will have validated:

✔ Logging (LB, VCN, app, agent logs)
✔ Metrics (native + custom)
✔ Alarms (CPU, memory, LB latency, network, pool size)
✔ Notifications (email/SMS/webhook delivery)
✔ Autoscaling (trigger & cooldown)
✔ Application health and LB behavior

Your environment is now operationally validated for production-like readiness.

**Next Document:** Terraform vs Manual Comparison & Recommendations
