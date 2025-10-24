# 🚀 eGebeya Production Deployment Guide

## 📋 Overview
This guide explains how to deploy the eGebeya platform to production using Docker.

## 🔧 Prerequisites
- Docker and Docker Compose installed
- Domain name configured (optional)
- SSL certificate (for HTTPS)

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the environment template
cp env.prod.template env.prod

# Edit with your production values
nano env.prod
```

### 2. Configure Production Values
Edit `env.prod` with your actual production values:

```bash
# Database
DB_PASSWORD=your_secure_database_password

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_very_secure_jwt_secret_here

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Chapa (Live Keys)
CHAPA_SECRET_KEY=your_actual_chapa_key

# Email Service
SMTP_USERNAME=your_production_email@gmail.com
SMTP_PASSWORD=your_app_specific_password

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### 3. Deploy
```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## 🌐 Access Your Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

## 🔒 Security Checklist
- [ ] Changed all default passwords
- [ ] Using live API keys (not test keys)
- [ ] JWT secret is at least 32 characters
- [ ] Database password is strong
- [ ] Email credentials are production-ready
- [ ] SSL certificate configured (for HTTPS)

## 📊 Monitoring
```bash
# Check container health
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs db

# Restart services
docker compose -f docker-compose.prod.yml restart backend
```

## 🔄 Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up --build -d
```

## 🛑 Stop Services
```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: Deletes data)
docker compose -f docker-compose.prod.yml down -v
```

## 🆘 Troubleshooting
- **Port conflicts**: Change ports in docker-compose.prod.yml
- **Database issues**: Check DB_PASSWORD in env.prod
- **Email not working**: Verify SMTP credentials
- **Payment issues**: Check Stripe/Chapa keys

## 📞 Support
For issues, check the logs and ensure all environment variables are correctly set.
