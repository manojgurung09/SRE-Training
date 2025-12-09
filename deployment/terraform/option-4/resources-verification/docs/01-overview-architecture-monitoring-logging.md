# **Document 01 — Overview & Architecture of Monitoring & Logging in OCI**

## **1. Introduction**

This document provides a high-level architecture and conceptual overview of the Observability & Monitoring components used in an OCI deployment. It is designed for DevOps, SRE, and Cloud Engineers who require a clear understanding of how logs, metrics, alarms, notifications, and telemetry work together in Oracle Cloud Infrastructure.

The explanations assume the reference deployment of a multi-tier architecture with:

* Public Load Balancer
* Frontend Compute (NGINX)
* Backend Instance Pool (Node.js)
* Complete logging and monitoring stack (created via Terraform in the sample environment)

This document does **not** depend on Terraform and focuses strictly on conceptual and architectural understanding.

---

## **2. Core Observability Components in OCI**

OCI Observability is built from multiple tightly integrated services. Below is an overview of the main components.

### **2.1 OCI Logging**

OCI Logging provides centralized log ingestion, storage, query, and routing.

Key log types:

* **Service Logs** — e.g., Load Balancer Access/Error logs, VCN Flow Logs
* **Custom Logs** — logs from applications or system services using Cloud Agent
* **Audit Logs** — automatic OCI administrative logs

Logs are stored in **Log Groups**, which act as logical containers.

---

### **2.2 OCI Monitoring**

OCI Monitoring collects and stores metrics from Compute, LB, Autonomous services, and custom metric sources.

Two major metric categories:

* **Native Metrics** — CPU, Memory, Disk, System health, Network
* **Custom Metrics** — user-defined (Prometheus format supported)

Metrics can be:

* Graphed in Metrics Explorer
* Used to trigger alarms

---

### **2.3 OCI Alarms**

Alarms evaluate metrics on a schedule and change state based on thresholds.

Alarm states:

* **OK**
* **FIRING**
* **INSUFFICIENT DATA**

Actions include:

* Sending notifications (ONS)
* Auto-scaling decisions (for instance pools)

---

### **2.4 OCI Notifications (ONS)**

Notification Service delivers messages to end users via:

* Email
* SMS
* PagerDuty
* Slack (via HTTPS endpoints)
* Custom webhooks

ONS Topics receive events from alarms.
Subscriptions define where the messages go.

---

### **2.5 Cloud Agent & Unified Agent**

Each compute instance runs an OCI Cloud Agent responsible for:

* System-level metrics
* Log ingestion
* Monitoring plugins
* Custom log scraping

Unified Agent plugins allow structured collection of:

* Application logs (JSON/text)
* System logs
* NGINX logs

---

### **2.6 VCN Flow Logs**

Network telemetry capturing:

* Source/Destination IP
* Ports
* Allow/Deny results
* Bytes and packets transferred

Useful for:

* Troubleshooting
* Security forensics
* Traffic analysis

Flow logs are written to Logging service.

---

### **2.7 Load Balancer Logs**

Two log types:

* **Access Logs** — client → backend traffic
* **Error Logs** — LB internal events

These logs enable:

* Performance debugging
* Backend behavior visibility
* HTTP-level troubleshooting

---

## **3. Observability Architecture Overview**

Below is a complete ASCII diagram representing the monitoring & logging flow in the deployed environment.

```
                          +-----------------------------------------+
                          |       Oracle Cloud Infrastructure        |
                          +-----------------------------------------+
                                      |               |
                                      | Metrics       | Logs
                                      v               v
                           +----------------+   +----------------+
                           | OCI Monitoring |   | OCI Logging    |
                           |  (Metrics DB)  |   |  (Log Groups)  |
                           +--------+-------+   +--------+-------+
                                    ^                    ^
                                    |                    |
           --------------------------------------------------------------
           |                                                            |
   +--------------------+                                     +---------------------+
   | Load Balancer      |  ------ Access/Error Logs ------>   |  Log Group          |
   | (Ports 80,3000)    |                                     |  (All logs stored)  |
   +--------------------+                                     +---------------------+
             ^  
             | HTTP Traffic
             v
   +--------------------+                                     +---------------------+
   | Frontend Compute   | -- NGINX Logs via Cloud Agent --->  |  Custom Logs        |
   | (Public VM)        |                                     |  (Unified Agent)    |
   +--------------------+                                     +---------------------+
             ^  
             | API Calls
             v
   +--------------------------+                              +---------------------+
   | Backend Instance Pool    | -- App Logs + Custom Metrics ->| Monitoring Service |
   | (Node.js, Private Subnet)|                               | (Native + Custom)   |
   +--------------------------+                              +---------------------+
             |                                              
             | CPU/Memory Metrics
             | Network Metrics
             v
   +--------------------------+
   | Auto-Scaling Policies    |  <------- Alarm Signals ------+
   +--------------------------+
```

---

## **4. What Terraform Would Normally Configure**

Although this guide focuses on manual configuration, it is important to understand what Terraform typically handles.

### **4.1 Logging (Terraform-created in your environment)**

Terraform automatically created logs such as:

* Log Group
* VCN Flow Logs for all subnets
* Load Balancer Access/Error logs
* Frontend NGINX access/error logs
* Backend app logs via Unified Agent

### **4.2 Monitoring (Terraform-created)**

* Custom metric ingestion setup from backend `/metrics`
* Alarms for CPU, memory, LB latency, LB request rate, instance pool size, network ingress/egress, disk usage

### **4.3 Notifications**

* Notification Topic
* Alarm → Topic wiring

These serve as a reference for the manual steps described in future documents.

---

## **5. What Will Be Configured Manually in the OCI Console**

This document series will describe how to manually configure:

### **5.1 Logging (Manual)**

* Creating Log Groups
* Enabling service logs (VCN Flow Logs, LB Logs)
* Enabling instance logs with Unified Agent

### **5.2 Monitoring (Manual)**

* Viewing metrics
* Creating custom metrics via ingestion endpoint
* Setting up alarms

### **5.3 Notifications (Manual)**

* Creating topics
* Creating subscriptions
* Connecting alarms to topics

---

## **6. High-Level Data Flow Summary**

* **Frontend/Backend logs** → Cloud Agent → Logging Service
* **VCN Flow Logs** → Logging
* **LB Access/Error Logs** → Logging
* **Native Metrics** → Monitoring
* **Custom Metrics** → Monitoring (from backend Prometheus endpoint)
* **Alarms** → Notification Topic → End-user alerts
* **Alarm triggers** may also influence autoscaling behavior
