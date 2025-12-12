# Graphic Corner System - Setup & Usage Guide

## Overview
This is a full-stack web application for managing graphic design services, clients, and payments with admin and client dashboards.

## Project Structure

### Backend (Node.js + Express + MongoDB)
```
backend/
├── src/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── packageController.js
│   │   ├── contentController.js
│   │   ├── paymentController.js
│   │   └── serviceController.js
│   ├── middleware/         # Auth & Admin middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── package.json
└── .env                    # Environment variables
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Card.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── CreateCustomer.jsx
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── AuthPages.jsx
│   │   ├── ClientDashboard.jsx
│   │   ├── PublicHome.jsx
│   │   └── ServicesPage.jsx
│   ├── styles/             # CSS stylesheets
│   │   ├── global.css
│   │   ├── navbar.css
│   │   ├── auth.css
│   │   ├── admin-dashboard.css
│   │   ├── client-dashboard.css
│   │   └── forms.css
│   ├── api.js              # API client configuration
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
└── package.json
```

## Environment Setup

### Backend (.env)
Create a `.env` file in the `backend` directory:

```properties
PORT=4000
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_here
ADMIN_PASSWORD=MySecretAdminPassword123
```

### Frontend (already configured)
The frontend API client is configured to use `http://localhost:4000/api`

## Getting Started

### 1. Create Admin Account (First Time Only)

Send a POST request to create the admin account:

**Using curl (PowerShell):**
```powershell
$headers = @{"Content-Type" = "application/json"}
$body = '{"adminKey": "MySecretAdminPassword123"}'
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/seed-admin" -Method POST -Headers $headers -Body $body
```

**Using Postman:**
- URL: `http://localhost:4000/api/auth/seed-admin`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: `{"adminKey": "MySecretAdminPassword123"}`

### 2. Login as Admin

Use these credentials to login:
- **Email:** `admin@local`
- **Password:** `MySecretAdminPassword123` (or your `ADMIN_PASSWORD` from .env)

### 3. Create Customers

Once logged in as admin:
1. Go to Admin Dashboard
2. Click "+ Create Customer"
3. Fill in the customer details:
   - **Client ID:** Unique identifier (required)
   - **Name:** Customer name
   - **Email:** Customer email (required, must be unique)
   - **Password:** Secure password (required)
   - **Contact:** Phone number or contact info
4. Click "Create Customer"

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/seed-admin` - Create admin (one-time)

### Clients (Admin Only)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/me` - Get current user profile

### Packages (Admin Management)
- `GET /api/packages` - List all packages
- `POST /api/packages` - Create package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package
- `GET /api/packages/client/:clientId` - Get packages for client

### Services (Public)
- `GET /api/services` - List services
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Contents & Payments
Similar endpoints available for:
- `/api/contents` - Manage content
- `/api/payments` - Manage payments

## Features

### Admin Features
✅ Create, read, update, delete customers
✅ Manage services, packages, and content
✅ Track payments
✅ View all customers in a grid view
✅ Delete customers

### Client Features
✅ View own profile
✅ View assigned packages
✅ View own payments
✅ Access services

### Authentication
✅ JWT token-based authentication
✅ Role-based access control (admin/client)
✅ Secure password hashing (bcryptjs)
✅ 30-day token expiration

## UI Features

### Styling
- Modern gradient design (purple/indigo theme)
- Responsive layout for mobile/tablet/desktop
- Smooth transitions and animations
- Professional card-based design

### Components
- Beautiful login form with error handling
- Admin dashboard with customer management
- Customer creation form with validation
- Navbar with active link indicators
- Logout functionality

## Backend Architecture

The backend follows MVC pattern:

**Controllers** - Handle business logic and API responses
**Routes** - Define API endpoints and apply middleware
**Models** - MongoDB schemas with validation
**Middleware** - Authentication and authorization checks

Benefits:
- Cleaner code organization
- Easier to test
- Better separation of concerns
- Scalable structure

## Running the Application

### Start Backend
```bash
cd backend
npm install
npm start
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` (frontend) and the backend runs on `http://localhost:4000`

## Default Credentials

After running the seed-admin endpoint:

| Field | Value |
|-------|-------|
| Email | admin@local |
| Password | MySecretAdminPassword123 |
| Role | admin |

## Troubleshooting

### "Cannot POST /auth/seed-admin"
- Make sure you're using the full path: `/api/auth/seed-admin`
- Check that the backend server is running on port 4000

### "Invalid credentials" on login
- Verify admin account exists by running seed-admin endpoint
- Check email and password match exactly
- Ensure `.env` variables are set correctly

### CORS errors
- Backend already has CORS enabled in `app.js`
- Ensure frontend is making requests to `http://localhost:4000/api`

## File Reference

### Controllers Added
- `authController.js` - Login and admin seeding
- `clientController.js` - Customer CRUD operations
- `packageController.js` - Package management
- `contentController.js` - Content management
- `paymentController.js` - Payment tracking
- `serviceController.js` - Service management

### Components Added
- `CreateCustomer.jsx` - Customer creation form

### Styles Added
- `global.css` - Global styles and utilities
- `navbar.css` - Navigation bar styling
- `auth.css` - Authentication pages styling
- `admin-dashboard.css` - Admin dashboard styling
- `client-dashboard.css` - Client dashboard styling
- `forms.css` - Form and message styling

## Future Enhancements

- [ ] Profile editing for clients
- [ ] File upload for content
- [ ] Email notifications
- [ ] Payment processing integration
- [ ] Advanced reporting and analytics
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] Search and filter functionality
