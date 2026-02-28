#!/bin/bash
# ──────────────────────────────────────────────────────────
#  EventSphere — EC2 Deployment Script
#  Run this on a fresh Ubuntu 22.04+ EC2 instance
# ──────────────────────────────────────────────────────────
set -euo pipefail

echo "══════════════════════════════════════════════════"
echo "  EventSphere — EC2 Setup & Deploy"
echo "══════════════════════════════════════════════════"

# ── 1. System update ─────────────────────────────────
echo "[1/5] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────
if ! command -v docker &> /dev/null; then
    echo "[2/5] Installing Docker..."
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
    sudo usermod -aG docker $USER
    echo "  ✓ Docker installed. You may need to re-login for group changes."
else
    echo "[2/5] Docker already installed — skipping."
fi

# ── 3. Clone repo (skip if already present) ──────────
APP_DIR="$HOME/EventSphere"
if [ ! -d "$APP_DIR" ]; then
    echo "[3/5] Cloning repository..."
    read -rp "  Enter your Git repo URL: " REPO_URL
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "[3/5] Repository already exists at $APP_DIR — pulling latest..."
    cd "$APP_DIR" && git pull origin main
fi

cd "$APP_DIR"

# ── 4. Environment file ──────────────────────────────
if [ ! -f .env ]; then
    echo "[4/5] Creating .env file from .env.example..."
    cp .env.example .env
    echo "  ⚠  Edit .env with your real credentials before continuing:"
    echo "     nano $APP_DIR/.env"
    echo ""
    read -rp "  Press Enter after editing .env to continue..."
else
    echo "[4/5] .env file already exists."
fi

# ── 5. Build & Start containers ──────────────────────
echo "[5/5] Building and starting Docker containers..."
sudo docker compose down --remove-orphans 2>/dev/null || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo ""
echo "══════════════════════════════════════════════════"
echo "  ✓ Deployment complete!"
echo ""
echo "  App URL:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<your-ec2-public-ip>'):80"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # View logs"
echo "    docker compose restart          # Restart services"
echo "    docker compose down             # Stop services"
echo "    docker compose up -d --build    # Rebuild & restart"
echo "══════════════════════════════════════════════════"
