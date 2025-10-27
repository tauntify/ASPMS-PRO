# ASPMS Render Deployment Setup Guide

## 🚀 Complete Setup Instructions for Render.com

This guide will help you properly configure your ASPMS backend on Render.com.

---

## Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aspms-pro**
3. Click the ⚙️ (Settings) icon → **Project Settings**
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (keep it safe, DO NOT commit to Git!)

The downloaded file will look like this:
```json
{
  "type": "service_account",
  "project_id": "aspms-pro",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aspms-pro.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## Step 2: Configure Render Environment Variables

Go to your Render dashboard: https://dashboard.render.com/

Find your service: **aspms-pro-backend**

Navigate to: **Environment** section

Add the following environment variables:

### Required Environment Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NODE_ENV` | `production` | Already set by render.yaml |
| `PORT` | `5000` | Already set by render.yaml |
| `SESSION_SECRET` | *Auto-generated* | Already set by render.yaml |
| `FIREBASE_PROJECT_ID` | `aspms-pro` | From Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Copy from JSON file | The `private_key_id` field |
| `FIREBASE_PRIVATE_KEY` | Copy from JSON file | **IMPORTANT: See instructions below** |
| `FIREBASE_CLIENT_EMAIL` | Copy from JSON file | The `client_email` field |
| `FIREBASE_CLIENT_ID` | Copy from JSON file | The `client_id` field |
| `FIREBASE_CLIENT_CERT_URL` | Copy from JSON file | The `client_x509_cert_url` field |

### ⚠️ CRITICAL: How to Add FIREBASE_PRIVATE_KEY

The `private_key` field contains newline characters `\n` that must be preserved:

**Option 1: Direct Copy (Recommended)**
1. Open the service account JSON file in a text editor
2. Find the `private_key` field
3. Copy the ENTIRE value including quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
4. Paste it into Render (Render will handle the escape characters correctly)

**Option 2: Manual Entry**
- Make sure it looks like this:
  ```
  -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----\n
  ```
- The `\n` characters should be literal backslash-n, not actual newlines

---

## Step 3: Verify Environment Variables

After adding all variables, your Render environment should have:

✅ NODE_ENV = production
✅ PORT = 5000
✅ SESSION_SECRET = (auto-generated)
✅ FIREBASE_PROJECT_ID = aspms-pro
✅ FIREBASE_PRIVATE_KEY_ID = (your key id)
✅ FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...
✅ FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@aspms-pro.iam.gserviceaccount.com
✅ FIREBASE_CLIENT_ID = (your client id)
✅ FIREBASE_CLIENT_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/...

---

## Step 4: Deploy Changes

1. **Commit and push your code changes:**
   ```bash
   git add .
   git commit -m "Fix Render deployment configuration"
   git push origin main
   ```

2. Render will automatically deploy when you push to main branch

3. **Monitor the deployment:**
   - Go to your Render dashboard
   - Click on your service: **aspms-pro-backend**
   - View the **Logs** tab to see deployment progress

---

## Step 5: Test Your Deployment

### Test the Health Check:
```bash
curl https://aspms-pro-backend.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-..."}
```

### Test the Frontend Login:
1. Go to: https://aspms-pro.web.app
2. Try logging in with Google
3. Check browser console for any errors

---

## 🔧 Troubleshooting

### Problem: "Failed to authenticate with server"

**Solution:**
1. Check Render logs for Firebase errors
2. Verify all Firebase env vars are set correctly
3. Make sure `FIREBASE_PRIVATE_KEY` has the correct newline characters

### Problem: "CORS blocked"

**Solution:**
The CORS is already configured in `server/index.ts` to allow:
- `https://aspms-pro.web.app`
- `https://aspms-pro.firebaseapp.com`

If you have a custom domain, you need to add it to the `allowedOrigins` array in `server/index.ts`.

### Problem: "Session not persisting"

**Solution:**
Session cookies are configured for production with:
- `secure: true` (HTTPS only)
- `sameSite: "none"` (cross-origin cookies)
- Stored in Firestore

Make sure:
1. Firebase credentials are correct
2. Firestore is enabled in your Firebase project
3. Frontend is making requests with `credentials: 'include'`

### Problem: Health check failing

**Solution:**
The health check endpoint is: `/api/health`

Check Render dashboard → Service → Settings → Health Check Path = `/api/health`

---

## 📋 Quick Reference: Service Account Fields

| Render Env Var | Firebase JSON Field |
|---------------|---------------------|
| FIREBASE_PROJECT_ID | `project_id` |
| FIREBASE_PRIVATE_KEY_ID | `private_key_id` |
| FIREBASE_PRIVATE_KEY | `private_key` |
| FIREBASE_CLIENT_EMAIL | `client_email` |
| FIREBASE_CLIENT_ID | `client_id` |
| FIREBASE_CLIENT_CERT_URL | `client_x509_cert_url` |

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test Google Sign-In
2. ✅ Test regular username/password login
3. ✅ Verify session persistence
4. ✅ Check all API endpoints are working
5. ✅ Monitor Render logs for any errors

---

## 🆘 Still Having Issues?

1. **Check Render Logs:**
   - Dashboard → Your Service → Logs tab
   - Look for Firebase connection errors

2. **Check Browser Console:**
   - F12 → Console tab
   - Look for CORS or network errors

3. **Verify Firebase Project:**
   - Make sure you're using the correct Firebase project: `aspms-pro`
   - Ensure Firestore is enabled
   - Check Firebase Authentication is enabled (Google Sign-In provider)

---

**Last Updated:** 2025-01-27
**ASPMS Version:** 1.0.0
