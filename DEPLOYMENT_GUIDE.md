# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Pustaklinu application to your production server at `46.202.139.33:65002`.

## Prerequisites
- Node.js 18+ installed on the server
- MySQL database configured and accessible
- PM2 or similar process manager for production (optional but recommended)
- Git installed on the server

## Deployment Steps

### 1. Clone and Setup Repository
```bash
# SSH into your production server
ssh user@46.202.139.33

# Navigate to your application directory
cd /path/to/your/app

# Clone the latest code
git clone https://github.com/Dipeshkrydv/finallycompletepustaklinu.git
cd finallycompletepustaklinu

# Or if already cloned, pull latest changes
git pull origin main
```

### 2. Configure Environment Variables
```bash
# Copy the provided .env file to the root directory
cp /path/to/provided/.env .env

# Verify the .env file contains:
# - DB_HOST: Your MySQL host
# - DB_USER: MySQL username
# - DB_NAME: Database name
# - DB_PASSWORD: MySQL password
# - DB_PORT: MySQL port (default 3306)
# - NEXTAUTH_URL: https://pustaklinu.com (or your domain)
# - NEXTAUTH_SECRET: Your secret key
# - NODE_ENV: production
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Database
```bash
# Sync database schema (creates tables if they don't exist)
npm run db:reset

# Seed the admin user (creates default admin account)
node scripts/seed-admin.mjs
```

**Default Admin Credentials:**
- Email: `admin@pustaklinu.com`
- Password: `Admin@123`

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

### 5. Build the Application
```bash
npm run build
```

### 6. Start the Application

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "pustaklinu" -- start

# Save PM2 configuration to restart on reboot
pm2 startup
pm2 save

# Monitor the application
pm2 logs pustaklinu
```

#### Option B: Using npm directly
```bash
npm start
```

The application will start on the default port (3000) or the port specified in your environment.

### 7. Configure Reverse Proxy (Nginx/Apache)

If you want to run the app on port 65002 or behind a reverse proxy:

#### Nginx Configuration Example:
```nginx
server {
    listen 65002;
    server_name 46.202.139.33;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Admin Login Issues
If you experience redirect loops or cannot access the admin panel:

1. **Verify admin user exists:**
   ```bash
   node scripts/seed-admin.mjs
   ```

2. **Check database connection:**
   - Ensure MySQL is running and accessible
   - Verify DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env

3. **Clear browser cache:**
   - Clear cookies and cache for the domain
   - Try in an incognito/private window

4. **Check logs:**
   ```bash
   pm2 logs pustaklinu
   # or
   npm run dev  # for development debugging
   ```

### Database Connection Errors
- Verify MySQL credentials in .env
- Ensure database exists: `CREATE DATABASE u443145865_Aama;`
- Check MySQL is listening on the correct port
- Verify firewall allows MySQL connections

### 500 Errors
- Check application logs for specific error messages
- Verify all environment variables are set correctly
- Ensure database is synchronized: `npm run db:reset`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL server hostname | `127.0.0.1` |
| `DB_USER` | MySQL username | `u443145865_Mata` |
| `DB_NAME` | Database name | `u443145865_Aama` |
| `DB_PASSWORD` | MySQL password | `Dipesh@20650306` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_DIALECT` | Database type | `mysql` |
| `NEXTAUTH_URL` | Application URL | `https://pustaklinu.com` |
| `NEXTAUTH_SECRET` | JWT secret | `v9y$B3zP8qR2wT5x!L7mN4kE1cH6jF0a` |
| `GMAIL_USER` | Gmail for notifications | `dipeshkryadav65@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app password | `ektl bjrr huzp ktnq` |
| `NODE_ENV` | Environment | `production` |

## Security Recommendations

1. **Change Admin Password:** Log in as admin and change the default password immediately
2. **Update NEXTAUTH_SECRET:** Generate a new secure secret key
3. **Enable HTTPS:** Use SSL/TLS certificates (Let's Encrypt recommended)
4. **Database Backups:** Set up regular automated backups
5. **Firewall Rules:** Restrict database access to application server only
6. **Environment Variables:** Store sensitive data securely, never commit to git

## Monitoring and Maintenance

### View Application Logs
```bash
pm2 logs pustaklinu
```

### Restart Application
```bash
pm2 restart pustaklinu
```

### Stop Application
```bash
pm2 stop pustaklinu
```

### Update Code
```bash
git pull origin main
npm install
npm run build
pm2 restart pustaklinu
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Contact your system administrator

---

**Last Updated:** March 2, 2026
**Version:** 1.0.0
