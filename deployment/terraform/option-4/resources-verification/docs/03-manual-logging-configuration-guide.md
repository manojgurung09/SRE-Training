# **Document 03 — Manual Logging Configuration Guide (OCI Console)**

This document provides a complete **step-by-step guide** for configuring Logging manually in OCI Console. It includes VCN Flow Logs, Load Balancer Logs, Unified Agent configurations, and application log ingestion for both frontend (NGINX) and backend (Node.js) instances.

It is designed for DevOps and SRE teams who want to configure logging without Terraform.

---

# **1. Create a Log Group**

A Log Group is required to store all logs — service logs, flow logs, LB logs, and custom logs.

### **Steps:**

1. Go to **Observability & Management → Logging → Log Groups**
2. Click **Create Log Group**
3. Enter:

   * **Name:** `bharatmart-log-group` (or any name)
   * **Compartment:** Select your target compartment
4. Click **Create**

[SCREENSHOT-L1: Log Group creation page]

---

# **2. Enable VCN Flow Logs (Per Subnet)**

Flow logs capture network traffic metadata—essential for debugging, security analysis, and forensic investigations.

### **Steps:**

1. Go to **Networking → Virtual Cloud Networks**
2. Select your VCN → **Subnets**
3. Open a subnet → Scroll to **Flow Logs**
4. Click **Create Flow Log**
5. Enter:

   * **Name:** `backend-subnet-1-flow-log`
   * **Log Group:** Select `bharatmart-log-group`
   * **Log Type:** `VCN Flow Logs`
6. Click **Create**

Repeat for each subnet.

[SCREENSHOT-L2: Create VCN Flow Log dialog]

**Sample Flow Log IDs (from reference environment):**

```
backend-subnet-1 = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaxj2t44hdyadblrkugojhroszwp4wnk45xafcq6drmxxa
backend-subnet-2 = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaghsoup4e75mz4wqoo5y7hthlgid3c3kqhye2l4fvrifa
backend-subnet-3 = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraaqts6btgkmifwirhwvhcleg46vccfctkl3wxohkymbi3q
```

---

# **3. Enable Load Balancer Logs (Access & Error Logs)**

Load Balancer logs offer visibility into HTTP traffic, latency, errors, backend selection, and routing decisions.

### **Steps:**

1. Go to **Networking → Load Balancers**
2. Select your Load Balancer
3. Open the **Resources** menu → Click **Logs**
4. For **Access Logs**:

   * Click **Enable**
   * Select `bharatmart-log-group`
   * Save
5. For **Error Logs**:

   * Repeat the process

[SCREENSHOT-L3: Load Balancer Logs configuration]

**Sample LB Log IDs:**

```
Access Log: ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraa7wjevpbh4pysars3k6fxz5mmqy2hw3v76oums2zt6klq
Error Log : ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraafswiidpfwaa2jmxywpdv25kvvowo2tnwqqwlkpof5aoa
```

---

# **4. Configure Unified Agent for Frontend (NGINX) Logs**

The frontend VM runs NGINX, which generates:

* Access logs (`/var/log/nginx/access.log`)
* Error logs (`/var/log/nginx/error.log`)

These logs must be collected by OCI Cloud Agent.

### **Prerequisites:**

✔ Cloud Agent must be enabled
✔ Unified Agent plugin must be installed
✔ Instance must be running Oracle Linux or supported OS

### **Steps:**

1. Go to **Compute → Instances**
2. Select your frontend instance
3. Scroll to **Management → Logging**
4. Click **Enable Logging**
5. Configure each log source:

   * **Log Name:** `frontend-nginx-access-log`
   * **Path:** `/var/log/nginx/access.log`
   * **Log Type:** Text
   * **Log Group:** Select your group

Repeat for error logs:

* `frontend-nginx-error-log`
* Path: `/var/log/nginx/error.log`

[SCREENSHOT-L4: Enable Unified Agent for NGINX logs]

**Sample Log IDs:**

```
frontend_nginx_access_log_id = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraakqou4lyyvu63yxw7gcff32ybz5h76gzg22e3igscpmsq
frontend_nginx_error_log_id  = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraatzkzcdxgv4nyaeaoiwjxjksfajtzbylh742nqjbhoeea
```

---

# **5. Configure Unified Agent for Backend Application Logs**

The backend (Node.js) application writes JSON logs, usually to:

```
/var/log/backend/app.log
```

Or within the Node.js app directory.

### **Steps:**

1. Go to **Compute → Instance Pools → Instances**
2. Select a backend instance
3. Under **Management → Logging**, click **Enable Custom Log**
4. Enter:

   * **Log Name:** `backend-app-log`
   * **File Path:** `/var/log/backend/app.log`
   * **Log Type:** JSON
   * **Log Group:** `bharatmart-log-group`
5. Save

[SCREENSHOT-L5: Backend app log configuration]

**Sample Log ID:**

```
backend_app_log_id = ocid1.log.oc1.eu-frankfurt-1.amaaaaaahqssvraagdlycyekjn7uocpiv3dyklsu2e6sztikey3zwofpweba
```

---

# **6. Validate That Logs Are Flowing**

After configuration, let the system generate logs (traffic, errors, app requests). Then:

### **Steps:**

1. Go to **Observability & Management → Logging → Log Groups**
2. Open your log group
3. Open any log (NGINX, backend, VCN flow, LB access/error)
4. Click **Search** to view logs

[SCREENSHOT-L6: Log search results]

### **Validation Checklist:**

✔ NGINX access & error logs visible
✔ Backend application logs visible
✔ Load Balancer Access/Error logs visible
✔ VCN Flow Logs visible
✔ Timestamps updating every few seconds or minutes

If logs do not appear, verify cloud-agent status:

```
sudo systemctl status unified-agent
sudo journalctl -u unified-agent -f
```

---

# **7. (Optional) Create Log Retention Policies**

You can configure how long logs are stored.

### **Steps:**

1. Go to **Logging → Log Groups**
2. Open the group
3. Click **Edit**
4. Set retention:

   * 30 days
   * 60 days
   * 90 days
   * Custom

[SCREENSHOT-L7: Log retention configuration]

---

# **8. (Optional) Enable Log Exports to Object Storage**

Useful for:

* Long-term retention
* SIEM integration
* Cost optimization

### **Steps:**

1. Open the target log
2. Click **Actions → Export to Object Storage**
3. Select bucket
4. Choose rotation settings

[SCREENSHOT-L8: Log export configuration]

---

# **9. Summary**

By completing this guide, you have manually configured all required logging components:

* Created a Log Group
* Enabled VCN Flow Logs for all subnets
* Enabled Load Balancer Access & Error logs
* Configured Unified Agent for:

  * Frontend NGINX logs
  * Backend application logs (JSON)
* Verified all logs flowing into OCI Logging
* (Optional) Configured log retention & export

These logs form the foundation for deeper observability, monitoring, alerting, and debugging workflows covered in later documents.

**Next Document:** Manual Monitoring & Metrics Configuration Guide
