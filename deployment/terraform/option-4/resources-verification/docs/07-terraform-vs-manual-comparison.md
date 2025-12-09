# **Document 07 — Terraform vs Manual Configuration: Comparison & Recommendations**

This document compares **Terraform-based** and **Manual OCI Console-based** configuration approaches for Monitoring, Logging, Alarms, Notifications, and Autoscaling. It provides expert SRE/DevOps guidance to help teams choose the correct operational model for their environment.

---

# **1. Introduction**

Infrastructure Observability in OCI can be configured using:

* **Terraform (Infrastructure-as-Code)**
* **Manual configuration via OCI Console**

Both methods have advantages and trade-offs. This document provides:

* A detailed comparison
* Risks and operational considerations
* Recommended strategies for SRE and production workloads
* A hybrid model for enterprises

---

# **2. High-Level Comparison Table**

| Capability                  | Terraform (IaC)                  | Manual Console Configuration   |
| --------------------------- | -------------------------------- | ------------------------------ |
| **Consistency**             | ⭐⭐⭐⭐⭐ Deterministic              | ⭐⭐ Prone to human error        |
| **Scalability**             | Automates large environments     | Difficult as environment grows |
| **Version Control**         | Full Git history                 | None                           |
| **Auditability**            | Clear commit history, review PRs | Limited, depends on Audit Logs |
| **Speed**                   | Very fast repeat deployments     | Slow for complex setups        |
| **Environment Duplication** | Easy (dev, stage, prod replicas) | Very difficult / inconsistent  |
| **Drift Management**        | Detectable via plan              | Drift guaranteed over time     |
| **Rollback**                | Simple with Git revert + apply   | Manual rollback required       |
| **Skill Requirement**       | Terraform knowledge needed       | Basic OCI Console familiarity  |
| **Learning Curve**          | Medium                           | Low                            |

---

# **3. Detailed Feature Comparison**

## **3.1 Logging (VCN Flow, LB Logs, Unified Agent)**

| Aspect                 | Terraform                         | Manual                               |
| ---------------------- | --------------------------------- | ------------------------------------ |
| Creation of Log Groups | Automated and repeatable          | Manual creation required             |
| Enable VCN Flow Logs   | One line of code                  | Must configure per subnet            |
| LB Access/Error Logs   | Automated                         | Manual toggles per LB                |
| Unified Agent Config   | Can deploy consistent log configs | Manual editing creates inconsistency |

### **Recommendation:** Use **Terraform**, especially when logging is mission-critical.

---

## **3.2 Monitoring & Custom Metrics**

| Aspect               | Terraform              | Manual                              |
| -------------------- | ---------------------- | ----------------------------------- |
| Alarm Creation       | Fast, repeatable       | Time-consuming                      |
| Multi-region rollout | Easy                   | Hard                                |
| Custom Metric Setup  | Can be fully automated | Semi-manual (requires agent config) |
| Alert Rules          | Declarative code       | Recreated manually each time        |

### **Recommendation:** Use **Terraform** for all alarms and metric configurations.

---

## **3.3 Notifications (ONS Topics & Subscriptions)**

| Aspect                  | Terraform                                     | Manual                  |
| ----------------------- | --------------------------------------------- | ----------------------- |
| Topics                  | Easy to create and version                    | Simple manually         |
| Subscriptions           | Terraform works but confirmation still manual | Manual is often clearer |
| Wiring topics to alarms | Automatic                                     | Manual per alarm        |

### **Recommendation:** Create **topics in Terraform**, but allow **subscriptions manually** for users.

---

## **3.4 Autoscaling**

| Aspect                   | Terraform        | Manual                             |
| ------------------------ | ---------------- | ---------------------------------- |
| Scaling Policies         | Best done in IaC | Manual UI is error-prone           |
| Updating thresholds      | Just update code | Must edit multiple console fields  |
| Multi-environment setups | Very simple      | High chance of configuration drift |

### **Recommendation:** Autoscaling must be **Terraform-managed**.

