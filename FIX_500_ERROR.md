SSH details
IP	46.202.139.33
Port	65002
Username	u443145865
Password	
Change
SSH status
ACTIVE
SSH allows secure file transfer and remote logins over the internet


Disable
Log in to SSH
How to log in?
Use a built-in terminal on your device
Open the terminal and paste this text into the command line. You will be requested to enter your SSH password.

ssh -p 65002 u443145865@46.202.139.33 
Use SSH client
Use your preferred SSH Client and enter SSH details to log in. Follow the following articles to download the SSH client.

PuTTy
SSH keys
SSH keys are one of the most secure SSH authentication options. It is more secure than the usual SSH password authentication. Therefore, it is highly recommended to use SSH Key authentication method for connections to your servers.


Add SSH key
Basic SSH commands
Learn about basic SSH commands and how to use them

Common SSH errors
Check out the most common errors while using SSH and how to fix them

# How to Fix "500 Internal Server Error" on Hostinger

This error happens because the server has the **code** but doesn't know how to **run** it yet. You need to do 3 things in your Hostinger dashboard.

## Step 1: Install & Build (Most Important!)

Since you pushed from GitHub, the server has the source code but not the "built" application.

1.  Log in to **Hostinger** and go to your **Website**.
2.  Click on **Advanced** > **Node.js**.
    *   *If you see a button "Enter Production Mode" or similar, click it.*
3.  Look for **NPM Install** button and click it.
    *   *Wait for it to finish.*
4.  Look for **"Run NPM Scripts"**.
    *   In the text box or dropdown, type/select: `build`
    *   Click **Run**.
    *   **Wait** (this can take 3-5 minutes).
    *   *If you don't do this, Next.js cannot run.*

## Step 2: Check Startup File

1.  In the same **Node.js** settings page.
2.  Make sure **Application Startup File** says exactly: `server.js`
    *   *If it says `bin/www` or `app.js`, change it to `server.js` and Save.*

## Step 3: Verify Environment Variables

1.  Scroll to **Environment Variables**.
2.  Make sure you added these (especially the URL and Database):
    *   `NEXTAUTH_URL` = `https://peachpuff-antelope-325258.hostingersite.com` (Must match exactly)
    *   `DB_HOST` = `localhost` (Usually)
    *   `DB_USER` = (Your database username)
    *   `DB_PASSWORD` = (Your database password)
    *   `DB_NAME` = (Your database name)

## Step 4: Restart

1.  After doing all above, click **Restart** (or Disable then Enable).
2.  Wait 1 minute.
3.  Refresh your website.

---

### How to Fix "Bcrypt" Error (Important!)
If you see `Error: No native build was found... loaded from ... node_modules/bcrypt`, it means the server cannot run the `bcrypt` library.

I have already updated your code to use `bcryptjs` instead. You need to:

1.  **Push these changes to GitHub** from your computer:
    ```bash
    git add .
    git commit -m "fix: switch to bcryptjs"
    git push origin main
    ```

2.  **Pull changes on your Server** (in SSH):
    ```bash
    cd domains/peachpuff-antelope-325258.hostingersite.com/public_html
    git pull
    rm -rf node_modules
    npm install
    npm run build
    ```
