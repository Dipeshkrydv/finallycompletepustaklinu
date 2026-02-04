# Deployment Guide

This project is built with Next.js and uses Sequelize as an ORM. It supports both SQLite (default for development) and MySQL (recommended for production).

## Environment Variables

To successfully deploy this application on platforms like Vercel or Netlify, you must configure the following environment variables.

### Database (MySQL)

These are **required** for production deployment:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | The hostname of your MySQL database. |
| `DB_USER` | The username for your MySQL database. |
| `DB_PASSWORD` | The password for your MySQL database. |
| `DB_NAME` | The name of your MySQL database. |
| `DB_PORT` | The port for your MySQL database (default: 3306). |
| `DB_DIALECT` | Set to `mysql`. |

### Authentication (NextAuth.js)

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | The full URL of your application (e.g., `https://your-app.vercel.app`). |
| `NEXTAUTH_SECRET` | A random secret string used to hash tokens. |

### Email (Nodemailer)

Used for OTP and notifications:

| Variable | Description |
|----------|-------------|
| `EMAIL_HOST` | SMTP server host. |
| `EMAIL_PORT` | SMTP server port. |
| `EMAIL_USER` | SMTP username. |
| `EMAIL_PASS` | SMTP password. |
| `EMAIL_FROM` | The "from" email address. |

## Build-Time Note

The code has been refactored to prevent build-time failures if database variables are missing. However, the application will throw a runtime error if these variables are not provided in a production environment when an API route that requires the database is accessed.

## Deployment Steps

1. **GitHub**: Push your code to your repository.
2. **Platform**: Connect your repository to Vercel or Netlify.
3. **Environment Variables**: Add the variables listed above in the platform's dashboard.
4. **Deploy**: Trigger a new deployment.
