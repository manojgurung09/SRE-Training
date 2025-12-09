output "vcn_id" {
  description = "OCID of the created VCN"
  value       = oci_core_vcn.bharatmart_vcn.id
}

output "vcn_cidr" {
  description = "CIDR block of the VCN"
  value       = oci_core_vcn.bharatmart_vcn.cidr_blocks[0]
}

output "public_subnet_id" {
  description = "OCID of the public subnet"
  value       = oci_core_subnet.public_subnet.id
}

output "internet_gateway_id" {
  description = "OCID of the Internet Gateway"
  value       = oci_core_internet_gateway.bharatmart_igw.id
}

output "compute_instance_id" {
  description = "OCID of the all-in-one Compute instance"
  value       = oci_core_instance.bharatmart_all_in_one.id
}

output "compute_instance_public_ip" {
  description = "Public IP address of the all-in-one Compute instance"
  value       = oci_core_instance.bharatmart_all_in_one.public_ip
}

output "compute_instance_private_ip" {
  description = "Private IP address of the all-in-one Compute instance"
  value       = oci_core_instance.bharatmart_all_in_one.private_ip
}

output "application_url" {
  description = "URL to access the application directly (via public IP)"
  value       = "http://${oci_core_instance.bharatmart_all_in_one.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/your_key opc@${oci_core_instance.bharatmart_all_in_one.public_ip}"
}
