# **End-to-End Verification Runbook**

# **0. Environment Setup (Run on Your Local Ubuntu VM 🐧)**

Before running any verification steps, confirm that your OCI CLI configuration is working:

```bash
oci iam region list
```

If this succeeds, continue.

## **0.1 Load Environment Variables from Terraform Outputs**

These values come directly from your Terraform output. Update only if your environment changes.

```bash
export LB_IP="129.159.249.208"
export BACKEND_API_URL="http://129.159.249.208:3000"
export BACKEND_HEALTH_URL="http://129.159.249.208:3000/api/health"

export BACKEND_POOL_ID="ocid1.instancepool.oc1.eu-frankfurt-1.aaaaaaaay2zuwwzqi4kqlzoiugczntkdijlai2hot5tffrosbwtvk47yyu4a"
export NOTIFICATION_TOPIC_ID="ocid1.onstopic.oc1.eu-frankfurt-1.amaaaaaahqssvraalyjsvt6opnlpba5w4qiibtslf7vqgtcthbbhoo27tt6q"
export LOAD_BALANCER_ID="ocid1.loadbalancer.oc1.eu-frankfurt-1.aaaaaaaa7b7xd42kgu7ldpakm37tvkhg5slsfzk2fzuk4mecpgzjo4mqjniq"
export BACKEND_HIGH_CPU_ALARM="ocid1.alarm.oc1.eu-frankfurt-1.amaaaaaahqssvraaaqrb6p6yfeizwniwpgikxuzpxl2vgt5bgroyzhmn2rya"
```

## **0.2 Auto-Detect Values Not Provided by Terraform**

From `~/.oci/config` and OCI IAM.

```bash
export TENANCY_ID=$(grep -E '^tenancy=' ~/.oci/config | cut -d'=' -f2)
export USER_ID=$(grep -E '^user=' ~/.oci/config | cut -d'=' -f2)
export REGION=$(grep -E '^region=' ~/.oci/config | cut -d'=' -f2)
export COMPARTMENT_ID=$(oci iam compartment list --all \
  --query "data[?name=='sre-lab-compartment'].id | [0]" --raw-output)
```

Confirm:

```bash
echo "LB_IP=$LB_IP"
echo "BACKEND_API_URL=$BACKEND_API_URL"
echo "BACKEND_HEALTH_URL=$BACKEND_HEALTH_URL"

echo "BACKEND_POOL_ID=$BACKEND_POOL_ID"
echo "NOTIFICATION_TOPIC_ID=$NOTIFICATION_TOPIC_ID"
echo "LOAD_BALANCER_ID=$LOAD_BALANCER_ID"

echo "BACKEND_HIGH_CPU_ALARM=$BACKEND_HIGH_CPU_ALARM"

# Automatically detected values
echo "TENANCY_ID=$TENANCY_ID"
echo "USER_ID=$USER_ID"
echo "REGION=$REGION"
echo "COMPARTMENT_ID=$COMPARTMENT_ID"
```

---

# **0.3 OS Detection Snippet (Optional)**

Run this on any system:

```bash
source /etc/os-release
echo "Running on: $NAME ($VERSION)"
```

Expected outputs:

* Local VM → Ubuntu 24.04
* OCI Instances → Oracle Linux Server 8.x

---

# **1. Backend Health Check (Run on Ubuntu 🐧)**

```bash
curl -i $BACKEND_HEALTH_URL
```

Expected:

```
HTTP/1.1 200 OK
{"status": "ok"}
```

If not OK:

* Check LB listener configuration
* Validate backend instance health in OCI Console
* Confirm NSG/Security List rules allow LB → Backend traffic

---

# **2. Generate API Traffic (Ubuntu 🐧)**

This generates logs and metrics.

```bash
for i in {1..300}; do curl -s $BACKEND_HEALTH_URL > /dev/null; done
```

Expected:

* LB access logs populate
* Backend log entries appear
* Custom metrics increase (`http_requests_total`)

---
Below is a **short, clean, copy-paste-ready add-on** you can insert directly into the document *right after Section 3*.
It explains **why some logs are not visible**, **what enables them**, and **whether future actions are needed** — without adding unnecessary detail.

---

# **Why Some Logs May Not Be Visible**

Not all log types appear automatically. Each log source has a different enabling mechanism:

