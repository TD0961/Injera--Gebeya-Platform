# 🚀 Fly.io Deployment Guide for eGebeya

## ✨ Why Fly.io for Your Portfolio?

✅ **Always On** - Free tier doesn't sleep (perfect for portfolios!)  
✅ **Global Edge Network** - Fast worldwide access  
✅ **Excellent Docker Support** - Your Dockerfiles work perfectly  
✅ **Professional URLs** - `yourapp.fly.dev`  
✅ **Simple Deployment** - ~15 minutes total  
✅ **Free Tier** - Generous limits for portfolio projects  

---

## 📋 Prerequisites

1. **Fly.io Account** (free): https://fly.io/app/sign-up
2. **Fly CLI** installed
3. **GitHub repo** pushed

---

## 🛠️ Step 1: Install Fly CLI

```bash
# Linux/Mac
curl -L https://fly.io/install.sh | sh

# Or with Homebrew
brew install flyctl

# Verify installation
fly version
```

---

## 🗄️ Step 2: Create PostgreSQL Database

Fly.io has managed PostgreSQL (recommended for production):

```bash
# Create managed PostgreSQL database
fly postgres create --name egebeya-db --region ams --vm-size shared-cpu-1x --volume-size 3

# Note the connection string - you'll need it!
# It will be something like: postgres://postgres:password@hostname.flycast:5432/egebeya
```

**OR** Use Fly Postgres addon:
```bash
fly postgres create --name egebeya-db --region ams
```

**Copy the connection details** - you'll need them for the backend!

---

## 🔧 Step 3: Deploy Backend

### 3.1 Initialize Fly App

```bash
cd Server
fly launch --no-deploy
```

**When prompted:**
- App name: `egebeya-api` (cleaner, more professional)
- Region: Choose closest (e.g., `ams` for Amsterdam, `iad` for US)
- PostgreSQL: **Skip** (we'll connect manually)

### 3.2 Configure Backend

Edit `Server/fly.toml` that was created:

```toml
app = "egebeya-api"
primary_region = "ams"

[build]
  dockerfile = "Dockerfile"
  context = "."

[env]
  PORT = "8080"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false  # Keep it always on
  auto_start_machines = true
  min_machines_running = 1  # Always keep 1 machine running

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"
```

### 3.3 Set Environment Variables

```bash
# Database connection (use the connection string from Step 2)
fly secrets set DB_HOST=<hostname>.flycast
fly secrets set DB_USER=postgres
fly secrets set DB_PASSWORD=<your_password>
fly secrets set DB_NAME=egebeya
fly secrets set DB_PORT=5432

# JWT Secret (generate a secure one)
fly secrets set JWT_SECRET=$(openssl rand -hex 32)

# URLs (update after deploying frontend)
fly secrets set FRONTEND_URL=https://egebeya.fly.dev
fly secrets set BACKEND_URL=https://egebeya-api.fly.dev

# Payment keys
fly secrets set CHAPA_SECRET_KEY=<your_chapa_key>
fly secrets set STRIPE_SECRET_KEY=<your_stripe_key>
fly secrets set STRIPE_WEBHOOK_SECRET=<your_webhook_secret>

# Email configuration
fly secrets set SMTP_HOST=smtp.gmail.com
fly secrets set SMTP_PORT=587
fly secrets set SMTP_USERNAME=<your_email>
fly secrets set SMTP_PASSWORD=<your_app_password>
fly secrets set FROM_EMAIL=<your_email>
```

### 3.4 Update Backend Dockerfile (if needed)

Make sure `Server/Dockerfile` exposes port 3000 and the app listens on `0.0.0.0:3000`.

### 3.5 Deploy Backend

```bash
cd Server
fly deploy
```

**Get your backend URL**: `https://egebeya-api.fly.dev`

---

## 🎨 Step 4: Deploy Frontend

### 4.1 Initialize Fly App

```bash
cd Client
fly launch --no-deploy
```

**When prompted:**
- App name: `egebeya` (clean, professional - your main portfolio URL!)
- Region: Same as backend
- PostgreSQL: **Skip**

### 4.2 Configure Frontend

Edit `Client/fly.toml`:

```toml
app = "egebeya"
primary_region = "ams"

[build]
  dockerfile = "Dockerfile"
  context = "."

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = false  # Keep it always on
  auto_start_machines = true
  min_machines_running = 1

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/"
```

### 4.3 Update Frontend Nginx Config

Edit `Client/nginx.conf` - make sure it proxies `/api/*` to your backend:

```nginx
upstream backend {
    server egebeya-api.flycast:8080;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Important**: Use `.flycast` domain for internal communication between Fly apps!

### 4.4 Deploy Frontend

```bash
cd Client
fly deploy
```

**Get your frontend URL**: `https://egebeya.fly.dev` ✨ **Your main portfolio URL!**

---

## 🔗 Step 5: Connect Services

### 5.1 Create Fly Network

Fly apps on the same org automatically share a private network via `.flycast`.

### 5.2 Update Backend to Use .flycast Domain

If your database is on Fly, use `.flycast` for connection:
```bash
fly secrets set DB_HOST=egebeya-db.flycast
```

### 5.3 Update Frontend Backend URL

Make sure frontend's Nginx proxies to: `http://egebeya-api.flycast:8080`

---

## ✅ Step 6: Verify Deployment

1. **Check backend health**:
   ```bash
   curl https://egebeya-api.fly.dev/health
   ```

2. **Check frontend**:
   Visit: `https://egebeya.fly.dev` ✨

3. **View logs**:
   ```bash
   fly logs -a egebeya-api
   fly logs -a egebeya
   ```

---

## 🎯 Quick Commands Reference

```bash
# View apps
fly apps list

# View status
fly status -a egebeya-api
fly status -a egebeya

# View logs
fly logs -a egebeya-api
fly logs -a egebeya

# SSH into machine
fly ssh console -a egebeya-api

# Scale (if needed)
fly scale count 1 -a egebeya-api

# View secrets
fly secrets list -a egebeya-api

# Restart
fly apps restart egebeya-api
fly apps restart egebeya
```

---

## 💰 Fly.io Free Tier Limits

- **3 shared-cpu-1x VMs** (per org)
- **160GB outbound data transfer**
- **3GB persistent volumes** (for database)
- **Always-on** - No sleeping!

**For portfolio**: This is MORE than enough! ✅

---

## 🌐 Your Final URLs

- **Frontend** (Main Portfolio): `https://egebeya.fly.dev` ✨
- **Backend API**: `https://egebeya-api.fly.dev`
- **Health Check**: `https://egebeya-api.fly.dev/health`

---

## 🔧 Troubleshooting

### Backend can't connect to database
- Check database is running: `fly status -a egebeya-db`
- Verify connection string: `fly secrets list -a egebeya-api`
- Use `.flycast` domain for internal connections

### Frontend can't reach backend
- Check Nginx config uses `.flycast` domain
- Verify backend is running: `fly status -a egebeya-api`
- Check backend health: `fly logs -a egebeya-api`

### Service sleeping
- Set `auto_stop_machines = false` in `fly.toml`
- Set `min_machines_running = 1`

---

## 🚀 Next Steps

1. **Custom Domain** (Optional):
   ```bash
   fly certs add yourdomain.com -a egebeya
   ```

2. **Monitoring** (Optional):
   - Fly.io dashboard shows metrics
   - Set up alerts if needed

3. **Update README**:
   Add your live URLs to showcase your work!

---

**You're all set!** 🎉 Your portfolio project is now live globally on Fly.io!

