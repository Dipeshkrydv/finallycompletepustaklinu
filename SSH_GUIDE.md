# Fix Deployment via SSH

Since you have the SSH details, this is the **fastest** way to fix the website. You will need to run these commands in your **Terminal**.

## Step 1: Log in

1.  Open your **Terminal** (on your computer).
2.  Copy and paste this command:
    ```bash
    ssh -p 65002 u443145865@46.202.139.33
    ```
3.  Press **Enter**.
4.  It will ask for a **Password**.
    *   *Note: You will NOT see the characters while typing. This is normal.*
    *   Type the password you set for your Hostinger account (or the SSH password if you changed it). press Enter.

## Step 2: Go to your website folder

Once logged in (you will see a prompt like `[u443145865@server... ~]$`), copy and paste these commands one by one:

1.  **Find your folder:**
    ```bash
    cd domains/peachpuff-antelope-325258.hostingersite.com/public_html
    ```
    *If that fails, try just:* `cd public_html`

2.  **Install tools:**
    ```bash
    npm install
    ```

3.  **Build the website (The fix):**
    ```bash
    npm run build
    ```
    *Wait for it to show "Compiled successfully".*

## Step 3: Restart

1.  Go back to your **Hostinger Dashboard**.
2.  Go to **Node.js** settings.
3.  Click **Restart** (or Disable and Enable).

Your website should now work!
