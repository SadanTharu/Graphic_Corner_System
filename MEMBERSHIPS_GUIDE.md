# Membership & Custom Packages System Documentation

## Overview

The Graphic Corner System now supports two types of customer subscription models:

1. **Monthly Subscription (Membership)** - Recurring monthly packages with fixed benefits
2. **Task-Based (Custom Packages)** - Project-specific packages with defined task counts

---

## System Architecture

### Database Models

#### 1. **Membership Model** (`Membership.js`)
Defines standard monthly subscription packages that can be offered to multiple clients.

**Fields:**
```javascript
{
  name: String,           // e.g., "Basic", "Professional", "Enterprise"
  description: String,
  price: Number,          // Monthly subscription price
  billingCycle: String,   // monthly, quarterly, yearly
  taskLimit: Number,      // Max tasks per billing cycle
  revisionLimit: Number,  // Max design revisions allowed
  deliveryDays: Number,   // Standard delivery time (default: 7)
  supportLevel: String,   // basic, priority, vip
  features: Array,        // List of included features
  isActive: Boolean,      // Soft delete flag
  icon: String,          // Emoji icon for UI display
  color: String          // Hex color for UI branding
}
```

#### 2. **CustomPackage Model** (`CustomPackage.js`)
Individual task-based packages created by admin for specific clients.

**Fields:**
```javascript
{
  clientId: ObjectId,         // Reference to client
  packageName: String,        // e.g., "Logo Design + Branding"
  description: String,
  price: Number,              // Total package price
  taskCount: Number,          // Number of design tasks
  tasksCompleted: Number,     // Progress tracking
  revisionLimit: Number,
  deliveryDays: Number,
  status: String,             // active, paused, completed
  startDate: Date,
  endDate: Date,
  paymentStatus: String,      // pending, partial, paid
  amountPaid: Number,
  features: Array,            // Custom features for this client
  notes: String
}
```

#### 3. **Enhanced Client Model** (`Client.js`)
Updated to support both customer types.

**New Fields:**
```javascript
{
  customerType: String,        // monthly_subscription or task_based
  membershipId: ObjectId,      // Reference to membership (if subscription)
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  tasksCompleted: Number,      // Total tasks completed
  totalSpent: Number           // Lifetime value tracking
}
```

---

## API Endpoints

### Memberships Endpoints

#### Public Access
```
GET /api/memberships
  - Returns all active membership packages
  - Response: Array of membership objects

GET /api/memberships/:id
  - Get specific membership details
  - Response: Single membership object
```

#### Admin Only
```
POST /api/memberships
  - Create new membership package
  - Body: {name, description, price, billingCycle, taskLimit, revisionLimit, supportLevel, icon, color, features}
  - Response: Created membership object

PUT /api/memberships/:id
  - Update existing membership
  - Body: Any fields to update
  - Response: Updated membership object

DELETE /api/memberships/:id
  - Soft delete (sets isActive: false)
  - Response: Success message
```

### Custom Packages Endpoints

#### Admin Only
```
GET /api/custom-packages
  - Get all custom packages with client info
  - Response: Array of custom packages

POST /api/custom-packages
  - Create custom package for a client
  - Body: {clientId, packageName, description, price, taskCount, revisionLimit, deliveryDays, features, notes}
  - Response: Created package object

PUT /api/custom-packages/:id
  - Update custom package details
  - Body: Updated fields
  - Response: Updated package object

PUT /api/custom-packages/:id/progress
  - Update task completion status
  - Body: {tasksCompleted, status}
  - Response: Updated package with new progress

PUT /api/custom-packages/:id/payment
  - Update payment status
  - Body: {amountPaid, paymentStatus}
  - Response: Updated package with payment info

DELETE /api/custom-packages/:id
  - Delete custom package
  - Response: Success message
```

#### Client Access
```
GET /api/custom-packages/client/:clientId
  - Get custom packages for specific client
  - Response: Array of client's custom packages
```

### Client Endpoints (Enhanced)

#### Admin Only
```
PUT /api/clients/:id/membership
  - Assign membership package to client
  - Body: {membershipId}
  - Sets customerType to 'monthly_subscription'
  - Automatically sets subscription dates
  - Response: Updated client with membership info
```

---

## Admin Dashboard Usage

### Managing Memberships

1. **Create Membership Package:**
   - Click "💳 Memberships" tab
   - Click "+ New Package" button
   - Fill in package details:
     - Name: "Professional", "Basic", etc.
     - Price: Monthly subscription cost
     - Task Limit: Maximum tasks per month
     - Revision Limit: Design revisions allowed
     - Support Level: basic/priority/vip
     - Icon & Color: For UI display
   - Click "Create Membership"

2. **Edit Membership:**
   - In memberships grid, click "Edit" on any card
   - Update fields as needed
   - Click "Update Membership"

3. **Delete Membership:**
   - Click "Delete" on membership card
   - Confirms with dialog

### Managing Custom Packages

1. **Create Custom Package:**
   - Click "📦 Custom Packages" tab
   - Click "+ New Package" button
   - Select Customer (task-based type only)
   - Enter package details:
     - Package Name: Custom name for this client
     - Price: Total package price
     - Task Count: Number of tasks included
     - Revision Limit: Per-task revisions
     - Delivery Days: Standard delivery time
   - Click "Create Package"

2. **Track Progress:**
   - Progress bar shows tasks completed vs total
   - Can manually update completion percentage
   - Auto-marks as "completed" when all tasks done

3. **Track Payments:**
   - Shows payment status: pending/partial/paid
   - Auto-updates based on amount paid
   - Can manually override payment status

