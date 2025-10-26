# ASPMS Backend Deployment Guide - Render.com

## Overview

This guide will help you deploy your ASPMS backend API to Render.com (FREE tier) and connect it with your Firebase Hosting frontend.

**Time Required:** 15-20 minutes
**Cost:** $0 (Free tier)

---

## Prerequisites

- ✅ Firebase Hosting already deployed (https://aspms-pro.web.app)
- ✅ GitHub/GitLab account with your code pushed
- ✅ Firebase Service Account JSON
- ✅ Render.com account (free - create at https://render.com)

---

## Part 1: Prepare Your Repository

### Step 1: Push Your Code to GitHub/GitLab

If you haven't already, push your code to a Git repository:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add Render deployment configuration"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/aspms.git

# Push to main branch
git push -u origin main
```

---

## Part 2: Deploy Backend to Render

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub/GitLab (recommended for easy deployment)

### Step 3: Create New Web Service

1. **In Render Dashboard:**
   - Click "New +" button (top right)
   - Select "Web Service"

2. **Connect Repository:**
   - Connect your GitHub/GitLab account if not already
   - Select your ASPMS repository
   - Click "Connect"

3. **Configure Service:**

   **Basic Settings:**
   - **Name:** `aspms-backend` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave blank (or `.` if needed)
   - **Runtime:** `Node`

   **Build & Deploy:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

   **Instance Type:**
   - Select **Free** tier

4. **Click "Advanced"** to set environment variables

### Step 4: Set Environment Variables

Click "Add Environment Variable" for each of these:

#### Required Variables:

**1. NODE_ENV**
```
NODE_ENV=production
```

**2. SESSION_SECRET**
```
SESSION_SECRET=your-super-secret-random-string-change-this-to-something-secure
```
*Generate a secure random string (at least 32 characters)*

**3. FIREBASE_SERVICE_ACCOUNT**
```json
{"type":"service_account","project_id":"aspms-pro","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@aspms-pro.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"xxx"}
```

**How to get Firebase Service Account:**
1. Go to Firebase Console: https://console.firebase.google.com/project/aspms-pro/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Download the JSON file
4. **IMPORTANT:** Minify it to a single line (remove all line breaks and spaces)
   - Use an online JSON minifier: https://codebeautify.org/jsonminifier
   - Or use: `cat service-account.json | tr -d '\n'`
5. Copy the entire minified JSON and paste as the value

**4. ALLOWED_ORIGINS**
```
ALLOWED_ORIGINS=https://aspms-pro.web.app,https://aspms-pro.firebaseapp.com
```
*After deployment, add your Render backend URL too (see Step 5)*

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes for first deploy)
3. Watch the logs for any errors

### Step 6: Get Your Backend URL

Once deployed, Render will provide a URL like:
```
https://aspms-backend.onrender.com
```

**Important:** Copy this URL - you'll need it!

### Step 7: Update ALLOWED_ORIGINS

1. In Render Dashboard, go to your service
2. Click "Environment" tab
3. Edit **ALLOWED_ORIGINS** to include your Render URL:
```
ALLOWED_ORIGINS=https://aspms-pro.web.app,https://aspms-pro.firebaseapp.com,https://aspms-backend.onrender.com
```
4. Click "Save Changes" (this will trigger a redeploy)

---

## Part 3: Update Frontend to Use Render Backend

### Step 8: Create .env File for Frontend Build

Create a file `.env.production` in your project root:

```bash
# Backend API URL (Your Render backend)
VITE_API_URL=https://aspms-backend.onrender.com

# Firebase Client Config (Your existing values)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=aspms-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aspms-pro
VITE_FIREBASE_STORAGE_BUCKET=aspms-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Get Firebase config:**
- Firebase Console > Project Settings > Your apps > SDK setup and configuration

### Step 9: Rebuild and Redeploy Frontend

```bash
# Rebuild with production environment
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## Part 4: Verify Deployment

### Step 10: Test Your Application

1. **Open Your App:**
   ```
   https://aspms-pro.web.app
   ```

2. **Test Login:**
   - Try logging in with your existing credentials
   - Check browser console for errors

3. **Test New Features:**
   - Navigate to `/timesheet-management`
   - Navigate to `/billing-invoicing`
   - Navigate to `/expense-tracking`
   - Try creating entries

4. **Check Backend Health:**
   ```
   https://aspms-backend.onrender.com/api/user
   ```
   Should return JSON (not HTML!)

---

## Troubleshooting

### Issue: "CORS blocked" errors

**Solution:** Ensure ALLOWED_ORIGINS includes your Firebase URL:
```
ALLOWED_ORIGINS=https://aspms-pro.web.app,https://aspms-pro.firebaseapp.com
```

### Issue: "Unexpected token '<'" error (getting HTML instead of JSON)

**Causes:**
1. Frontend is not using Render backend URL
2. VITE_API_URL not set correctly in build

**Solution:**
- Verify `.env.production` file exists with correct VITE_API_URL
- Rebuild frontend: `npm run build`
- Redeploy: `firebase deploy --only hosting`

### Issue: Backend deployment fails

**Check Render logs:**
1. Go to Render Dashboard
2. Click your service
3. Check "Logs" tab for error messages

**Common issues:**
- Missing environment variables
- Invalid Firebase Service Account JSON (must be minified)
- Build command errors

### Issue: "Session failed" or authentication issues

**Solution:**
- Verify SESSION_SECRET is set
- Check that cookies are being sent (credentials: 'include')
- Ensure Firebase Service Account has correct permissions

### Issue: Render service is slow or sleeping

**Note:** Free tier Render services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Upgrade to paid tier ($7/month) for always-on service

---

## Performance Notes

### Free Tier Limitations:

- **Cold Starts:** Service sleeps after 15 min inactivity
- **RAM:** 512 MB
- **CPU:** Shared
- **Bandwidth:** 100 GB/month
- **Build Time:** Up to 15 minutes

### To Improve Performance:

1. **Upgrade to Starter ($7/month):**
   - Always on (no cold starts)
   - 512 MB RAM
   - Better CPU allocation

2. **Add Health Check Ping:**
   - Use a service like UptimeRobot to ping your backend every 5 minutes
   - Keeps the free tier service awake during business hours

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Client Browser                                 │
│  (https://aspms-pro.web.app)                    │
│                                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS Requests
                  │
        ┌─────────▼──────────┐
        │                    │
        │  Firebase Hosting  │
        │  (Static Files)    │
        │                    │
        └────────────────────┘
                  │
                  │ API Calls (/api/*)
                  │
        ┌─────────▼──────────┐
        │                    │
        │  Render.com        │
        │  (Express Backend) │
        │                    │
        └─────────┬──────────┘
                  │
                  │ Firestore Queries
                  │
        ┌─────────▼──────────┐
        │                    │
        │  Firebase          │
        │  (Firestore DB)    │
        │                    │
        └────────────────────┘
```

---

## Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Firebase Hosting | Free (Spark) | $0 |
| Firebase Firestore | Free (Spark) | $0 |
| Render Backend | Free | $0 |
| **Total** | | **$0/month** |

**Upgrade Path (when needed):**
- Render Starter: $7/month (no cold starts)
- Firebase Blaze: Pay-as-you-go (only pay for usage)

---

## Next Steps

After successful deployment:

1. ✅ Test all new modules (timesheets, invoicing, expenses)
2. ✅ Verify Firestore indexes are "Enabled" in Firebase Console
3. ✅ Set up monitoring (optional):
   - Render: Built-in metrics
   - Firebase: Performance monitoring
4. ✅ Consider upgrading Render if cold starts are an issue

---

## Support & Documentation

- **Render Docs:** https://render.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Express CORS:** https://expressjs.com/en/resources/middleware/cors.html

---

## Deployment Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Render account created
- [ ] Web service created in Render
- [ ] Environment variables set (NODE_ENV, SESSION_SECRET, FIREBASE_SERVICE_ACCOUNT, ALLOWED_ORIGINS)
- [ ] Backend deployed successfully
- [ ] Backend URL noted
- [ ] ALLOWED_ORIGINS updated with all URLs
- [ ] .env.production created with VITE_API_URL
- [ ] Frontend rebuilt with production env
- [ ] Frontend redeployed to Firebase
- [ ] Login tested and working
- [ ] New modules accessible and functional
- [ ] Firestore indexes showing "Enabled"

---

**🎉 Your ASPMS is now fully deployed!**

Frontend: https://aspms-pro.web.app
Backend: https://aspms-backend.onrender.com (your URL)
