# System Architecture Diagram

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GRAPHIC CORNER SYSTEM v2.0                       │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────┐
                    │      ADMIN DASHBOARD         │
                    │  6 Tabs + Analytics          │
                    └──────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    CUSTOMERS          MEMBERSHIPS         CUSTOM PACKAGES
    (CRUD)             (Monthly)            (Task-Based)
        │                   │                   │
        │                   │                   │
        ├─────────────────┬─┴─────────┬─────────┤
        │                 │           │         │
        ▼                 ▼           ▼         ▼
    CLIENT             MEMBERSHIP   CUSTOM   PAYMENT
    MODEL              MODEL        PACKAGE  TRACKING
                                    MODEL
```

## 🔄 Customer Type Separation

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT RECORD                                 │
│  • clientId                                                       │
│  • name, email, contact                                          │
│  • status (active/inactive)                                      │
│  • customerType ◄─── THIS DETERMINES EVERYTHING                 │
└─────────────────────────────────────────────────────────────────┘
            │
            ├─────────────────────────┬──────────────────────────┐
            │                         │                          │
            ▼                         ▼                          ▼
    MONTHLY_SUBSCRIPTION         TASK_BASED                   HYBRID
    
    ┌──────────────────┐        ┌──────────────────┐      (Can have both
    │ membershipId ───────────► │ CUSTOM PACKAGES  │       during
    │ subscriptionDate│        │ (unlimited)      │       transition)
    │ subscriptionEnd │        │ • Multiple       │
    │ (auto-renewed)  │        │ • Per-project    │
    │                │        │ • Task-tracked   │
    └──────────────────┘        └──────────────────┘
    
    Assigned From:             Created By Admin:
    MEMBERSHIPS Collection     CUSTOM PACKAGES
    (Reusable packages)        (Client-specific)
```

## 📦 Database Collections & Relationships

```
┌────────────────────────────────────────────────────────────────────┐
│                        MONGODB COLLECTIONS                         │
└────────────────────────────────────────────────────────────────────┘

MEMBERSHIPS                    CLIENTS                  CUSTOM PACKAGES
─────────────────────────────────────────────────────────────────────
│ _id (pk)                   │ _id (pk)              │ _id (pk)
│ name ◄──────────────────┐  │ clientId              │ clientId ──────┐
│ price                   │  │ name                  │ packageName     │
│ taskLimit               │  │ email                 │ price           │
│ revisionLimit           │  │ password (hashed)     │ taskCount       │
│ deliveryDays            │  │ status                │ tasksCompleted  │
│ supportLevel            │  │ role (admin/client)   │ status          │
│ features []             │  │ ◄──────────────────────  paymentStatus  │
│ icon                    │  │ customerType *        │ amountPaid      │
│ color                   │  │   ├─ monthly_sub ──┐  │ notes           │
│ isActive                │  │   └─ task_based ────┼─► features []    │
│ created/updated         │  │                    │  │ created/updated │
└────────────────────────┘  │ membershipId ─────────┤
        ▲                    │ subscriptionStart  │  └────────────────┘
        │                    │ subscriptionEnd    │
        └────────────────────│ tasksCompleted     │
      (populated)            │ totalSpent         │
                             │ created/updated    │
                             └────────────────────┘
                                    ▲
                                    │
                            (populated)
```

## 🔌 API Endpoint Structure

