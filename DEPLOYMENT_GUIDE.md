# ASPMS New Modules - Deployment Guide

## 🚀 Quick Deployment Checklist

### ✅ Prerequisites
- [x] Node.js v18+ installed
- [x] Firebase CLI installed (`npm install -g firebase-tools`)
- [x] Firebase project configured
- [x] Environment variables set in `.env`

### 📋 Deployment Steps

#### 1. Deploy Firestore Indexes (CRITICAL - Do This First)

```bash
# Deploy the updated Firestore indexes
firebase deploy --only firestore:indexes

# Wait for indexes to build (can take 5-15 minutes)
# Check status at: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
```

**Why This is Critical:**
- The new API routes require composite indexes to query efficiently
- Without indexes, queries will fail with "index required" errors
- Indexes must be deployed BEFORE running the application

#### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify no errors in installation
npm list
```

#### 3. Build the Application

```bash
# Build both client and server
npm run build

# This will:
# - Compile TypeScript
# - Bundle client assets
# - Prepare for production
```

#### 4. Test Locally First

```bash
# Start development server
npm run dev

# Server should start on http://localhost:5000
# Test the new API endpoints
```

#### 5. Deploy to Production

```bash
# Deploy to Firebase Hosting + Functions
firebase deploy

# Or deploy specific targets:
firebase deploy --only hosting
firebase deploy --only functions
```

---

## 🧪 Testing the New Modules

### Test Timesheet Management

```bash
# 1. Create a timesheet entry
curl -X POST http://localhost:5000/api/timesheets \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "YOUR_EMPLOYEE_ID",
    "projectId": "YOUR_PROJECT_ID",
    "date": "2025-10-26",
    "hoursWorked": 8,
    "hourType": "Billable",
    "description": "Development work"
  }'

# 2. Get timesheet entries
curl http://localhost:5000/api/timesheets?employeeId=YOUR_EMPLOYEE_ID

# 3. Submit timesheet for approval
curl -X POST http://localhost:5000/api/timesheets/ENTRY_ID/submit

# 4. Approve timesheet (as Principle)
curl -X POST http://localhost:5000/api/timesheets/ENTRY_ID/approve
```

### Test Billing and Invoicing

```bash
# 1. Create an invoice
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "clientId": "YOUR_CLIENT_ID",
    "issueDate": "2025-10-26",
    "dueDate": "2025-11-26",
    "paymentTerms": "Net 30",
    "taxRate": 17,
    "overheadRate": 10,
    "gaRate": 5
  }'

# 2. Add line items to invoice
curl -X POST http://localhost:5000/api/invoices/INVOICE_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Architectural design services",
    "quantity": 160,
    "unitPrice": 5000,
    "category": "Labor"
  }'

# 3. Get invoice with line items
curl http://localhost:5000/api/invoices/INVOICE_ID
```

### Test Expense Tracking

```bash
# 1. Create an expense
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "YOUR_EMPLOYEE_ID",
    "projectId": "YOUR_PROJECT_ID",
    "category": "Fuel",
    "amount": 5000,
    "date": "2025-10-26",
    "description": "Site visit transportation"
  }'

# 2. Get expenses
curl http://localhost:5000/api/expenses?employeeId=YOUR_EMPLOYEE_ID

# 3. Approve expense (as Principle)
curl -X POST http://localhost:5000/api/expenses/EXPENSE_ID/approve

# 4. Mark as reimbursed (as Principle)
curl -X POST http://localhost:5000/api/expenses/EXPENSE_ID/reimburse
```

### Test Resource Management

```bash
# 1. Create resource allocation
curl -X POST http://localhost:5000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "resourceType": "Employee",
    "resourceId": "EMPLOYEE_ID",
    "resourceName": "John Doe",
    "allocationPercentage": 50,
    "startDate": "2025-11-01",
    "endDate": "2025-12-31"
  }'

# 2. Get employee workload
curl http://localhost:5000/api/resources/workload/EMPLOYEE_ID

# 3. Create project milestone
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Phase Complete",
    "description": "All architectural drawings finalized",
    "dueDate": "2025-12-15",
    "order": 1
  }'
```

---

## 🔍 Verifying Index Status

### Check Firestore Indexes

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Verify all indexes show status: **Enabled** (green)

Required indexes:
- ✅ timesheetEntries: employeeId + date
- ✅ timesheetEntries: projectId + date
- ✅ invoices: projectId + issueDate
- ✅ invoices: clientId + issueDate
- ✅ invoiceLineItems: invoiceId + createdAt
- ✅ expenses: employeeId + date
- ✅ expenses: projectId + date
- ✅ resourceAllocations: projectId + startDate
- ✅ projectMilestones: projectId + order
- ✅ budgetCategories: projectId + category

---

## 🐛 Troubleshooting

### Issue: "Index required" error

**Problem:** Firestore queries failing with index requirement message

**Solution:**
```bash
# Redeploy indexes
firebase deploy --only firestore:indexes

