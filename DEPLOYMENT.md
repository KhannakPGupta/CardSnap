# CardSnap Deployment Guide

This guide describes how to deploy the CardSnap application: the FastAPI backend on **Railway** (using Docker with persistent volume storage) and the React frontend on **Vercel**.

---

## Part 1: Deploy Backend on Railway

Railway is chosen for the backend because it supports **Persistent Volumes**, allowing the app to store scanned business card images and Excel backups permanently.

### Step 1: Create a Railway Project
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your `CardSnap` repository.

### Step 2: Configure Service Settings
1. Click on the newly created backend service in Railway and go to **Settings**.
2. Under **General**, set the **Root Directory** to `backend`.
   * *Railway will automatically detect the optimized `backend/Dockerfile` and run the build.*

### Step 3: Add Variables
Go to the **Variables** tab and click **New Variable** to add the following values:
* `PORT` = `8000`
* `GOOGLE_SHEET_ID` = `1bEuQ8IBtzguoes8EV50NLfWuiDIbeKCr7kPRQWFDZ3c`
* `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `cardsnap-sync@cardsnap326.iam.gserviceaccount.com`
* `GOOGLE_PRIVATE_KEY` = *Paste the entire private key block from your `credentials.json` (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` tags).*

### Step 4: Add Persistent Storage Volume
1. Go to the **Volume** tab of your service.
2. Click **Add Volume**.
3. Set the **Mount Path** to `/app/data`.
   * *This ensures that local Excel backup sheets and original card images are preserved across restarts and deployments.*

### Step 5: Expose the Public URL
1. Go to **Settings** $\rightarrow$ **Networking**.
2. Click **Generate Domain**.
3. Copy the generated public URL (e.g., `https://cardsnap-backend.up.railway.app`).

---

## Part 2: Deploy Frontend on Vercel

Vercel hosts the React static application.

### Step 1: Create a Vercel Project
1. Log in to [Vercel.com](https://vercel.com/).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import your `CardSnap` repository.

### Step 2: Configure Build Settings
1. Set the **Framework Preset** to `Vite`.
2. Set the **Root Directory** to `frontend`.

### Step 3: Add Environment Variables
Open the **Environment Variables** section and add:
* **Key**: `VITE_API_BASE_URL`
* **Value**: *Paste the public Railway backend URL from Part 1* (e.g., `https://cardsnap-backend.up.railway.app` without a trailing `/`).

### Step 4: Click Deploy
1. Click **Deploy**.
2. Once complete, Vercel will give you a public URL (e.g., `https://cardsnap.vercel.app`).
3. Share this URL with your father!

---

## Verifying Setup
1. Open the Vercel URL.
2. Look at the top right header: it should display **"Google Sheet Connected"** (or show the sync count).
3. Try scanning a card. Confirm that the card appears in the UI and is instantly written as a row in your father's Google Sheet!
