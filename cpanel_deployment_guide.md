# Complete cPanel Deployment Guide for Blogs Project

This guide explains how to deploy the **Laravel Backend** (API) and **Next.js Frontend** to your live cPanel server using the new domain `demo.webcreationcanada.com`.

## Subdomain & Directory Structure
For security and correct routing, we will set up the project as follows:
- **Main Domain (Frontend)**: `demo.webcreationcanada.com/blog` (Node.js Application)
- **Backend API Subdomain**: `api.demo.webcreationcanada.com` (Document Root: `/public_html/api/public`)
- **Next.js Source Files**: `/home/username/blog-frontend` (Kept outside `public_html` for security)

---

## Part 1: Deploying the Laravel Backend (`api.demo.webcreationcanada.com`)

Since `api.demo.webcreationcanada.com` is configured with the document root `/public_html/api/public`, the backend folder structure on cPanel will look like this:
```
/public_html/
└── api/                <-- Laravel Root folder
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── public/         <-- Document root for api.demo.webcreationcanada.com (contains index.php)
    │   ├── index.php
    │   └── storage/
    └── .env
```

### Step 1.1: Create Subdomain in cPanel
1. Log in to cPanel, search for **Subdomains** (or **Domains** in newer cPanel versions).
2. Create `api.demo.webcreationcanada.com`.
3. Set the **Document Root** exactly to:
   ```text
   public_html/api/public
   ```

### Step 1.2: Prepare and Upload Files
1. On your local machine, zip the **`backend`** folder. Make sure to **exclude** `vendor` and `.env` (to keep the zip file size small).
2. Go to **cPanel File Manager**, navigate to `/public_html`, and upload the zip file.
3. Extract the zip file in `/public_html`, and rename the extracted folder to **`api`**.

### Step 1.3: Database Setup
1. In cPanel, search for **MySQL® Database Wizard**.
2. Create a new database (e.g., `webcreation_blogdb`).
3. Create a new database user and set a strong password.
4. Add the user to the database, ensuring you check **ALL PRIVILEGES**.

### Step 1.4: Configure environment variables
1. In cPanel File Manager, go to `/public_html/api/` and edit the `.env` file (if it doesn't exist, copy `.env.example` to `.env`).
2. Set the following environment variables:
   ```env
   APP_NAME="Blogs Admin"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.demo.webcreationcanada.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=webcreation_blogdb   # Replace with your cPanel database name
   DB_USERNAME=webcreation_bloguser # Replace with your cPanel database username
   DB_PASSWORD=your_password        # Replace with your database password
   ```

### Step 1.5: Run Production Commands via cPanel Terminal
1. Open the **Terminal** tool in cPanel (or connect via SSH).
2. Navigate to your backend directory:
   ```bash
   cd public_html/api
   ```
3. Install production PHP dependencies:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
4. Generate the application key (if not set):
   ```bash
   php artisan key:generate
   ```
5. Run migrations and seed database:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```
6. Create the public storage symlink so uploaded images are visible:
   ```bash
   php artisan storage:link
   ```

---

## Part 2: Deploying the Next.js Frontend (`demo.webcreationcanada.com/blog`)

We will configure Next.js to run as a Node.js application in cPanel and handle URLs under the `/blog` subfolder.

### Step 2.1: Configure Environment Variables for Build
Next.js injects variables prefixed with `NEXT_PUBLIC_` into the browser bundle at **build time**.
1. In your local `frontend` directory, create or edit your `.env.production` file:
   ```env
   NEXT_PUBLIC_API_URL=https://api.demo.webcreationcanada.com
   NEXT_PUBLIC_BASE_PATH=/blog
   ```

### Step 2.2: Build Locally (Recommended Production-Level Setup)
Shared hosting environments like cPanel often have strict RAM limits (e.g. 1GB). Running `npm run build` directly on the server can crash the server or fail. Instead, build locally:
1. Run the production build command on your local machine:
   ```bash
   npm run build
   ```
   This generates the optimized build inside `.next/` and the standalone production bundle inside `.next/standalone`.

2. Prepare the deployment folder by copying public and static assets into the standalone directory:
   - Copy the **`public`** directory to **`.next/standalone/public`**
   - Copy the **`.next/static`** directory to **`.next/standalone/.next/static`**

3. Compress the **contents** of the **`.next/standalone`** directory (including `server.js`, `package.json`, `public/`, and the nested `.next/`) into a zip file named `standalone.zip`.

### Step 2.3: Upload and Extract to cPanel
1. In cPanel File Manager, navigate to your home directory (`/home/username/`) and create a folder named `blog-frontend`.
2. Upload the `standalone.zip` file into `/home/username/blog-frontend` and extract it.
3. The directory structure inside `/home/username/blog-frontend` should look like this:
   ```text
   /home/username/blog-frontend/
   ├── .next/
   ├── public/
   ├── node_modules/
   ├── package.json
   └── server.js      <-- Next.js production server entry point
   ```

### Step 2.4: Set Up Node.js App in cPanel
1. In cPanel, search for **Setup Node.js App**.
2. Click **Create Application**.
3. Fill out the application settings:
   - **Node.js version**: Choose `18.x` or `20.x`.
   - **Application mode**: `Production`
   - **Application root**: `blog-frontend`
   - **Application URL**: Select `demo.webcreationcanada.com` and type `blog` in the path input box.
   - **Application startup file**: `server.js` (Phusion Passenger will run the production-ready `server.js` generated by Next.js)
4. Under **Environment variables**, click **Add Variable** to configure the runtime settings:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://api.demo.webcreationcanada.com`
   - **Name**: `NEXT_PUBLIC_BASE_PATH`
   - **Value**: `/blog`
5. Click **Create** at the top right, then click **Restart** to boot the application.

---

## Part 3: Verification

Once both deployments are completed:
- **Admin Backend / API**: Visit `https://api.demo.webcreationcanada.com/api/blogs` to verify the backend is running.
- **Frontend Blog**: Visit **`https://demo.webcreationcanada.com/blog`** to view your live Next.js blog!