### **1. Load Balancer Access Log (Visible immediately)**

Created automatically when Terraform enables:

```
oci_load_balancer_logging
```

→ Appears as soon as traffic hits the LB.

### **2. Load Balancer Error Log (May be missing)**

Appears **only if explicitly enabled** in Terraform.
If missing, check `monitoring-logging.tf` for `"error"` log configuration.

### **3. Backend & Frontend Logs (Unified Agent)**

These logs appear **only when:**

* The **OCI Logging Agent** is installed and running on the VM
* Log file paths exist (e.g., NGINX logs, application logs)
* Terraform created logging configurations for them

If Unified Agent logs are missing, no CLI command will make them appear automatically — the agent must:

1. Be running
2. Have valid config files
3. Have readable log files

### **4. VCN Flow Logs (Visible immediately)**

Created automatically by Terraform via:

```
oci_flow_log
```

→ Updated whenever network traffic flows.

---

# **Will more log types appear later automatically?**

❌ **No.**
New log types do **not** appear just because traffic changes.

✔ They only appear if Terraform (or manual config) explicitly enables them.

---

# **How to make missing logs appear (Instructor Notes)**

If a log type is missing:

| Missing Log                 | How to Enable It                                            |
| --------------------------- | ----------------------------------------------------------- |
| LB Error Log                | Add `error` log block in Terraform → apply                  |
| Backend App Log             | Ensure Unified Agent config exists + app writes logs        |
| NGINX Logs                  | Ensure NGINX access/error logs exist + Unified Agent config |
| Custom logs                 | Add another log source to Unified Agent config              |
| Flow logs for other subnets | Add `oci_flow_log` resources                                |

No manual commands can “force” these logs to appear.
They require **Terraform config + working Unified Agent on VMs**.

---

# Short Version (If You Prefer)

```
Not all logs appear automatically. LB Access/Flow logs are created by Terraform immediately. 
LB Error logs appear only if explicitly enabled. Backend/Frontend logs depend on the OCI Unified Agent 
running on the VM and the correct log file paths being present. No future command will make logs appear—
they only appear when Terraform or Unified Agent configuration enables them.
```

---
Below is the **shortest and safest replacement** for Section 3, based ONLY on logs that **Terraform already creates** in your environment.
This means **NO backend app logs** and **NO frontend NGINX logs**, because your Terraform configuration does *not* currently enable Unified Agent log sources.

This replacement is fully aligned with your actual deployment and avoids mentioning logs that will never appear.

---

# **3. Logging Verification (OCI Console)**

Navigate to **Observability & Management → Logging → Log Groups** and verify the logs that Terraform creates by default in this environment.

### **Expected Logs (Based on Current Terraform Configuration)**

#### ✔ **1. Load Balancer Access Log**

* **Type:** `ACCESS`
* **Service:** `loadbalancer`
* Appears immediately when traffic is sent to the LB.

#### ✔ **2. VCN Flow Logs**

Terraform creates one flow log per subnet.

* **Type:** `FLOW`
* **Service:** `vcn.flowlogs`
* Shows ACCEPT/DROP network events.

### **Why Other Logs Do Not Appear**

Backend application logs and NGINX logs are **not configured in the current Terraform script**, so they will **not** appear in OCI Logging.
No command can make them appear unless logging is explicitly configured for those VM log files.

---

# **4. Native Metrics Verification (OCI Console)**

Open **Observability & Management → Metrics Explorer** and verify metrics from the following namespaces:

### **Namespaces to Check**

* `oci_lbaas` (Load Balancer)
* `oci_computeagent` (Compute Instances)
* `oci_vcn` (VCN Metrics)

---

## **4.1 Load Balancer Metrics (oci_lbaas)**

**Namespace:**

```
oci_lbaas
```

**Filter:**

```
resourceId = "<LOAD_BALANCER_ID>"
```

**Key metrics to verify:**

* `HttpRequests` — Number of HTTP requests handled
* `HandledConnections` — Successful TCP connections
* `ClosedConnections` — Closed TCP connections
* `BytesReceived` — Client → LB bytes
* `BytesSent` — LB → Client bytes
* `BackendTimeouts` — Requests timed out waiting for backend
* `FailedSSLHandshake`, `FailedSSLClientCertVerify` — SSL failures

