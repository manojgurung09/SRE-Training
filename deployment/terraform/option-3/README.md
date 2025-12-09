# 🚀 **BharatMart OCI Deployment – Terraform (Frontend + Backend Architecture)**

This Terraform stack deploys a **multi-tier OCI environment** for BharatMart using:

* VCN with public & private subnets
* Internet Gateway + NAT Gateway
* Frontend VM(s) (public)
* Backend VM(s) (private by default)
* **Single OCI Public Load Balancer** with:

  * Port **80** → Frontend VM(s)
  * Port **3000** → Backend API VM(s)

This is ideal for **DEV, QA, or small production workloads**.

---

# 📁 **File Structure**

```
deployment/terraform/
├── variables.tf               # Input variables for deployment
├── main.tf                    # Network + Compute + LB resources
├── outputs.tf                 # LB IP, VM IPs, OCIDs
├── terraform.tfvars           # User-defined values (your environment)
├── terraform.tfvars.example   # Example configuration
└── README.md                  # This file
```

---

# ✅ **1. Prerequisites**

### ✔ A. OCI CLI Installed

```bash
oci --version
```

### ✔ B. Correctly Authenticated

```bash
oci iam region list
```

### ✔ C. Fetch Required Values From OCI CLI

---

## 📌 **Get Tenancy OCID**

```bash
grep tenancy ~/.oci/config | awk -F '=' '{print $2}' | tr -d ' '
```

---

## 📌 **Get Compartment OCID**

```bash
oci iam compartment list --all \
  --query "data[].{Name:name,ID:id}" \
  --output table
```

Pick your compartment → copy the OCID.

---

## 📌 **Get Latest Oracle Linux ARM Image OCID**

```bash
oci compute image list \
  --compartment-id <COMPARTMENT_OCID> \
  --shape "VM.Standard.A1.Flex" \
  --operating-system "Oracle Linux" \
  --operating-system-version "8" \
  --query "data[0].id" \
  --raw-output
```

---

## 📌 **Get Available Shapes**

```bash
oci compute shape list \
  --compartment-id <COMPARTMENT_OCID> \
  --all | jq -r '.[].shape'
```

---

## 📌 **Ensure You Have a Public SSH Key**

```bash
cat ~/.ssh/id_rsa.pub
```

---

# 🎛 **2. Configure terraform.tfvars**

First copy the example file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Then update these values:

* `compartment_id`
* `tenancy_ocid`
* `image_id`
* `ssh_public_key`
* Optional:

  * `frontend_instance_count`
  * `compute_instance_count`
  * `enable_backend_public_ip`
  * FLEX-shape CPU/RAM overrides

---

# 🔧 **2.1 Auto-update terraform.tfvars using sed**

## ⭐ Replace Compartment ID

```bash
sed -i "s|compartment_id = .*|compartment_id = \"${COMPARTMENT_ID}\"|g" terraform.tfvars
```

## ⭐ Replace Tenancy OCID

```bash
TENANCY_OCID=$(grep tenancy ~/.oci/config | awk -F '=' '{print $2}' | tr -d ' ')
sed -i "s|tenancy_ocid = .*|tenancy_ocid = \"${TENANCY_OCID}\"|g" terraform.tfvars
```

## ⭐ Replace Image ID

```bash
IMAGE_ID=$(oci compute image list \
  --compartment-id $COMPARTMENT_ID \
  --shape "VM.Standard.A1.Flex" \
  --operating-system "Oracle Linux" \
  --operating-system-version "8" \
  --query "data[0].id" \
  --raw-output)

sed -i "s|image_id = .*|image_id = \"${IMAGE_ID}\"|g" terraform.tfvars
```

## ⭐ Replace SSH Key

```bash
SSH_KEY=$(cat ~/.ssh/id_rsa.pub)
sed -i "s|ssh_public_key = .*|ssh_public_key = \"${SSH_KEY}\"|g" terraform.tfvars
```

---

# ▶ **3. Deploy Infrastructure**

### **Initialize Terraform**

```bash
terraform init
```

### **Validate Syntax**

