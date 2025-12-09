# Run these commands manually one at a time after Terraform has created resources
# Note: Terraform user_data already installs Node.js, Git, clones repo, and runs npm install
# ============================================================================

# STEP 1: Get IPs from Terraform outputs (run in your local terminal)
# ============================================================================
# Get Load Balancer Public IP (this is the frontend IP users will access)
# Get Frontend VM Public IP (for SSH connection)
# Get Backend VM Private IP (backend is in private subnet)

# Save these values:
# LB_PUBLIC_IP=<load_balancer_public_ip>
# FRONTEND_VM_IP=<frontend_public_ip>
# BACKEND_VM_IP=<backend_private_ip>

# STEP 2: Copy SSH keys to Frontend VM (run from your local laptop)
# ============================================================================
# Replace YOUR_KEY_PATH with your SSH private key path (e.g., ~/.ssh/id_rsa)
# Replace FRONTEND_VM_IP with the IP from step 1
scp -i ~/.ssh/YOUR_KEY ~/.ssh/YOUR_KEY opc@FRONTEND_VM_IP:~/.ssh/
scp -i ~/.ssh/YOUR_KEY ~/.ssh/YOUR_KEY.pub opc@FRONTEND_VM_IP:~/.ssh/

# Set proper permissions on the key in frontend VM (you'll do this after SSH)
# chmod 600 ~/.ssh/YOUR_KEY

# STEP 3: Connect to Frontend VM (run from your local laptop)
# ============================================================================
ssh -i ~/.ssh/YOUR_KEY opc@FRONTEND_VM_IP

# STEP 4: Deploy Backend on Backend VM
# ============================================================================
# From Frontend VM, SSH into Backend VM (backend has no public IP)
# Replace BACKEND_VM_IP with the private IP from step 1
ssh -i ~/.ssh/YOUR_KEY opc@BACKEND_VM_IP

# Once connected to Backend VM, run the following commands:

# Navigate to project directory
cd ~/oci-multi-tier-web-app-ecommerce

# Copy both-same-app.env to .env


# Edit .env file to update with Load Balancer public IP
# FRONTEND_URL should be: http://LB_PUBLIC_IP (from step 1)
# CORS_ORIGIN should be: http://LB_PUBLIC_IP (from step 1)
nano .env

# Configure firewall and networking
sudo systemctl stop firewalld
sudo systemctl disable firewalld
sudo systemctl stop nftables
sudo systemctl disable nftables

# Enable IP forwarding
sudo sysctl net.ipv4.ip_forward
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
sudo sysctl net.ipv4.ip_forward

# Start backend server (runs on port 3000)
npm run dev:server

# To run in background:
# nohup npm run dev:server &

# STEP 5: Deploy Frontend on Frontend VM
# ============================================================================
# Exit from Backend VM (type: exit)
# You should now be back on Frontend VM

# Navigate to project directory
cd ~/oci-multi-tier-web-app-ecommerce

# Copy both-same-app.env to .env

# Edit .env file to update with Load Balancer public IP
# VITE_API_URL should be: http://LB_PUBLIC_IP:3000/api (from step 1)
nano .env

# Configure firewall and networking
sudo systemctl stop firewalld
sudo systemctl disable firewalld

# Start frontend server (runs on port 80)
sudo npm run dev -- --host 0.0.0.0 --port 80

# To run in background:
# nohup sudo npm run dev -- --host 0.0.0.0 --port 80 &

# ============================================================================
# Access URLs (use Load Balancer Public IP from step 1):
# ============================================================================
# Frontend: http://LB_PUBLIC_IP
# Backend API: http://LB_PUBLIC_IP:3000/api
# Backend Health Check: http://LB_PUBLIC_IP:3000/api/health
