# Hostinger Deployment Guide

When deploying to Hostinger (VPS or Cloud), set these Environment Variables in your panel:

## 1. Domain & Auth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET= (Generate a random string: `openssl rand -base64 32`)

## 2. Database (MySQL)
# Hostinger provides these details in the Database section
DB_HOST=127.0.0.1  (or provided host)
DB_USER=u123456_user
DB_PASSWORD=your_password
DB_NAME=u123456_db
DB_PORT=3306

## 3. App
NODE_ENV=production
