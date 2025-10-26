# 🔥 Complete Firestore Index List - Create All At Once

## Currently Required Indexes (Showing Errors Now)

Based on the server logs, these are the indexes currently causing 500 errors:

### ✅ INDEX 1: Attendance
**Collection:** `attendance`
**Fields:** `employeeId` (ASC) → `attendanceDate` (ASC)

**Create Index URL:**
```
https://console.firebase.google.com/v1/r/project/aspms-pro/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9hc3Btcy1wcm8vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2F0dGVuZGFuY2UvaW5kZXhlcy9fEAEaDgoKZW1wbG95ZWVJZBABGhIKDmF0dGVuZGFuY2VEYXRlEAEaDAoIX19uYW1lX18QAQ
```

---

### ✅ INDEX 2: Salaries
**Collection:** `salaries`
**Fields:** `employeeId` (ASC) → `month` (DESC)

**Create Index URL:**
```
https://console.firebase.google.com/v1/r/project/aspms-pro/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9hc3Btcy1wcm8vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3NhbGFyaWVzL2luZGV4ZXMvXxABGg4KCmVtcGxveWVlSWQQARoJCgVtb250aBACGgwKCF9fbmFtZV9fEAI
```

---

## Potentially Needed Indexes (May Appear Later)

These indexes are defined in `firestore.indexes.json` but haven't triggered errors yet. They will be needed when you use certain features:

### 📋 INDEX 3: Salary Advances
**Collection:** `salaryAdvances`
**Fields:** `employeeId` (ASC) → `date` (DESC)
**Triggers When:** Recording salary advances

**Manual Creation:**
1. Go to: https://console.firebase.google.com/project/aspms-pro/firestore/indexes
2. Click "Create Index"
3. Collection ID: `salaryAdvances`
4. Add field: `employeeId` - Ascending
5. Add field: `date` - Descending
6. Click "Create"

---

### 💳 INDEX 4: Salary Payments
**Collection:** `salaryPayments`
**Fields:** `salaryId` (ASC) → `paymentDate` (DESC)
**Triggers When:** Recording salary payments

**Manual Creation:**
1. Go to: https://console.firebase.google.com/project/aspms-pro/firestore/indexes
2. Click "Create Index"
3. Collection ID: `salaryPayments`
4. Add field: `salaryId` - Ascending
5. Add field: `paymentDate` - Descending
6. Click "Create"

---

### 📄 INDEX 5: Employee Documents
**Collection:** `employeeDocuments`
**Fields:** `employeeId` (ASC) → `createdAt` (ASC)
**Triggers When:** Viewing employee documents

**Manual Creation:**
1. Go to: https://console.firebase.google.com/project/aspms-pro/firestore/indexes
2. Click "Create Index"
3. Collection ID: `employeeDocuments`
4. Add field: `employeeId` - Ascending
5. Add field: `createdAt` - Ascending
6. Click "Create"

---

## Already Existing Indexes (No Action Needed)

These indexes were already defined and should be enabled:

✅ **divisions**: `projectId` (ASC) → `order` (ASC)
✅ **tasks**: Multiple index combinations for project and employee filtering
✅ **procurementItems**: `projectId` (ASC) → `createdAt` (ASC)
✅ **comments**: `projectId` (ASC) → `createdAt` (ASC)
✅ **projectAssignments**: Various combinations for user and project filtering

---

## 🚀 Quick Action Plan

### IMMEDIATE (Do This Now):
1. ✅ **Create Attendance Index** - Using URL above
2. ✅ **Create Salaries Index** - Using URL above

### OPTIONAL (Create These To Prevent Future Errors):
3. Create Salary Advances Index (manually)
4. Create Salary Payments Index (manually)
5. Create Employee Documents Index (manually)

---

## 📊 Index Status Check

After creating indexes, verify them here:
👉 https://console.firebase.google.com/project/aspms-pro/firestore/indexes

All indexes should show:
- Status: **Enabled** ✅ (green checkmark)
- NOT "Building..." or "Error"

---

## ⏱️ Estimated Build Time

| Index | Estimated Time |
|-------|---------------|
| Attendance | 1-3 minutes |
| Salaries | 1-3 minutes |
| Salary Advances | 1-2 minutes |
| Salary Payments | 1-2 minutes |
| Employee Documents | 1-2 minutes |

**Total if creating all:** ~5-10 minutes

---

## 🔍 How to Know Which Indexes You Need

**Current Errors = Must Create Now:**
- If you see 500 errors in browser console or server logs
- The error message contains a Firebase Console URL
- Click the URL to auto-create the index

**Future Indexes = Create Proactively:**
- Based on `firestore.indexes.json` configuration
- Will prevent errors when using those features later
- Better to create them all now to avoid interruptions

---

## ✅ Summary: Just These 2 URLs For Now!

**Copy and paste these 2 URLs in your browser NOW:**

1. **Attendance Index:**
```
https://console.firebase.google.com/v1/r/project/aspms-pro/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9hc3Btcy1wcm8vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2F0dGVuZGFuY2UvaW5kZXhlcy9fEAEaDgoKZW1wbG95ZWVJZBABGhIKDmF0dGVuZGFuY2VEYXRlEAEaDAoIX19uYW1lX18QAQ
```

2. **Salaries Index:**
```
https://console.firebase.google.com/v1/r/project/aspms-pro/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9hc3Btcy1wcm8vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3NhbGFyaWVzL2luZGV4ZXMvXxABGg4KCmVtcGxveWVlSWQQARoJCgVtb250aBACGgwKCF9fbmFtZV9fEAI
```

**After these 2 are building, optionally create the other 3 manually to prevent future errors!**
