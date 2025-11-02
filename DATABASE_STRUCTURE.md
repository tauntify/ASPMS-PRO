# ASPMS Database Structure

## 🗄️ Complete Database Architecture

### Collection Hierarchy

```
Firestore Database:
│
├── 📁 admins (System administrators & founders)
│   └── {userId}
│       ├── id, username, email, role: 'admin'
│       ├── isFounder: true
│       ├── isArkaAdmin: true
│       └── NO organizationId, NO subscriptionId
│
├── 📁 arka_office (ARKA Services internal organization)
│   ├── 📄 profile
│   │   ├── organizationId: 'arka-office'
│   │   ├── organizationName: 'ARKA Services Office'
│   │   └── accountType: 'office'
│   │
│   ├── 📁 users
│   │   └── {userId} (principle, employees, clients for ARKA)
│   │
│   ├── 📁 projects
│   │   └── {projectId}
│   │
│   ├── 📁 employees
│   │   └── {employeeId}
│   │
│   ├── 📁 clients
│   │   └── {clientId}
│   │
│   ├── 📁 expenses
│   │   └── {expenseId}
│   │
│   └── 📁 timesheets
│       └── {timesheetId}
│
├── 📁 individuals (Individual plan subscribers - $10/month)
│   └── ind_{userId}
│       ├── 📄 profile
│       │   ├── userId
│       │   ├── username, email
│       │   ├── subscriptionTier: 'individual'
│       │   ├── subscriptionId
│       │   └── limits: { maxProjects: 5, maxEmployees: 0 }
│       │
│       ├── 📁 projects (max 5)
│       │   └── {projectId}
│       │
│       ├── 📁 expenses
│       │   └── {expenseId}
│       │
│       └── 📁 timesheets
│           └── {timesheetId}
│
├── 📁 custom_businesses (Custom plan subscribers - $50+ base)
│   └── cust_{organizationId}
│       ├── 📄 profile
│       │   ├── organizationId
│       │   ├── organizationName
│       │   ├── ownerId (principle user)
│       │   ├── subscriptionTier: 'custom'
│       │   ├── subscriptionId
│       │   ├── limits:
│       │   │   ├── baseEmployees: 5
│       │   │   ├── baseProjects: 10
│       │   │   ├── additionalEmployees: X ($10 each)
│       │   │   ├── additionalProjects: Y ($5 each)
│       │   │   └── totalPrice: $50 + (X*10) + (Y*5)
│       │   └── billingInfo
│       │
│       ├── 📁 users
│       │   ├── {principleId} (owner)
│       │   ├── {employeeId1}
│       │   ├── {employeeId2}
│       │   └── {clientId}
│       │
│       ├── 📁 projects
│       │   └── {projectId}
│       │
│       ├── 📁 employees
│       │   └── {employeeId}
│       │
│       ├── 📁 clients
│       │   └── {clientId}
│       │
│       ├── 📁 expenses
│       │   └── {expenseId}
│       │
│       └── 📁 timesheets
│           └── {timesheetId}
│
├── 📁 organizations (Organization plan subscribers - $300/month)
│   └── org_{organizationId}
│       ├── 📄 profile
│       │   ├── organizationId
│       │   ├── organizationName
│       │   ├── ownerId (principle user)
│       │   ├── subscriptionTier: 'organization'
│       │   ├── subscriptionId
│       │   ├── limits:
│       │   │   ├── maxEmployees: 30
│       │   │   ├── maxProjects: 50
│       │   │   ├── maxAccounts: -1 (unlimited)
│       │   │   └── price: $300
│       │   └── billingInfo
│       │
│       ├── 📁 users (unlimited)
│       │   └── {userId}
│       │
│       ├── 📁 projects (max 50)
│       │   └── {projectId}
│       │
│       ├── 📁 employees (max 30)
│       │   └── {employeeId}
│       │
│       ├── 📁 clients
│       │   └── {clientId}
│       │
│       ├── 📁 expenses
│       │   └── {expenseId}
│       │
│       └── 📁 timesheets
│           └── {timesheetId}
│
└── 📁 subscriptions (All subscription records for billing)
    └── {subscriptionId}
        ├── userId / organizationId
        ├── tier: 'trial' | 'individual' | 'custom' | 'organization'
        ├── status: 'trial' | 'active' | 'expired' | 'blocked'
        ├── startDate, endDate
        ├── pricing details
        └── payment history

```

## 🔑 Key Benefits

### 1. Easy Billing Calculation
```javascript
// Calculate total revenue
const individuals = await db.collection('individuals').get();
const customs = await db.collection('custom_businesses').get();
const orgs = await db.collection('organizations').get();

// Each collection has pricing info in profile
```

### 2. Easy Data Management
```javascript
// Delete an organization and ALL its data
await db.collection('custom_businesses').doc('cust_ABC123').delete();
// Deletes: profile, users, projects, employees, everything!
```

### 3. Easy Queries
```javascript
// Get all custom businesses for billing
const customBusinesses = await db.collection('custom_businesses').get();

// Get ARKA office data only
const arkaProjects = await db.collection('arka_office/projects').get();
```

### 4. Clear Separation
- ✅ Admins have their own collection (no mixing with regular users)
- ✅ ARKA office is separate (your internal business)
- ✅ Each subscription tier has its own collection
- ✅ Easy to identify and manage each organization

## 📊 Subscription Tiers & Collections

| Tier | Collection | Price | Limits |
|------|-----------|-------|--------|
| Trial | (temporary, any collection) | Free | 3 days, view only |
| Individual | `individuals/` | $10/month | 5 projects, 1 user |
| Custom | `custom_businesses/` | $50+ base | 5 emp + 10 proj base, add more |
| Organization | `organizations/` | $300/month | 30 emp, 50 proj, unlimited users |
| Admin | `admins/` | Free | Unlimited everything |
| ARKA Office | `arka_office/` | Free | Unlimited everything |

## 🔐 Access Control

### Founder Account
- Collection: `admins/{founderId}`
- Can access: ALL collections
- Queries: No filters, sees everything

### ARKA Office Account
- Collection: `arka_office/users/{officeUserId}`
- Can access: Only `arka_office/*`
- Queries: Filtered by organizationId: 'arka-office'

### Individual User
- Collection: `individuals/ind_{userId}`
- Can access: Only their own `individuals/ind_{userId}/*`
- Queries: Filtered by userId

### Custom Business (Principle)
- Collection: `custom_businesses/cust_{orgId}/users/{principleId}`
- Can access: Only `custom_businesses/cust_{orgId}/*`
- Queries: Filtered by organizationId

### Organization (Principle)
- Collection: `organizations/org_{orgId}/users/{principleId}`
- Can access: Only `organizations/org_{orgId}/*`
- Queries: Filtered by organizationId

## 🚀 Migration Plan

1. ✅ Delete all existing data (already done)
2. Create new collections structure
3. Migrate founder account → `admins/`
4. Migrate office account → `arka_office/users/`
5. Update storage layer to use new collections
6. Update API routes
7. Update signup flow
8. Deploy and test
