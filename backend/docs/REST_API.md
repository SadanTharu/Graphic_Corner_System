# REST API - Graphic Corner System (Summary)

This file lists primary REST endpoints mapped to controllers and expected inputs/outputs. Use this as a quick reference for developers.

## Services
- GET /api/services
  - Public: list all available services
  - Response: [Service]

- GET /api/services/category/:categoryId
  - Public: list services filtered by category
  - Response: [Service]

- GET /api/services/admin
  - Admin only: list all services (with metadata)
  - Middleware: auth, admin

- POST /api/services
  - Admin only: create service
  - Body: { title, description, price, categoryId }

- PUT /api/services/:id
  - Admin only: update service

- DELETE /api/services/:id
  - Admin only: delete service

## Categories
- GET /api/categories
- POST /api/categories (admin)
- PUT /api/categories/:id (admin)
- DELETE /api/categories/:id (admin)

## Memberships
- GET /api/memberships
- POST /api/memberships (admin)
  - Body: { name, description, price, billingCycle, includedServices: [{ service: serviceId, count: number, priceOverride? }], features?, taskLimit?, revisionLimit? }
- PUT /api/memberships/:id (admin)
- DELETE /api/memberships/:id (admin)
- POST /api/memberships/:id/purchase
  - Body: { clientId, advancePaid, months?, installments? }
  - Validations: advancePaid >= 25% of membership price

## Payments
- GET /api/payments (admin)
- GET /api/payments/client/:clientId
- POST /api/payments
  - Body: { clientId, amount, method, title, dueDate?, status }

## Contents (Tasks)
- GET /api/contents (admin)
- GET /api/contents/client/:clientId
- POST /api/contents (admin)
  - Body: { clientId, title, description, dueDate, category }
- PUT /api/contents/:id
  - For updating status, use body { status }

## Clients
- GET /api/clients (admin)
- GET /api/clients/:id
- POST /api/clients (admin)
- PUT /api/clients/:id
- POST /api/clients/:id/reset-password (admin)
- DELETE /api/clients/:id

## Notes
- Protect admin endpoints with `auth` and `admin` middleware.
- Use ObjectId references for relationships (Client, Service, Membership) and populate where useful.
- Prefer soft-deletes (isActive) for business-critical records.