**Expected behavior:**

* `HttpRequests`, `BytesReceived`, `BytesSent` increase during traffic tests
* `BackendTimeouts` increase if backend service is stopped
* SSL failures remain zero unless intentionally tested

---

## **4.2 Compute Instance Metrics (oci_computeagent)**

**Namespace:**

```
oci_computeagent
```

**Filter:**

```
resourceId = "<INSTANCE_OCID>"
```

**Key metrics:**

* `CpuUtilization`
* `DiskUtilization`
* `NetworkBytesIn`
* `NetworkBytesOut`

**Expected behavior:**

* CPU spikes during stress tests
* Network metrics increase during API traffic

---

## **4.3 VCN Metrics (oci_vcn)**

**Namespace:**

```
oci_vcn
```

**Filter:**

```
resourceId = "<VCN_ID>"
```

**Key metrics:**

* `BytesIngress`
* `BytesEgress`
* `PacketsIngress`
* `PacketsEgress`

---

## **4.4 Quick Verification Checklist**

* `oci_lbaas` namespace appears
* `HttpRequests` updates during traffic loop
* `BytesSent` / `BytesReceived` increase steadily
* Compute `CpuUtilization` reacts to stress
* VCN `BytesIngress` / `BytesEgress` reflect traffic flow

---


# **5. Custom Metrics Verification (OCI Console)**

Namespace:

```
bharatmart_custom
```

Metrics:

* http_requests_total
* http_request_duration_seconds

Generate more traffic if needed:

```bash
for i in {1..500}; do curl -s $BACKEND_API_URL > /dev/null; done
```

---

# **6. Trigger CPU Load on Backend VM (Oracle Linux 8 ☀️)**

SSH into backend VM:

```bash
ssh -i ~/.ssh/id_rsa opc@<backend_private_ip>
```

## **6.1 Verify OS (☀️)**

```bash
cat /etc/os-release
```

Expect:

```
Oracle Linux Server 8.x
```

---

# **6.2 Install Stress Tool (Automatic Fallback Logic, OL8 ☀️)**

```bash
# Try EPEL first
sudo dnf install -y epel-release && sudo dnf install -y stress && exit 0

# Try CodeReady Builder
sudo dnf config-manager --set-enabled ol8_codeready_builder && sudo dnf install -y stress && exit 0

# Fallback: stress-ng
sudo dnf install -y stress-ng
```

---

# **6.3 Run CPU Load (☀️)**

```bash
stress --cpu 4 --timeout 180 2>/dev/null || stress-ng --cpu 4 --timeout 180
```

Expected:

* High CPU alert triggers

---

# **7. Verify Alarm State (Run on Ubuntu 🐧)**

```bash
oci monitoring alarm get --alarm-id $BACKEND_HIGH_CPU_ALARM | jq '.data.status'
```

Expected:

```
"FIRING"
```

---

# **8. Notification Verification (Email + Console)**

CLI check:

```bash
oci ons message list --topic-id $NOTIFICATION_TOPIC_ID --all
```

Expected:

* Recent messages in **DELIVERED** state

---

# **9. Autoscaling Verification (Ubuntu 🐧)**

```bash
oci compute-management instance-pool get --instance-pool-id $BACKEND_POOL_ID --query 'data.size'
```

Expect:

* Scale out under load
* Return to baseline after cooldown

---

# **10. Load Balancer Backend Health (OCI Console)**

Check under LB → Backend Sets.
Expected:

* All backends healthy (green)

If not:

* Validate backend service
* Check NSG rules
* Confirm instance pool placement

---

# **11. Failure Mode Testing (Optional, Instructor Recommended)**

## **11.1 Backend Service Failure (☀️)**

```bash
sudo systemctl stop backend.service
```

Expect:

* LB shows backend as **CRITICAL**
* Alerts fire

Restore:

```bash
sudo systemctl start backend.service
```

## **11.2 Frontend NGINX Failure (☀️)**

```bash
sudo systemctl stop nginx
```

Expect:

* Surge in 5xx
* LB health may show warnings

Restore:

```bash
sudo systemctl start nginx
```

---

# **12. Oracle Linux Troubleshooting (☀️)**

### **DNF Repo Issues**

```bash
sudo dnf repolist
sudo dnf config-manager --set-enabled ol8_codeready

```