```
BASE URL: /api

├── /auth                          (authentication)
│   ├── POST /login
│   └── POST /seed-admin
│
├── /clients                        (enhanced for membership)
│   ├── GET /                       (admin: list all)
│   ├── POST /                      (admin: create)
│   ├── GET /:id                    (admin: detail)
│   ├── PUT /:id                    (admin: update)
│   ├── PUT /:id/membership         (admin: assign membership) ◄ NEW
│   ├── DELETE /:id                 (admin: delete)
│   └── GET /me                     (client: own profile)
│
├── /memberships                    ◄ NEW COLLECTION
│   ├── GET /                       (public: list all)
│   ├── GET /:id                    (public: detail)
│   ├── POST /                      (admin: create)
│   ├── PUT /:id                    (admin: update)
│   └── DELETE /:id                 (admin: soft delete)
│
├── /custom-packages                ◄ NEW COLLECTION
│   ├── GET /                       (admin: list all)
│   ├── GET /client/:clientId       (auth: client's packages)
│   ├── POST /                      (admin: create)
│   ├── PUT /:id                    (admin: update)
│   ├── PUT /:id/progress           (admin: update task count) ◄ NEW
│   ├── PUT /:id/payment            (admin: update payment) ◄ NEW
│   └── DELETE /:id                 (admin: delete)
│
├── /packages                       (existing: general packages)
├── /contents                       (existing: content management)
├── /payments                       (existing: payment tracking)
├── /services                       (existing: service catalog)
└── /contact                        (existing: contact form)
```

## 🎨 Admin Dashboard Structure

```
ADMIN DASHBOARD
│
├── 📊 OVERVIEW TAB
│   ├── Stats Cards (4)
│   │   ├── Total Customers (by type)
│   │   ├── Total Tasks
│   │   ├── Total Revenue
│   │   └── Pending Payments
│   └── Charts (2)
│       ├── Task Status Pie Chart
│       └── Payment Status Bar Chart
│
├── 👥 CUSTOMERS TAB
│   ├── Create Customer Form
│   │   └── Select customerType
│   └── Customers Table
│       ├── List all with details
│       ├── Edit (toggle type, assign membership)
│       └── Delete actions
│
├── 💳 MEMBERSHIPS TAB ◄ NEW
│   ├── New Package Form
│   │   ├── Name, Price, Description
│   │   ├── Task Limit, Revision Limit
│   │   ├── Support Level
│   │   ├── Icon & Color
│   │   └── Features List
│   └── Memberships Grid
│       ├── Card per membership
│       ├── Pricing display
│       ├── Features showcase
│       ├── Edit button
│       └── Delete button
│
├── 📦 CUSTOM PACKAGES TAB ◄ NEW
│   ├── New Package Form
│   │   ├── Select Customer
│   │   ├── Package Details
│   │   ├── Price & Task Count
│   │   ├── Features
│   │   └── Notes
│   └── Packages Table
│       ├── Customer name
│       ├── Package name
│       ├── Progress bar (visual)
│       ├── Payment status
│       ├── Edit button
│       └── Delete button
│
├── 📋 TASKS TAB
│   ├── Create Task Form
│   └── Tasks Table
│
└── 💰 PAYMENTS TAB
    ├── Create Payment Form
    └── Payments Table
```

## 🔐 Access Control Flow

```
USER REQUEST
    │
    ├─ PUBLIC REQUEST (GET memberships, POST contact)
    │   └─► ALLOWED ✓
    │
    ├─ AUTHENTICATED CLIENT (GET /me)
    │   └─► CHECK JWT ───► VALID ───► ALLOWED ✓
    │                  └─ INVALID ──► DENIED ✗
    │
    └─ ADMIN ONLY (POST membership, PUT custom-package)
        └─► CHECK JWT ───► VALID ───► CHECK ROLE
                       │        └─ ADMIN ───► ALLOWED ✓
                       │        └─ CLIENT ──► DENIED ✗
                       └─ INVALID ──────────► DENIED ✗
```

## 📊 Data Flow Examples

### Creating Monthly Subscription Customer

```
ADMIN CREATES MEMBERSHIP
    │
    ▼
POST /api/memberships ─────────► membershipController.create()
    │                                    │
    │                                    ▼
    │                            Validate data
    │                                    │
    │                                    ▼
    │                            Save to Membership collection
    │                                    │
    │                                    ▼
    └─────────────────────────► Return created membership

                                        │
                                        ▼
            ADMIN CREATES CUSTOMER
                │
                ▼
            POST /api/clients ─────────► clientController.create()
                │                                │
                │                                ▼
                │                        Validate data
                │                                │
                │                                ▼
                │                        Set customerType: 'monthly_subscription'
                │                                │
                │                                ▼
                │                        Reference membershipId
                │                                │
                │                                ▼
                │                        Hash password
                │                                │
                │                                ▼
                │                        Save to Client collection
                │                                │
                │                                ▼
                └─────────────────────► Return created client
                                        with populated membership
```