---

# **4. Risks of Manual Configuration**

Manual configuration introduces several operational risks:

## **4.1 Configuration Drift**

Over time, dev/stage/prod environments differ subtly, causing:

* Debugging complexity
* Deployment issues
* Drifts in logging, alarms, scaling rules

## **4.2 Human Error**

Common mistakes:

* Incorrect thresholds
* Wrong log paths
* Misconfigured Unified Agent settings
* Missing compartments for alarms

## **4.3 Inconsistency Across Environments**

Manual changes rarely get duplicated properly in dev → stage → prod.

## **4.4 No Version Control**

You lose:

* Code review
* Change tracking
* Git audits

## **4.5 Difficult Rollbacks**

UI-based rollback is manual and prone to mistakes.

---

# **5. Risks of Terraform-Only Configuration**

While Terraform is ideal, there are cases where it isn’t perfect.

## **5.1 Complexity for New Users**

Terraform requires:

* State management
* Versioning
* Remote state backend

## **5.2 Manual Steps Still Needed**

Examples:

* Notification subscription confirmations (email/SMS)
* Resource Manager secret-based auth

## **5.3 Runtime Dynamic Data**

Some logs (like agent-based logs) require OS-level configuration.

---

# **6. Recommended Hybrid Strategy (Best Practice)**

A hybrid model combines the strengths of both approaches.

## **6.1 Use Terraform for:**

* Log Groups
* VCN Flow Logs
* Load Balancer Access/Error Logs
* Unified Agent configuration templates
* All Monitoring Alarms
* Autoscaling configuration
* Notification Topics

## **6.2 Allow Manual Steps for:**

* Email/SMS/Webhook Subscription confirmations
* Real-time debugging or temporary overrides

---

# **7. Recommended Architecture for Enterprise Teams**

```
+----------------------+       +-------------------------+
| Terraform Repository |       | OCI Console (Manual)    |
+----------------------+       +-------------------------+
| - Logging setup      |       | - Confirm subscriptions |
| - Monitoring setup   |       | - Temporary debugging   |
| - Alarms             |       | - Emergency overrides   |
| - Autoscaling        |       |                         |
| - Notifications      |       +-------------------------+
+----------------------+
         |
         v
   terraform apply
         |
         v
+-----------------------+
|  Fully Observed OCI   |
|     Environment       |
+-----------------------+
```

---

# **8. Infrastructure Governance Recommendations**

## **8.1 Enforce IaC as Default**

All production configuration should be defined in Terraform.

## **8.2 Use Code Reviews for Changes**

Treat observability configuration like application code.

## **8.3 Lock Down Console Permissions**

Restrict console updates to:

* Emergency break-glass actions
* Subscription confirmations

## **8.4 Implement Drift Detection**

Use:

* `terraform plan` in CI
* `config drift detection` in OCI Resource Manager

## **8.5 Documentation Alignment**

Ensure changes are reflected in:

* Architecture diagrams
* Runbooks
* On-call guides

---

# **9. Final Recommendations**

## **9.1 Use Terraform When:**

* You manage **multiple environments**
* You require **auditability & version control**
* You need **repeatability** and **standardization**
* You run **SRE-grade alerting**
* You operate critical production workloads

## **9.2 Use Manual Configuration When:**

* Experimenting or learning
* Performing short-term tests
* Doing emergency operational fixes
* Setting up one-off temporary resources

---

# **10. Summary**

This document has compared manual OCI configuration with Terraform-managed Infrastructure-as-Code and provided clear guidance for production, SRE, and enterprise environments.

**Best Practice Summary:**

* Use **Terraform** for all monitoring, logging, alarms, and autoscaling
* Use **Manual configuration** only where strictly necessary
* Adopt a **Hybrid model** for subscription confirmations & debugging
* Implement strong governance to prevent drift

Your observability environment is now ready for long-term, scalable, auditable operations.

**Optional Next Document:** Student Lab Guide (Hands-On Training)
