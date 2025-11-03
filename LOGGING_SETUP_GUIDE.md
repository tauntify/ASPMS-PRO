# Firebase Crashlytics + Google Cloud Logging Setup Guide

## ✅ What's Been Implemented

### 1. Client-Side Error Tracking
- **File:** `client/src/lib/error-tracking.ts`
- **Features:**
  - Firebase Analytics integration (asynchronous initialization)
  - Global error handlers for unhandled errors and promise rejections
  - Structured error logging (console + Analytics)
  - User ID tracking
  - Page view tracking
  - Custom event logging
  - Graceful fallback when Analytics unavailable

**Note:** Firebase Analytics initializes asynchronously. You may see a warning during initialization, which is normal. All errors are logged to console regardless of Analytics status.

### 2. Server-Side Logging
- **File:** `functions/src/server/logger.ts`
- **Features:**
  - Structured logging with severity levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
  - Request/Response logging middleware
  - Error logging middleware
  - JSON-formatted logs for Google Cloud Logging
  - Automatic log export to Cloud Logging

### 3. Integration
- ✅ Error tracking integrated into `App.tsx`
- ✅ Request logging integrated into `functions/src/index.ts`
- ✅ Error middleware integrated into `functions/src/index.ts`

## 🚀 Firebase Console Configuration

### Step 1: Enable Google Analytics

1. Go to Firebase Console: https://console.firebase.google.com/project/aspms-pro-v1
2. Click on **Analytics** in left sidebar
3. If not enabled, click **Enable Google Analytics**
4. Select or create a Google Analytics property
5. Click **Enable Analytics**

### Step 2: Enable Crashlytics (Optional for Web)

**Note:** Crashlytics is primarily for mobile apps. For web, we use Firebase Analytics + Cloud Logging which is already set up.

For mobile apps (if you add them later):
1. Go to **Quality** → **Crashlytics**
2. Click **Enable Crashlytics**
3. Follow the SDK integration steps

### Step 3: View Logs in Google Cloud Console

1. Go to: https://console.cloud.google.com/logs/query?project=aspms-pro-v1
2. You'll see all structured logs from your Cloud Functions
3. Use filters:
   ```
   resource.type="cloud_function"
   resource.labels.function_name="api"
   ```

### Step 4: Set Up Log-Based Alerts (Recommended)

1. In Cloud Logging, click **Create alert**
2. Set conditions:
   - **Log filter:**
     ```
     severity="ERROR"
     OR severity="CRITICAL"
     ```
   - **Alert trigger:** Any time log matches
3. Set notification channel (email, SMS, Slack, etc.)
4. Save alert

## 📊 How to Use

### Client-Side Error Tracking

```typescript
import { logError, logWarning, logInfo } from "@/lib/error-tracking";

// Log errors
try {
  // ... code
} catch (error) {
  logError(error, { context: "user_action", action: "create_project" });
}

// Log warnings
logWarning("API rate limit approaching", { usage: 95 });

// Log custom events
logInfo("feature_used", { feature: "export_pdf", user_id: userId });
```

### Server-Side Logging

```typescript
import { logger, Logger } from "./logger";

// Use default logger
logger.info("User logged in", { userId: "123", role: "principle" });
logger.error("Database query failed", error, { query: "get_projects" });

// Create context-specific logger
const authLogger = new Logger("authentication");
authLogger.warn("Multiple login attempts", { userId, attempts: 5 });
```

## 🔍 Viewing Logs

### 1. Firebase Console (Analytics)

- Go to: https://console.firebase.google.com/project/aspms-pro-v1/analytics
- View:
  - Events
  - User engagement
  - Errors
  - Custom events

### 2. Google Cloud Logging

- Go to: https://console.cloud.google.com/logs?project=aspms-pro-v1
- **View all logs:**
  ```
  resource.type="cloud_function"
  ```

- **View errors only:**
  ```
  severity="ERROR"
  resource.type="cloud_function"
  ```

- **View specific endpoint:**
  ```
  jsonPayload.path="/api/auth/login"
  ```

- **View by user:**
  ```
  jsonPayload.user_id="arka_admin_001"
  ```

### 3. Error Grouping

Cloud Logging automatically groups similar errors. Click on any error to see:
- Stack trace
- Context data
- Frequency
- Affected users

## 🎯 Log Levels

### Client-Side
- **Error:** Caught exceptions, API failures
- **Warning:** Deprecated features, approaching limits
- **Info:** User actions, page views, feature usage

### Server-Side
- **CRITICAL:** System failures, data corruption
- **ERROR:** Request failures, exceptions
- **WARNING:** Validation errors, deprecated API usage
- **INFO:** Successful requests, state changes
- **DEBUG:** Detailed execution info (use sparingly in production)

## 📈 Monitoring Dashboard

### Recommended Metrics to Track

1. **Error Rate**
   - Target: < 1% of requests
   - Alert: > 5%

2. **Response Time**
   - Target: < 1000ms p95
   - Alert: > 3000ms p95

3. **User Errors**
   - Track errors per user
   - Alert: Same user > 10 errors/hour

4. **Endpoint Health**
   - Track success/failure per endpoint
   - Alert: Any endpoint > 10% error rate

## 🔐 Privacy & Compliance

### What's Logged

✅ **Safe to log:**
- User IDs (not PII)
- Request paths
- Response status codes
- Error messages
- Timestamps

❌ **Never log:**
- Passwords
- JWT tokens (full)
- Credit card numbers
- Personal emails (in error context)
- Session IDs

### Data Retention

- **Google Cloud Logging:** 30 days by default (configurable)
- **Firebase Analytics:** 14 months
- **Crashlytics:** 90 days

## 🚨 Common Errors to Monitor

### High Priority
1. `AUTH_FAILED` - Authentication failures
2. `DB_QUERY_FAILED` - Database connection issues
3. `PAYMENT_FAILED` - Payment processing errors
4. `FILE_UPLOAD_FAILED` - Storage issues

### Medium Priority
1. `VALIDATION_ERROR` - Invalid user input
2. `RATE_LIMIT_EXCEEDED` - API abuse
3. `DEPRECATED_API` - Old API usage

### Low Priority
1. `404_NOT_FOUND` - Invalid routes (expected for bots)
2. `SLOW_QUERY` - Performance monitoring

## 📱 Mobile Apps (Future)

When you add mobile apps:
1. Install Firebase Crashlytics SDK
2. Configure crash reporting
3. Add breadcrumbs for debugging
4. Test crash reporting with test crash

## 🎉 Benefits

✅ **Real-time error tracking**
✅ **User impact analysis**
✅ **Performance monitoring**
✅ **Proactive alerting**
✅ **Debugging with context**
✅ **Compliance-friendly logging**

## 🔄 Next Steps

1. **Deploy the changes** (already done if you deploy)
2. **Test error logging:**
   ```javascript
   // In browser console
   throw new Error("Test error");
   ```
3. **Check logs** in Cloud Console
4. **Set up alerts** for critical errors
5. **Monitor dashboard** daily for first week

---

**Last Updated:** November 3, 2025
**Status:** ✅ Ready to Deploy
