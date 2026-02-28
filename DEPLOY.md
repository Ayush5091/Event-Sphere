# EventSphere — EC2 Docker Deployment Guide

## Prerequisites

| Requirement | Details |
|---|---|
| **EC2 Instance** | Ubuntu 22.04+, `t2.medium` or higher (2 vCPU / 4 GB RAM minimum for building Next.js) |
| **Security Group** | Inbound rules: **SSH (22)**, **HTTP (80)**, **HTTPS (443)** |
| **Key Pair** | `.pem` key file for SSH access |
| **Supabase Project** | URL + anon key + service role key |
| **AWS S3 Bucket** | For event image uploads |

---

## 1. Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose **Ubuntu Server 22.04 LTS (HVM)** AMI
3. Instance type: **t2.medium** (or `t3.medium` for better networking)
4. Configure storage: **20 GB+ gp3**
5. Security Group — add inbound rules:
   - SSH (22) — your IP
   - HTTP (80) — `0.0.0.0/0`
   - HTTPS (443) — `0.0.0.0/0` (if adding SSL later)
6. Launch with your key pair

---

## 2. Connect to Your Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 3. Quick Deploy (Automated)

The repo includes a `deploy.sh` script that handles everything:

```bash
# Clone the repo first
git clone <YOUR_REPO_URL> ~/EventSphere
cd ~/EventSphere

# Make the script executable and run it
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Install Docker & Docker Compose
- Prompt you to configure `.env`
- Build and start all containers

---

## 4. Manual Deploy (Step-by-Step)

### 4a. Install Docker

```bash
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

### 4b. Clone & Configure

```bash
git clone <YOUR_REPO_URL> ~/EventSphere
cd ~/EventSphere

# Create your .env from the example
cp .env.example .env
nano .env   # Fill in your real credentials
```

### 4c. Build & Run

```bash
docker compose build --no-cache
docker compose up -d
```

Your app is now live at `http://<EC2_PUBLIC_IP>`

---

## 5. Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=your-bucket
```

---

## 6. Architecture

```
Internet → :80 [Nginx Container] → :3000 [Next.js Container]
```

- **Nginx** acts as a reverse proxy on port 80
- **Next.js** runs in standalone mode on port 3000 (internal)
- Both containers auto-restart on failure

---

## 7. Common Operations

```bash
# View real-time logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f nextjs-app

# Restart everything
docker compose restart

# Stop all containers
docker compose down

# Rebuild after code changes
git pull origin main
docker compose up -d --build

# Clean up unused images (recover disk space)
docker system prune -af
```

---

## 8. Updating the App

```bash
cd ~/EventSphere
git pull origin main
docker compose up -d --build
```

---

## 9. (Optional) Add SSL with Certbot

To serve over HTTPS, install Certbot and get a free Let's Encrypt certificate:

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
```

Then update `nginx.conf` to listen on 443 with the certificate, and add port 443 to `docker-compose.yml`.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails with OOM | Use `t2.large` or add swap: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| Container keeps restarting | Check logs: `docker compose logs nextjs-app` |
| Can't reach port 80 | Verify EC2 Security Group allows inbound HTTP |
| `.env` not applied | Rebuild: `docker compose up -d --build` |