# Wait for indexes to build (check Firebase Console)
# May take 5-15 minutes depending on data volume
```

### Issue: TypeScript compilation errors

**Problem:** Build fails with TS errors

**Solution:**
```bash
# Clean build artifacts
rm -rf dist/
rm -rf node_modules/

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### Issue: Routes not found (404)

**Problem:** New API endpoints return 404

**Solution:**
1. Verify `server/routes-extensions.ts` exists
2. Check `server/index.ts` imports and registers extension routes
3. Restart the server

```typescript
// In server/index.ts, verify these lines exist:
import { registerExtensionRoutes } from "./routes-extensions";
// ...
registerExtensionRoutes(app);
```

### Issue: Authentication errors

**Problem:** All requests return 401 Unauthorized

**Solution:**
1. Ensure you're logged in and have a valid session
2. Check session configuration in `server/index.ts`
3. Verify Firebase authentication is working

### Issue: Firestore permission denied

**Problem:** Operations fail with "Permission denied"

**Solution:**
1. Check `firebase.rules` for proper security rules
2. Ensure user has required role (principle, employee, etc.)
3. Verify user session contains correct user data

---

## 📊 Monitoring and Logs

### View Application Logs

```bash
# Local development logs
npm run dev
# Watch console output

# Production logs (Firebase Functions)
firebase functions:log

# Follow logs in real-time
firebase functions:log --only api
```

### Monitor Firestore Usage

1. Go to Firebase Console
2. Navigate to **Firestore Database** → **Usage**
3. Monitor:
   - Document reads/writes
   - Storage usage
   - Index entries

### Performance Monitoring

1. Enable Firebase Performance Monitoring
2. Track API response times
3. Monitor slow queries
4. Set up alerts for errors

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Update `firebase.rules` with proper security rules for new collections
- [ ] Verify role-based access control works correctly
- [ ] Test that employees can only access their own data
- [ ] Ensure clients can only view their project data
- [ ] Validate all input with Zod schemas
- [ ] Enable HTTPS only in production
- [ ] Set secure session cookies
- [ ] Review and limit Firebase API keys
- [ ] Enable Firebase App Check for API protection

### Sample Security Rules for New Collections

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Timesheet Entries
    match /timesheetEntries/{entryId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'principle' || 
         resource.data.employeeId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.employeeId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (request.auth.token.role == 'principle' || 
         resource.data.employeeId == request.auth.uid);
    }
    
    // Invoices
    match /invoices/{invoiceId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'principle' || 
         resource.data.clientId == request.auth.uid);
      allow write: if request.auth != null && 
        request.auth.token.role == 'principle';
    }
    
    // Expenses
    match /expenses/{expenseId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'principle' || 
         resource.data.employeeId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.employeeId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (request.auth.token.role == 'principle' || 
         resource.data.employeeId == request.auth.uid);
    }
    
    // Resource Allocations
    match /resourceAllocations/{allocationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'principle';
    }
  }
}
```

---

## 📈 Performance Optimization

### Database Query Optimization

1. **Use pagination** for large datasets
2. **Limit results** with `.limit()` in queries
3. **Cache frequently accessed data** (e.g., user profiles)
4. **Use batch operations** for multiple writes

### Example: Paginated Timesheet Query

```typescript
// Add to storage-extensions.ts
export async function getTimesheetEntriesPaginated(
  employeeId: string,
  limit: number = 50,
  startAfter?: Date
) {
  let query = db.collection('timesheetEntries')
    .where('employeeId', '==', employeeId)
    .orderBy('date', 'desc')
    .limit(limit);
  
  if (startAfter) {
    query = query.startAfter(startAfter);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert timestamps...
  }));
}
```

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Test all API endpoints in production
- [ ] Verify Firestore indexes are active
- [ ] Check application logs for errors
- [ ] Test role-based access control
- [ ] Verify session persistence works
- [ ] Test mobile responsiveness
- [ ] Run security audit
- [ ] Set up monitoring and alerts
- [ ] Document any configuration changes
- [ ] Train users on new features
- [ ] Prepare user documentation
- [ ] Schedule regular backups

---

## 📞 Support

For issues or questions:
- Review `MODULES_DOCUMENTATION.md` for API specifications
- Check `INTEGRATION_SUMMARY.md` for architecture overview
- Contact development team for technical support

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# 1. Rollback to previous deployment
firebase hosting:rollback

# 2. Restore previous Firestore indexes if needed
# (Keep backup of previous firestore.indexes.json)

# 3. Check application logs for root cause
firebase functions:log

# 4. Fix issues locally and test before redeploying
npm run dev
# Test thoroughly

# 5. Redeploy when ready
firebase deploy
```

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0  
**Status:** Ready for Deployment