4. **Edit Package:**
   - Click "Edit" to modify package details
   - Update any field needed
   - Click "Update Package"

---

## Customer Type Workflows

### Monthly Subscription Customer Workflow

**Step 1: Create Customer**
```
Admin Dashboard → Customers → "+ Create Customer"
- Fill form with customer details
- Select customerType: "monthly_subscription"
- Click "Create Customer"
```

**Step 2: Assign Membership**
```
Admin Dashboard → Customers tab
- Find customer in table
- Click "Edit"
- Select "monthly_subscription" as type
- Assign a membership package
- Save
- Customer now has subscription dates and limits
```

**Step 3: Track Subscription**
- Membership benefits auto-populate from selected package
- Monthly task limit tracked
- Subscription automatically renews (admin can update dates)

**Step 4: Client View**
- Client logs in and sees membership details
- Shows remaining tasks for month
- Shows revision limit
- Shows support level

### Task-Based Customer Workflow

**Step 1: Create Customer**
```
Admin Dashboard → Customers → "+ Create Customer"
- Fill form with customer details
- Select customerType: "task_based"
- Click "Create Customer"
```

**Step 2: Create Custom Package**
```
Admin Dashboard → Custom Packages → "+ New Package"
- Select the customer from dropdown
- Define package details:
  - 5 Design Tasks
  - 3 Revisions per task
  - $2,500 total price
- Click "Create Package"
```

**Step 3: Update Progress**
```
Custom Packages table
- As tasks complete, update "Progress" field
- Progress bar updates automatically
- Status auto-changes to "completed" when done
```

**Step 4: Track Payment**
```
Custom Packages table
- Update "Payment" status as payments received
- "Pending" → "Partial" → "Paid" progression
- Can mark as fully paid once amount equals price
```

---

## Key Features

### Automatic Status Management

**Task Completion:**
- Package auto-marks as "completed" when:
  - tasksCompleted >= taskCount
  - Status change from "active" to "completed"

**Payment Status:**
- "pending" → "partial" → "paid" automatically based on amountPaid
- When amountPaid >= price, auto-marks as "paid"
- Can override manually if needed

### Reporting & Analytics

The Overview tab shows:
- Total Customers broken down by type
- Active Subscriptions vs Task-based customers
- Revenue tracking (total and by payment status)
- Task completion rates with pie chart
- Payment status overview with bar chart

### Client Dashboard

When client logs in:

**For Monthly Subscription:**
- Shows current membership tier
- Displays remaining tasks for month
- Shows subscription end date
- Displays included benefits

**For Task-Based:**
- Shows active custom packages
- Progress bar for each package
- Tasks remaining per package
- Payment status and due amounts
- Total value of active packages

---

## Configuration Examples

### Example Memberships Setup

**Basic Package:**
```javascript
{
  name: "Basic",
  price: 299,
  billingCycle: "monthly",
  taskLimit: 2,
  revisionLimit: 2,
  deliveryDays: 7,
  supportLevel: "basic",
  icon: "📦",
  color: "#667eea",
  features: [
    { name: "2 Design Tasks", included: true },
    { name: "2 Revisions per Task", included: true },
    { name: "Email Support", included: true },
    { name: "Premium Assets", included: false }
  ]
}
```

**Professional Package:**
```javascript
{
  name: "Professional",
  price: 599,
  billingCycle: "monthly",
  taskLimit: 5,
  revisionLimit: 5,
  deliveryDays: 3,
  supportLevel: "priority",
  icon: "⭐",
  color: "#764ba2",
  features: [
    { name: "5 Design Tasks", included: true },
    { name: "5 Revisions per Task", included: true },
    { name: "Priority Support", included: true },
    { name: "Premium Assets", included: true },
    { name: "Brand Consultation", included: true }
  ]
}
```

---

## Database Relationships

```
Client (customerType: "monthly_subscription")
  ↓
  └─→ Membership (subscription package details)
       ├─→ taskLimit, revisionLimit, price, features
       └─→ subscriptionStartDate, subscriptionEndDate

Client (customerType: "task_based")
  ↓
  └─→ CustomPackage(s) (individual projects)
       ├─→ Multiple packages per client supported
       ├─→ taskCount, price, status, progress
       └─→ paymentStatus, amountPaid
```

---

## Summary Table

| Feature | Monthly Subscription | Task-Based |
|---------|----------------------|-----------|
| Pricing Model | Recurring monthly fee | One-time project price |
| Task Limit | Monthly quota | Fixed count per package |
| Duration | Month-to-month | Until completion |
| Revisions | Per-task limit | Per-task limit |
| Multiple Packages | No (one active) | Yes (multiple) |
| Payment Tracking | Subscription billing | Per-package payment |
| Best For | Retainer clients | Project-based work |
| Admin Control | Package assignments | Full custom creation |
| Client Visibility | Membership tier + limits | Package details + progress |

---

## Next Steps

1. **Set Up Initial Memberships:**
   - Create 2-3 standard packages in Memberships tab
   - Test with demo customers

2. **Create Sample Custom Packages:**
   - Create task-based customer
   - Create custom package for testing
   - Track progress and payment

3. **Configure Client Dashboard:**
   - Ensure clients can see their package details
   - Test membership vs custom package display

4. **Integrate Payments:**
   - Connect payment processor
   - Auto-update payment status on successful transactions

5. **Email Notifications:**
   - Send renewal reminders for subscriptions
   - Send delivery notifications for task completions
   - Payment confirmations

---

**Last Updated:** December 2025
**Version:** 2.0.0 (With Membership & Custom Packages)