### Creating Custom Task-Based Package

```
ADMIN CREATES CUSTOM PACKAGE
    │
    ▼
POST /api/custom-packages ────────► customPackageController.create()
    │                                       │
    │                                       ▼
    │                               Validate data
    │                                       │
    │                                       ▼
    │                               Verify client exists
    │                                       │
    │                                       ▼
    │                               Create package record
    │                                       │
    │                                       ▼
    │                               Link to clientId
    │                                       │
    │                                       ▼
    │                               Auto-set status: 'active'
    │                                       │
    │                                       ▼
    │                               Save to CustomPackage collection
    │                                       │
    │                                       ▼
    └─────────────────────────────► Return created package
                                    with populated client data

                                            │
                                            ▼
                        ADMIN UPDATES PROGRESS
                                │
                                ▼
                PUT /api/custom-packages/:id/progress
                        │
                        ▼
                tasksCompleted = 3
                        │
                        ▼
                Check: 3 >= 5? NO
                        │
                        ▼
                Status remains 'active'
                        │
                        ▼
                Later... tasksCompleted = 5
                        │
                        ▼
                Check: 5 >= 5? YES
                        │
                        ▼
                Auto-set status: 'completed'
```

## 💾 Data Storage Summary

```
Before Implementation:
├── clients (basic fields)
├── packages (general)
├── contents
├── payments
├── services
├── messages
└── (memberships feature missing)

After Implementation:
├── clients (enhanced)
│   ├── customerType field
│   ├── membershipId reference
│   └── subscription dates
├── memberships ◄ NEW
│   ├── Reusable packages
│   ├── Feature definitions
│   └── Pricing tiers
├── custompackages ◄ NEW
│   ├── Client-specific deals
│   ├── Progress tracking
│   └── Payment management
├── packages
├── contents
├── payments
├── services
└── messages
```

## 🔄 Workflow Comparison

```
MONTHLY SUBSCRIPTION FLOW
────────────────────────────────
Create Membership
    ▼
Assign to Customer
    ▼
Monthly Task Quota Active
    ▼
Track Monthly Usage
    ▼
Renew or Upgrade
    ▼
Recurring Billing


TASK-BASED FLOW
────────────────────────────────
Create Custom Package
    ▼
Client Notified
    ▼
Track Task Progress
    ▼
Update as Tasks Complete
    ▼
Track Payments
    ▼
Mark as Paid
    ▼
Mark as Completed


MIXED FLOW (Possible)
────────────────────────────────
Customer has Membership
    (Monthly 5 tasks)
        ▼
Customer also has Custom Package
    (Project: 8 tasks, $2500)
        ▼
Both tracked independently
        ▼
Can convert between types
```

---

## 📈 Statistics & Reporting

```
OVERVIEW TAB CALCULATIONS
─────────────────────────

totalCustomers = clients.count(all)

activeCustomers = clients.count(status: 'active')

totalTasks = contents.count(all)

pendingTasks = contents.count(status: 'pending')

completedTasks = contents.count(status: 'completed')

totalPayments = payments.count(all)

paidPayments = payments.count(status: 'paid')

pendingPayments = payments.count(status: 'pending')

totalRevenue = SUM(payments[status: 'paid'].amount)

Custom Package Stats:
├── taskCompletion% = customPackages.tasksCompleted / taskCount
├── paymentRate% = amountPaid / price
└── completedRate% = customPackages.count(status: 'completed')
```

---

**System Architecture Complete!** 🚀
This diagram shows how all components interconnect to provide a complete membership and custom package management system.
