# ============================================================================
# Deployment Commands for Option-1 (Single VM - Backend + Frontend)
# ============================================================================
# Run these commands manually one at a time after Terraform has created resources
# Note: Terraform user_data already installs Node.js, Git, clones repo, and runs npm install
# ============================================================================

# STEP 1: Get the output details from Terraform outputs

# STEP 2: Connect to the VM via SSH
# Replace YOUR_PUBLIC_IP with the IP from step 1, and YOUR_KEY with your SSH key path
ssh -i ~/.ssh/YOUR_KEY opc@YOUR_VM_PUBLIC_IP

# STEP 3: Once connected to the VM, run the following commands one at a time:
# ============================================================================

# Navigate to project directory
cd ~/oci-multi-tier-web-app-ecommerce

# Edit .env file to update FRONTEND_URL and VITE_API_URL with your VM's public IP
# Get your public IP first:
curl -s ifconfig.me

# Then edit .env and update:
# FRONTEND_URL=http://YOUR_LB_PUBLIC_IP
# VITE_API_URL=http://YOUR_LB_PUBLIC_IP:3000
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

# In a new terminal/SSH session, start frontend server (runs on port 80)
# Navigate to project directory again
cd ~/oci-multi-tier-web-app-ecommerce
sudo npm run dev -- --host 0.0.0.0 --port 80
