# System Function Descriptions

This document summarizes the system functions for the Graphic Corner System, organized by feature area. Each function includes a short description, suggested API endpoints (implementation hints), expected inputs/outputs, and notes for edge cases and validation.

---

## 1. Admin Management Functions

### Admin Register Customer
- Description: Admin creates a new customer profile with name, email, phone, business type and login credentials. System stores the customer and prepares their dashboard.
- Suggested Endpoint: POST /api/clients
- Input (body): { clientId, name, contact, email, password, customerType (optional), membershipId (optional) }
- Output: 201 created + created client object (without password)
- Notes: Validate unique email and clientId; hash passwords; if membershipId provided, trigger assignMembership flow.

### Edit Customer Details
- Description: Update customer details and immediate reflection on their dashboard.
- Suggested Endpoint: PUT /api/clients/:id
- Input: partial client fields to update
- Output: 200 OK + updated client
- Notes: Protect fields like password; only admin or owner may update depending on policy.

### Reset Customer Password
- Description: Admin can reset a customer's password to a generated or supplied value.
- Suggested Endpoint: POST /api/clients/:id/reset-password
- Input: { newPassword? } or leave blank to auto-generate
- Output: 200 OK + success message
- Notes: Send secure notification to user (email/SMS) with reset instructions. Store hashed password.

### Delete Customer
- Description: Deactivate or permanently remove a customer and associated records.
- Suggested Endpoint: DELETE /api/clients/:id (soft or hard delete option)
- Input: query param soft=true|false
- Output: 200 OK
- Notes: Soft-delete recommended (isActive flag); if hard delete, cascade or archive payments, tasks, packages.

---

## 2. Service & Category Management Functions

### Create Service Category
- Description: Admin creates categories (e.g., Graphic Designing, Video Editing) to group services.
- Endpoint: POST /api/categories
- Input: { name, description }
- Output: 201 + category

### Update Service Category
- Description: Modify name or description of a category; linked services should reflect the new category automatically.
- Endpoint: PUT /api/categories/:id
- Input: { name?, description? }
- Output: 200 + category

### Delete Category
- Description: Deactivate or delete a category. Services linked to it must be reassigned or unlinked.
- Endpoint: DELETE /api/categories/:id
- Input: ?reassignTo=otherCategoryId (optional)
- Output: 200 + result
- Notes: If reassignTo present, reassign services; otherwise unset category on services.

### Create Service
- Description: Admin adds a service with description, pricing, duration, and category.
- Endpoint: POST /api/services
- Input: { title, description, price, duration, categoryId, icon }
- Output: 201 + service
- Notes: Validate price as number, ensure category exists.

### Update Service
- Description: Modify service information (price increases, category changes, features).
- Endpoint: PUT /api/services/:id
- Input: partial service fields
- Output: 200 + updated service
- Notes: Prevent deletion if used in active packages (see Delete Service).

### Delete Service
- Description: Remove a service from the catalog. If the service is part of active membership packages, prevent deletion or force admin to confirm cascading changes.
- Endpoint: DELETE /api/services/:id
- Output: 200 + message
- Notes: Prefer soft delete or require reassignment; ensure package integrity.

---

## 3. Membership Package Functions

### Create Membership Package
- Description: Admin creates packages containing services, counts, price and rules (e.g., monthly limits, discounts).
- Endpoint: POST /api/memberships
- Input: { name, description, price, billingCycle, includedServices: [{ service, count, priceOverride? }], taskLimit?, paymentRules? }
- Output: 201 + membership
- Notes: includedServices references `Service` ids; validate service existence.

### Update Membership Package
- Description: Modify package pricing, included services, counts. Notify or optionally apply changes to existing subscribers.
- Endpoint: PUT /api/memberships/:id
- Input: partial membership fields
- Output: 200 + updated membership
- Notes: Notify subscribers of changes if relevant; do not retroactively remove already-consumed entitlements unless agreed.

### Delete Membership Package
- Description: Deactivate a package so it cannot be purchased; existing subscribers remain unaffected.
- Endpoint: DELETE /api/memberships/:id (soft delete)
- Output: 200

### Purchase Membership (Customer)
- Description: When a customer buys a package, the system verifies minimum advance (25% default), records the advance, calculates the remaining balance and generates a monthly payment schedule, and activates the membership and entitlements.
- Endpoint: POST /api/memberships/:id/purchase
- Input: { clientId, totalAmount?(optional), advancePaid, installments?(optional[]), months?(number), paymentMethod?, notes? }
- Output: 200 + { client, payments }
- Notes:
  - Validate advance >= 25% (or membership.paymentRules.minAdvancePercent)
  - If `installments[]` is provided, its sum must equal the remaining balance. Otherwise automatically split remaining across `months`.
  - Create Payment records (advance: status 'paid' if received, installments: 'pending').
  - Assign membershipId to client, set subscriptionStartDate and subscriptionEndDate, and populate serviceEntitlements based on includedServices counts.

