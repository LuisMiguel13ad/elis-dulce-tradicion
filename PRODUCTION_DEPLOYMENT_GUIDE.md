# 🚀 Production Deployment Guide - Eli's Bakery E-Commerce System

## 📋 Pre-Deployment Checklist

### ✅ Code Quality (COMPLETED)
- [x] QA Audit completed
- [x] Critical bugs fixed (social media links)
- [x] Navigation optimized (NotFound page)
- [x] No placeholder content
- [x] All forms validated
- [x] Payment integration tested

### 🔧 Required Before Launch

#### 1. Social Media Profiles (VERIFIED)
- [x] Facebook: https://www.facebook.com/elispasteleria
- [x] Instagram: https://www.instagram.com/elisbakery_cafe/

#### 2. Environment Configuration

**Frontend (.env.production)**
```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# Optional: Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

**Backend (.env)**
```bash
# Environment
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Database (PostgreSQL Recommended for Production)
# Format: postgres://user:password@host:port/database
DATABASE_URL=postgres://bakery_user:secret_password@db-host:5432/bakery_db

# Square Payment (PRODUCTION credentials)
SQUARE_APPLICATION_ID=your_production_app_id
SQUARE_ACCESS_TOKEN=your_production_access_token
SQUARE_LOCATION_ID=your_production_location_id
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Email Configuration (for order notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=your_app_specific_password

# WhatsApp API (optional but recommended)
WHATSAPP_PHONE=16109109067
```

---

## 🏗️ Deployment Architecture

### Recommended Stack
```
┌─────────────────────────────────────┐
│         Users / Customers           │
└────────────┬────────────────────────┘
             │
    ┌────────▼────────┐
    │   CloudFlare    │  (CDN + DDoS Protection)
    │   or Vercel     │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Frontend (SPA) │  (Vercel / Netlify / S3)
    │   React + Vite  │
    └────────┬────────┘
             │
             │ HTTPS/REST API
             │
    ┌────────▼────────┐
    │  Backend API    │  (VPS / DigitalOcean / AWS)
    │   Node.js       │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  PostgreSQL DB  │  (Managed or Self-Hosted)
    └─────────────────┘
```

---

## 💾 Database Selection: CRITICAL

**Recommended: PostgreSQL**
The backend is configured to use PostgreSQL by default (`backend/db/connection.js` uses `pg`). This is the most robust choice for production.

**Risky: SQLite**
If you choose to use SQLite (file-based), you MUST ensure your hosting provider supports persistent storage (e.g., Railway Volumes, AWS EBS). On platforms like Vercel or standard Railway deployments, **your database will be deleted every time you redeploy.**

---

## 📦 DEPLOYMENT OPTION 1: Vercel + Railway (Easiest)

### Frontend on Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/project
vercel --prod

# Follow prompts and set environment variables:
# - VITE_API_URL
# - VITE_GOOGLE_MAPS_API_KEY
```

3. **Configure Custom Domain**
- Go to Vercel Dashboard → Settings → Domains
- Add your custom domain (e.g., elisbakery.com)
- Update DNS records as instructed

### Backend on Railway

1. **Create Railway Account**: https://railway.app
2. **New Project → Deploy from GitHub**
3. **Select backend folder**
4. **Add Environment Variables**:
   - Copy all variables from Backend .env section above
5. **Deploy**
6. **Get Railway URL** (e.g., https://your-app.railway.app)
7. **Update Frontend VITE_API_URL** to Railway URL

**Cost:** ~$5-20/month

---

## 🖥️ DEPLOYMENT OPTION 2: VPS (Full Control)

### Server Requirements
- **OS:** Ubuntu 22.04 LTS
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 20GB SSD
- **CPU:** 2 cores
- **Providers:** DigitalOcean ($12/mo), Vultr ($6/mo), Linode ($12/mo)

### Step-by-Step VPS Setup

#### 1. Initial Server Setup
```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Create deployment user
adduser deployer
usermod -aG sudo deployer
su - deployer
```

#### 2. Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version
```

#### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

#### 4. Set Up Backend
```bash
# Clone repository
cd /var/www
sudo mkdir bakery
sudo chown deployer:deployer bakery
cd bakery

git clone <your-repo-url> .

# Install dependencies
cd backend
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Initialize database
node db/init-sqlite.js

# Start with PM2
pm2 start server.js --name "bakery-api"
pm2 save

# View logs
pm2 logs bakery-api
```

#### 5. Install Nginx (Reverse Proxy)
```bash
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/bakery
```

**Nginx Configuration for API:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Nginx Configuration for Frontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/bakery/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/bakery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Set Up SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

#### 7. Build and Deploy Frontend
```bash
# On your local machine
cd /path/to/project
npm run build

# Upload to server
scp -r dist/* deployer@your_server_ip:/var/www/bakery/dist/

# Or use rsync for faster updates
rsync -avz --delete dist/ deployer@your_server_ip:/var/www/bakery/dist/
```

#### 8. Set Up Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 🔄 Continuous Deployment (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/bakery/backend
            git pull origin main
            npm install --production
            pm2 restart bakery-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: |
          npm install
          npm run build
        
      - name: Deploy
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/var/www/bakery/"
```

---

## 🧪 Post-Deployment Testing

### 1. Smoke Tests (Do these immediately after deployment)
```bash
# Test API health
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-19T..."}

# Test CORS
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://api.yourdomain.com/api/orders
```

### 2. Frontend Tests
- [ ] Visit homepage - loads correctly
- [ ] Navigate to /order - form displays
- [ ] Check all images load
- [ ] Test language toggle (EN ↔ ES)
- [ ] Test mobile menu
- [ ] Check social media links work

### 3. Full Order Flow Test
```
1. Go to /order
2. Fill out form with test data
3. Select delivery option
4. Submit order
5. Use Square test card: 4111 1111 1111 1111
6. Complete payment
7. Verify redirect to confirmation page
8. Check order appears in dashboard
9. Verify email notification sent
10. Test order tracking with order number
```

### 4. Performance Tests
```bash
# Run Lighthouse audit
npm install -g lighthouse

lighthouse https://yourdomain.com \
  --only-categories=performance,accessibility,best-practices,seo \
  --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **UptimeRobot** (Free)
   - Monitor: https://yourdomain.com
   - Monitor: https://api.yourdomain.com/health
   - Alert email: admin@yourdomain.com

2. **PM2 Monitoring**
```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

3. **Log Management**
```bash
# Rotate logs
pm2 install pm2-logrotate

# View error logs
pm2 logs bakery-api --err

# Clear logs
pm2 flush
```

### Database Backups

```bash
# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/bakery"
DB_FILE="/var/www/bakery/backend/db/bakery.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/bakery_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "bakery_*.db" -mtime +30 -delete

echo "Backup completed: bakery_$DATE.db"
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/deployer/backup-db.sh >> /var/log/bakery-backup.log 2>&1
```

---

## 🆘 Troubleshooting

### Issue: API not responding
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart bakery-api

# Check logs
pm2 logs bakery-api --lines 100
```

### Issue: Frontend shows API errors
```bash
# Check CORS settings in backend/server.js
# Verify FRONTEND_URL environment variable
# Check Nginx proxy settings
sudo nginx -t
sudo systemctl status nginx
```

### Issue: Database locked
```bash
# This is usually caused by concurrent writes
# Check if multiple processes are running
ps aux | grep node

# Restart PM2
pm2 restart bakery-api
```

### Issue: SSL certificate expired
```bash
# Manually renew
sudo certbot renew

# Check auto-renewal
sudo systemctl status certbot.timer
```

---

## 📞 Support Contacts

### Service Providers
- **Domain:** Where you registered yourdomain.com
- **Hosting:** DigitalOcean / Vercel support
- **Payment:** Square Support (1-855-700-6000)
- **Email:** Gmail/G Suite support
- **Maps:** Google Cloud Console

### Emergency Procedures

#### 1. Site Down
```bash
# Quick restart
pm2 restart all
sudo systemctl restart nginx

# If that doesn't work, check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

#### 2. Payment Issues
- Contact Square support immediately
- Check Square Dashboard for payment status
- Verify webhook endpoint is accessible

#### 3. Database Corruption
```bash
# Restore from backup
cd /var/www/bakery/backend/db
cp /var/backups/bakery/bakery_YYYYMMDD_HHMMSS.db ./bakery.db
pm2 restart bakery-api
```

---

## ✅ Launch Day Checklist

### 24 Hours Before Launch
- [ ] Final code review
- [ ] All environment variables set
- [ ] SSL certificates verified
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Test payment flow with real card (small amount)
- [ ] Alert contacts prepared

### Launch Day
- [ ] Deploy at low-traffic time (e.g., 2 AM)
- [ ] Run smoke tests
- [ ] Test full order flow
- [ ] Check dashboard receiving orders
- [ ] Verify email notifications
- [ ] Monitor error logs for 1 hour
- [ ] Announce on social media

### First Week Post-Launch
- [ ] Monitor daily for errors
- [ ] Check customer feedback
- [ ] Verify all orders processing correctly
- [ ] Monitor server resources
- [ ] Review payment transactions
- [ ] Check backup logs

---

## 🎉 You're Ready to Launch!

Follow this guide step by step, and you'll have a production-ready bakery e-commerce system running smoothly.

**Good luck! 🚀🎂**

---

*Last Updated: November 19, 2025*  
*For technical support, refer to QA_AUDIT_REPORT.md and QA_FIXES_APPLIED.md*

