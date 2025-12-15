# Hostinger Cloud Deployment Guide

This guide details how to deploy your Next.js application to Hostinger Cloud Hosting.

## Prerequisites

1.  **Hostinger Account** with Cloud Hosting plan.
2.  **Domain Name** connected to your hosting.

## Step 1: Prepare Database (MySQL)

1.  Log in to **Hostinger hPanel**.
2.  Go to **Databases** > **Management**.
3.  Create a **New MySQL Database**:
    -   **Database Name**: e.g., `pustaklinu_prod`
    -   **MySQL Username**: e.g., `admin`
    -   **Password**: *Create a strong password and save it.*
4.  Note down the **Database Name**, **Username**, **Password**, and **Host** (usually `localhost`, but check the dashboard).

## Step 2: Upload Files

You can upload files using **File Manager** (easier for small updates) or **FTP** (better for large uploads like `node_modules` if needed, though we usually install them on server).

### Option A: Uploading Build (Recommended)

1.  On your local machine, compress the following files/folders into a `release.zip`:
    -   `.next` (folder)
    -   `public` (folder)
    -   `scripts` (folder)
    -   `src` (folder - optional if source maps needed, but `public` and `.next` are key)
    -   `package.json`
    -   `next.config.js`
    -   `server.js`
    -   `tailwind.config.js`
    -   `postcss.config.js`
    -   `deploy.md` (this file, for reference)
    -   *Do NOT upload `node_modules`.*

2.  Go to **File Manager** in Hostinger.
3.  Navigate to `domains/yourdomain.com/public_html`.
4.  Delete `default.php` if it exists.
5.  Upload `release.zip` and **Extract** it.

## Step 3: Install Dependencies

1.  In **hPanel**, search for **Node.js** (under Advanced).
2.  It might ask you to create a Node.js application.
    -   **Node.js Version**: Choose **18** or **20** (Recommended).
    -   **Application Mode**: **Production**.
    -   **Application Root**: `public_html/` (or wherever you extracted files).
    -   **Application Startup File**: `server.js`
3.  Click **Create**.
4.  Click **NPM Install** button. This will install dependencies from `package.json`.

## Step 4: Configure Environment Variables

1.  In the Node.js settings page, look for **Environment variables**.
2.  Add the following variables:

    | Key | Value |
    | :--- | :--- |
    | `NODE_ENV` | `production` |
    | `NEXTAUTH_URL` | `https://yourdomain.com` |
    | `NEXTAUTH_SECRET` | *Generage a long random string* |
    | `DB_DIALECT` | `mysql` |
    | `DB_HOST` | `localhost` (or from Step 1) |
    | `DB_USER` | *From Step 1* |
    | `DB_PASSWORD` | *From Step 1* |
    | `DB_NAME` | *From Step 1* |

3.  Save the variables.

## Step 5: Start the Server

1.  After installing dependencies and setting variables, click **Restart** or **Enable** (switch to 'Enabled' status if 'Disabled').
2.  Wait a moment, then visit your website.

## Troubleshooting

-   **500 Error**: Check **Node.js** logs (often viewable in hPanel or `error_log` in File Manager).
-   **Database Error**: Double-check `DB_HOST`, `DB_USER`, and `DB_PASSWORD`.
-   **Missing Modules**: Run **NPM Install** again.