```bash
terraform validate
```

### **Preview Changes**

```bash
terraform plan
```

### **Apply Infrastructure**

```bash
terraform apply
```

Confirm:

```
yes
```

Provisioning time: **4–10 minutes**

---

# 🌐 **4. What This Project Creates**

## **Networking**

✔ VCN (10.0.0.0/16)
✔ Public subnet (frontend + LB)
✔ Private subnet (backend)
✔ Internet Gateway
✔ NAT Gateway
✔ Public Route Table
✔ Private Route Table
✔ Security Lists (public & private)

---

## **Compute**

### 🔵 Frontend VM(s)

* Public IP auto-assigned
* NGINX auto-installed via cloud-init
* Serves HTML/JS frontend

### 🟢 Backend VM(s)

* Private IP only (unless override enabled)
* Node.js auto-installed
* API listens on port 3000

---

## **Load Balancer (Public, Single LB)**

✔ Listener :80 → Frontend VM(s)
✔ Listener :3000 → Backend API VM(s)

This keeps architecture simple & cost-effective.

---

# 📤 **5. Terraform Outputs**

View after apply:

```bash
terraform output
```

You will typically see:

```
load_balancer_public_ip = "129.xxx.xxx.xxx"
frontend_public_ips     = ["132.xxx.xxx.xxx"]
frontend_private_ips    = ["10.0.1.10"]
backend_private_ips     = ["10.0.2.15"]
backend_instance_ids    = [...]
```

---

# 🔐 **6. SSH Access**

### SSH to Frontend VM (Public)

```bash
ssh -i ~/.ssh/id_rsa opc@<frontend_public_ip>
```

### SSH to Backend VM (Private Only)

Use one of:

* Bastion host (recommended)
* VPN
* Enable `enable_backend_public_ip = true`

---

# 🧪 **7. Validate Deployment**

## ✔ Frontend UI

Open browser:

```
http://<load_balancer_public_ip>
```

## ✔ Backend Health Check

```
curl http://<load_balancer_public_ip>:3000/api/health
```

---

# 💰 **8. Cost Optimization**

* A1 Flex shapes → lowest cost
* LB bandwidth = 10 Mbps → minimal billing
* NAT only when required
* Single LB keeps price down

---

# 📈 **9. Future Enhancements**

* Add **backend-only private LB** (separate project)
* Add SSL certificates + HTTPS
* Connect Autonomous DB
* Use OCI DevOps pipelines
* Add WAF & path-based routing

**Note:** For instance pools and auto-scaling, see `option-3` deployment option.

---

# 🛑 **10. Cleanup**

```bash
terraform destroy
```

Confirm:

```
yes
```

---

# 🖼 Updated Architecture Diagram (Single Public LB)

```
                     +---------------------------------------+
                     |     Oracle Cloud Infrastructure        |
                     +---------------------------------------+
                                      |
                                      |
                     +----------------------------------+
                     |     Virtual Cloud Network        |
                     |        10.0.0.0/16               |
                     +----------------------------------+
                          |                     |
                          |                     |
      ---------------------------------------------------------------
      |                                                             |
+--------------------------+                           +--------------------------+
|     Public Subnet        |                           |     Private Subnet       |
|       10.0.1.0/24        |                           |       10.0.2.0/24        |
|                          |                           |                          |
|  +--------------------+  |                           |  +--------------------+  |
|  | Public Load        |  |                           |  | Backend VM(s)      |  |
|  | Balancer (80,3000) |  |-------------------------->|  | Node.js API        |  |
|  +---------+----------+  |       HTTP (3000)         |  | Private IP only    |  |
|            |             |                           |  +--------------------+  |
|            | HTTP (80)   |                           |                          |
|            v             |                           |                          |
|  +--------------------+  |                           |                          |
|  | Frontend VM(s)     |  |                           |                          |
|  | NGINX, public IP   |  |                           |                          |
|  +--------------------+  |                           |                          |
+--------------------------+                           +--------------------------+

                     +----------------------------------+
                     |        Internet Gateway          |
                     +----------------------------------+
```

---