---

## 4. Payment Management Functions

### Record Advance Payment
- Endpoint: POST /api/payments
- Input: { clientId, title, dueDate, amount, method, status }
- Output: 201 + payment
- Notes: Validate advance rules when tied to a membership purchase.

### Generate Payment Schedule
- Description: Created during membership purchase. Payment entries created with due dates (monthly by default) and amounts.
- Implementation: See purchase membership flow.

### View Upcoming Payments (Customer)
- Endpoint: GET /api/payments/client/:clientId
- Input: none (authenticated client or admin)
- Output: list of upcoming/pending payments

### View Payment History (Customer & Admin)
- Endpoint (admin): GET /api/payments
- Endpoint (client): GET /api/payments/client/:clientId
- Output: list of all payments with status and timestamps

### Admin View All Payments
- Endpoint: GET /api/payments
- Output: payments with filters (status, date-range, client)

---

## 5. Task Management Functions

### Admin Add Task for Customer
- Endpoint: POST /api/contents
- Input: { clientId, title, description, dueDate, category?, packageId? }
- Output: 201 + task
- Notes: Admin creates tasks based on external communication (WhatsApp). If `packageId` provided, decrement entitlement or track consumption when task is completed.

### Update Task Status
- Endpoint: PUT /api/contents/:id/status
- Input: { status }
- Output: 200 + updated task
- Notes: Status flow: Pending → In Progress → Review → Completed. On Completed, update package/task counters and client entitlements.

### View Tasks (Customer)
- Endpoint: GET /api/contents/client/:clientId
- Output: tasks for that client

### View All Tasks (Admin)
- Endpoint: GET /api/contents
- Output: all tasks with filters (status, deadline, client, category)

---

## 6. Customer Dashboard Functions

### View Package Details
- Endpoint: GET /api/clients/:id
- Output: client details including `membershipId` populated, `serviceEntitlements`, `subscriptionStartDate`, `subscriptionEndDate`.

### View Task Progress
- Endpoint: GET /api/contents/client/:clientId
- Output: task list with statuses and metadata

### View Invoice & Payments
- Endpoint: GET /api/payments/client/:clientId
- Output: payment schedule + history

### View Notifications
- Implementation: either store a `Notification` collection and expose GET /api/notifications/client/:clientId, or implement realtime push (websockets).

---

## 7. Admin Dashboard Functions

### View All Customers
- Endpoint: GET /api/clients
- Output: client list including membership and payment summary

### View All Tasks Summary
- Endpoint: GET /api/contents/summary or GET /api/contents with aggregation query
- Output: aggregated counts by status, category, deadline ranges

### View Payment Summary
- Endpoint: GET /api/payments/summary
- Output: revenue totals, pending amounts, overdue amounts, charts-ready numbers

### View Customer Inquiries
- Endpoint: GET /api/contact or GET /api/messages
- Output: list of inquiries (supports pagination and reply endpoints)

### Generate Reports
- Endpoint: GET /api/reports?type=tasks|payments|customers&from=&to=
- Output: downloadable CSV/JSON

---

## Implementation Notes & Edge Cases
- Data integrity
  - Use soft deletes for safety (isActive flags). Keep audit logs where money or business-critical operations occur.
- Payments
  - `Payment.clientId` currently stored as a string; consider converting to an ObjectId ref to `Client` for easier joins and queries.
  - Payment reconciliation: provide admin endpoints to mark payments manually as paid and attach receipts.
- Membership changes
  - If a membership is updated after customers have subscribed, decide whether changes apply immediately, only for new subscribers, or via explicit migration.
- Entitlements & consumption
  - When admin creates a task tied to a membership, decrement entitlement only when the task completes (not when created), unless your business rule differs.
- Notifications
  - Consider webhooks or email services for important events (payment reminders, membership expiration) and a background job runner (cron or queue) for scheduled reminders.

---

## Next steps (implementation plan)
1. Convert `Payment.clientId` to ObjectId and migrate existing payment records (optional but recommended).
2. Build Admin UI pages for Categories and Services (CRUD) and Membership composition UI (select services + counts).
3. Build Purchase form and flow in the Admin Dashboard to trigger `POST /api/memberships/:id/purchase`.
4. Implement client-facing dashboard pages to show membership details, remaining entitlements, tasks, and payments.
5. Add automated tests for purchase flow, entitlement assignment, and payment schedule generation.

---

If you want, I can now implement one of the following (pick one):
- Convert `Payment.clientId` to ObjectId and write migration.
- Add admin UI pages (React components) for Category and Service management.
- Add admin endpoint to reconcile/mark payments as paid (and update client.totalSpent).
- Create tests for the membership purchase flow.
