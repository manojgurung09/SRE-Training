# Example Terraform variables file
# Copy this to terraform.tfvars and fill in your values

# Required Variables
compartment_id = "ocid1.compartment.oc1..aaaaaaaavzlulwgc4twmrqqfsb5jack4i6cgq3t6yzc2rwhslppf53rrbb5q"
image_id       = "ocid1.image.oc1.ap-mumbai-1.aaaaaaaauolbgcffeswcqoyxezsv6d56gx5veqwutnlzplqqhqpdrtiv4k2a"
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCNmMux37+UVj5ENWd4t0C8sFf1ih29wpI6VxIwOPb+Izb5+PFYReeNMMzVap4jkMqqmS7JXN7Cqi3aH1rAn0jblDxn2qXQ0BVGdvjTRRAWAIPpV5ryqm8saUDhkY6gZsPFsgYDLlG0XMEaSjtxVjanZJyI/jdYSVhmpZajMMpd8obEM/Kyq8QJ8Qa8g9WW+mKLOt4lefVVp0ySHSrhGaDODCd0JB3I26V0oblfdNePnACQiOGm6gsKuBpqjsC5wbACOKwvAjay2Q5igCx9MuppVzrYVqnT5iRYFrWS0NsbtMh78AOIhwUWsvNSxwR5+7ZRLiwu4KNRL26cyxeV0JIKrxO0bJvLnBVzH0glpcGGVcK3/3CFx3Ce6YBUOUi4AS4AJ7v2kaE6eiYruQS0BhbXD8NdgIpSurhBQ2dsQ0aizAw5IJv8ipkBq7S9Z2h3oRYMvKMroy7uRe7k2T8hx0EKwjminwXIsF5rSzCMioQB/vfFGkcxGR7np/8P/FX5zynz5EVWYCbEUllvCBbWc+AM7/poEZDxNClOySl5d+NSmTOQ9EY4zm8Zin4qscut+/AzICr7OrTVI3TAHo2+DFVf0DpFsotm/AWNpmXro1xaLUFKUYIGUO2IWmF74YE4rDnjBanYBTeWxnc+W+36JtKLFSYbwMq5n5t1ijLI96SMPQ== u02@ubuntu2"

# Optional Variables (with defaults)
region                        = "ap-mumbai-1"
availability_domain           = "AD-1"
project_name                  = "bharatmart"
environment                   = "dev"
vcn_cidr                      = "10.0.0.0/16"
public_subnet_cidr            = "10.0.1.0/24"
compute_instance_shape        = "VM.Standard.A1.Flex"
compute_instance_ocpus        = 2
compute_instance_memory_in_gb = 12

# Optional Tags
tags = {
  "Project"     = "BharatMart"
  "ManagedBy"   = "Terraform"
  "Environment" = "dev"
  "Team"        = "SRE"
}
