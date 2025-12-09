# **Document 05 — OCI Notifications (ONS) Configuration Guide**

This document provides a complete step-by-step guide to manually configure **OCI Notifications (ONS)** including Topics, Subscriptions, Alarm integration, and testing message delivery. Notifications are a key part of SRE alerting workflows.

---

# **1. Introduction to OCI Notifications (ONS)**

OCI Notifications is a fully managed pub/sub messaging service used to deliver alerts from:

* Monitoring Alarms
* Autoscaling events
* Functions
* Custom applications

Supported subscription types:

* **Email**
* **SMS**
* **HTTPS / Webhook**
* **PagerDuty**
* **Slack (via HTTPS endpoint)**

ONS delivers messages instantly and integrates tightly with Monitoring.

---

# **2. Create a Notification Topic**

A Topic is a logical message channel where alarms publish alert messages.

### **Steps:**

1. Go to **Developer Services → Notifications → Topics**
2. Click **Create Topic**
3. Enter:

   * **Name:** `bharatmart-alert-topic`
   * **Description:** Optional
   * **Compartment:** Select target compartment
4. Click **Create**

[SCREENSHOT-N1: Create Notification Topic page]

### **Sample Topic OCID (from deployed environment):**

```
notification_topic_id = ocid1.onstopic.oc1.eu-frankfurt-1.amaaaaaahqssvraalyjsvt6opnlpba5w4qiibtslf7vqgtcthbbhoo27tt6q
```

---

# **3. Create a Subscription (Email, SMS, HTTPS, etc.)**

Once a topic exists, users must subscribe to receive messages.

## **3.1 Create an Email Subscription**

### **Steps:**

1. Open the Topic → Click **Create Subscription**
2. Choose **Email** as the protocol
3. Enter recipient email
4. Click **Create**

[SCREENSHOT-N2: Create Email Subscription]

### **A confirmation email will be sent to the user**

The user must click **Confirm subscription**.

---

## **3.2 Create an SMS Subscription (Optional)**

### **Steps:**

1. Open Topic → **Create Subscription**
2. Protocol: **SMS**
3. Enter phone number in international format: `+91xxxxxxxxxx`
4. Save

User receives an SMS confirmation.

[SCREENSHOT-N3: SMS subscription creation]

---

## **3.3 Webhook / HTTPS Subscription (Optional)**

Useful for:

* Slack integrations
* Custom alerting systems
* PagerDuty Events API

### **Steps:**

1. Open Topic → **Create Subscription**
2. Protocol: **HTTPS**
3. Enter webhook URL
4. Click **Create**

[SCREENSHOT-N4: HTTPS subscription creation]

---

# **4. Confirm Subscription (Mandatory)**

A subscription remains in **PENDING** until confirmed.

### **Steps to confirm:**

* Email: Click on confirmation link
* SMS: Reply "YES" (varies by region)
* HTTPS: The endpoint must respond to the verification request

[SCREENSHOT-N5: Pending vs Confirmed subscriptions]

---

# **5. Connect Alarms to Notification Topic**

Once a Topic and Subscription exist, alarms must publish to it.

### **Steps:**

1. Go to **Monitoring → Alarms**
2. Click an alarm
3. Go to **Destinations** section
4. Click **Edit**
5. Choose:

   * **Notification Topic:** `bharatmart-alert-topic`
6. Click **Save**

[SCREENSHOT-N6: Alarm destination configuration]

### **Example alarms attached to this topic:**

```
backend_high_cpu
backend_high_memory
frontend_high_cpu
lb_high_response_time
network_high_ingress
instance_pool_low_size
```

---

# **6. Test Notification Delivery**

Testing is critical before going to production.

## **6.1 Test from Alarms (Manual Trigger)**

1. Open an alarm → **Actions → Test Alarm**
2. Choose **Send Test Message**

You should receive a message immediately.

[SCREENSHOT-N7: Test alarm message window]

---

## **6.2 Trigger a Real Alarm (CPU Example)**

SSH into a compute instance and run:

### **Linux CPU Load Generator:**

```bash
sudo dnf install stress -y
stress --cpu 4 --timeout 120
```

The CPU Alarm should fire within 1–2 minutes.

---

# **7. Verify Notification Delivery**

### **In Console:**

1. Go to **Notifications → Subscriptions**
2. Click your subscription
3. Check **Recent Messages**

[SCREENSHOT-N8: Recent messages list in subscription]

### **In Email Inbox:**

Look for subject:

```
[Alarm] backend-high-cpu is in FIRING state
```

---

# **8. Best Practices for Notifications**

### **8.1 Use Multiple Channels**

* Email for general alerts
* SMS for critical incidents
* Webhooks for Slack / PagerDuty
* Avoid single-point-of-failure alerting systems

### **8.2 Use Severity Separation**

Create two topics:

* `alerts-critical`
* `alerts-warning`

### **8.3 Limit Noise (SRE Golden Rule)**

* Excessive alerts cause alert fatigue
* Use reasonable thresholds, aggregation windows

### **8.4 Enable Message Retention**

Notifications can store message history—enable maximum retention for audit use.

---

# **9. Troubleshooting ONS**

### **9.1 Email Not Received**

* Check spam folder
* Reconfirm subscription
* Ensure sender domain not blocked

### **9.2 Alarm Does Not Trigger Notification**

* Check alarm query
* Verify metric is emitting data
* Check alarm compartment
* Check notification topic permissions

### **9.3 HTTPS Subscription Fails**

* Endpoint must respond with **HTTP 200** to confirmation challenge
* Certificate must be valid

---

# **10. Summary**

In this guide you have configured:

* Notification Topics
* Email, SMS, and HTTPS subscriptions
* Alarm → Topic routing
* Test and real alarm-triggered notifications
* Best practices for SRE alerting

Notifications are now fully integrated with your monitoring system.

**Next Document:** End-to-End Verification Runbook (SRE Playbook)
