# 🎨 Graphic Corner System - Complete Project Guide

## Project Overview

Graphic Corner System is a full-stack web application for managing graphic design services. It includes:
- **Public Website** - Marketing pages for visitors
- **Client Dashboard** - Project and payment management
- **Admin Dashboard** - Business management and client management
- **Backend API** - RESTful API with role-based access

---

## 📁 Project Structure

```
Graphic_Corner_System/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   │   ├── authController.js
│   │   │   ├── clientController.js
│   │   │   ├── packageController.js
│   │   │   ├── contentController.js
│   │   │   ├── paymentController.js
│   │   │   ├── serviceController.js
│   │   │   └── contactController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication
│   │   │   └── admin.js        # Admin-only protection
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── Client.js
│   │   │   ├── Package.js
│   │   │   ├── Content.js
│   │   │   ├── Payment.js
│   │   │   ├── Service.js
│   │   │   └── Message.js
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── clients.js
│   │   │   ├── packages.js
│   │   │   ├── contents.js
│   │   │   ├── payments.js
│   │   │   ├── services.js
│   │   │   └── contact.js
│   │   ├── app.js              # Express configuration
│   │   └── server.js           # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PublicHome.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── AuthPages.jsx
│   │   │   ├── ClientDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── CreateCustomer.jsx
│   │   ├── styles/
│   │   │   ├── app.css
│   │   │   ├── global.css
│   │   │   ├── navbar.css
│   │   │   ├── auth.css
│   │   │   ├── forms.css
│   │   │   ├── admin-dashboard.css
│   │   │   ├── client-dashboard.css
│   │   │   ├── public-home.css
│   │   │   ├── public-services.css
│   │   │   ├── public-about.css
│   │   │   └── public-contact.css
│   │   ├── api.js              # API client
│   │   ├── App.jsx             # Main app
│   │   ├── main.jsx            # Entry point
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── SETUP_GUIDE.md
```

---

## 🚀 Features by Section

### 1. PUBLIC WEBSITE (Anyone Can View)

#### 🏠 Home Page
- Hero banner with CTA buttons
- "Why Choose Us" section with 6 feature cards
- Statistics section (500+ clients, 1000+ projects, etc.)
- Call-to-action section
- Responsive design with smooth animations

#### 🛠️ Services Page
- Dynamic service cards with pricing
- Comparison table
- FAQ section
- Fallback services if API fails
- Beautiful hover animations

#### ℹ️ About Page
- Company story section
- Mission and values cards
- Team member profiles
- Client testimonials with star ratings
- CTA to start a project

#### 📧 Contact Page
- Contact form with validation
- Contact information display
- WhatsApp integration link
- Social media links
- Success/error message handling

### 2. CLIENT DASHBOARD (Login Required)

#### 📊 Dashboard Overview
- Welcome message
- Statistics cards (packages, pending tasks, payments, completed)
- Tab-based navigation
- Responsive layout

#### 📦 Packages Tab
- View all assigned packages
- Package details (name, description, price, duration)
- Card-based layout

#### 📋 Content Progress Tab
- Active tasks table
- Completed items table
- Status badges
- Deadline tracking
- Drive links for file access

#### 💰 Payments Tab
- Payment history table
- Amount and status display
- Due dates
- Color-coded status badges

#### 👤 Profile Tab
- User profile information
- Client ID, email, contact details
- Avatar and role display

### 3. ADMIN DASHBOARD (Login Required)

#### 👥 Clients Management
- List all clients in grid view
- Create new customers with form
- Customer cards with all details
- Delete customer functionality
- Search and sort capabilities

#### 📦 Packages Management
- Add/edit/delete packages
- Assign packages to clients

#### 📋 Content Management
- Add content items with deadlines
- Track content progress
- Upload final deliverables with Drive links

#### 💰 Payments Management
- Record payment transactions
- Track payment status
- Update payment information

#### 🛠️ Services Manager
- Create, edit, delete services shown on public site
- Manage pricing and descriptions

---

## 🔐 Authentication & Authorization

### Login Flow
1. User enters email and password
2. Backend verifies credentials and password hash
3. JWT token issued for 30 days
4. Token stored in localStorage
5. API requests include Bearer token

### Admin Account Creation
```bash
POST /api/auth/seed-admin
Body: { "adminKey": "MySecretAdminPassword123" }
```

**Default Credentials (after seed):**
- Email: `admin@local`
- Password: `MySecretAdminPassword123`

### Protected Routes
- `/admin/*` - Only admin users
- `/client/*` - Only logged-in clients
- `/auth/login` - Public access
- `/` `/services` `/about` `/contact` - Public access

---

## 🎨 Design System

### Color Palette
- **Primary:** #667eea (Purple)
- **Secondary:** #764ba2 (Deep Purple)
- **Success:** #38a169 (Green)
- **Error:** #c53030 (Red)
- **Warning:** #f6ad55 (Orange)
- **Light BG:** #f7fafc (Light Gray)
- **Border:** #e2e8f0 (Gray)

### Typography
- **Sans-serif:** System fonts (-apple-system, BlinkMacSystemFont, etc.)
- **Headings:** 800 weight
- **Body:** 400-500 weight
- **Small text:** 600 weight

### Components
- Cards with hover animations
- Gradient backgrounds
- Smooth transitions (0.2s-0.3s)
- Responsive grid layouts
- Tab-based navigation
- Tables with hover states

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/seed-admin         - Create admin (one-time)
```

### Clients (Admin Only)
```
GET    /api/clients                 - List all clients
POST   /api/clients                 - Create client
PUT    /api/clients/:id             - Update client
DELETE /api/clients/:id             - Delete client
GET    /api/clients/me              - Get current user profile
```

### Packages
```
GET    /api/packages                - List all (admin)
POST   /api/packages                - Create (admin)
PUT    /api/packages/:id            - Update (admin)
DELETE /api/packages/:id            - Delete (admin)
GET    /api/packages/client/:clientId - Get client packages
```

### Contents
```
GET    /api/contents                - List all (admin)
POST   /api/contents                - Create (admin)
PUT    /api/contents/:id            - Update (admin)
DELETE /api/contents/:id            - Delete (admin)
GET    /api/contents/client/:clientId - Get client contents
```

### Payments
```
GET    /api/payments                - List all (admin)
POST   /api/payments                - Create (admin)
PUT    /api/payments/:id            - Update (admin)
DELETE /api/payments/:id            - Delete (admin)
GET    /api/payments/client/:clientId - Get client payments
```

### Services
```
GET    /api/services                - List all (public)
POST   /api/services                - Create (admin)
PUT    /api/services/:id            - Update (admin)
DELETE /api/services/:id            - Delete (admin)
```

### Contact Messages
```
POST   /api/contact                 - Submit contact form (public)
GET    /api/contact                 - Get messages (admin)
PUT    /api/contact/:id/read        - Mark as read (admin)
DELETE /api/contact/:id             - Delete (admin)
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (cloud or local)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create .env file:**
```env
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key_here
ADMIN_PASSWORD=MySecretAdminPassword123
```

3. **Create admin account:**
```bash
# Use Postman or curl to POST to /api/auth/seed-admin
```

4. **Start server:**
```bash
npm start
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

---

## 📝 Data Models

### Client
```javascript
{
  clientId: String (unique),
  name: String,
  contact: String,
  email: String (unique),
  password: String (hashed),
  status: String (active/inactive),
  role: String (client/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Package
```javascript
{
  clientId: String,
  packageName: String,
  description: String,
  price: Number,
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Content
```javascript
{
  clientId: String,
  title: String,
  description: String,
  status: String (pending/in_progress/completed),
  deadline: Date,
  driveLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  clientId: String,
  title: String,
  amount: Number,
  status: String (pending/paid),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Service
```javascript
{
  name: String,
  description: String,
  price: Number,
  duration: String,
  icon: String (emoji),
  createdAt: Date,
  updatedAt: Date
}
```

### Message (Contact)
```javascript
{
  name: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  status: String (new/read/replied),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 User Flows

### Admin User Flow
1. Login with admin@local
2. Admin Dashboard → Create Customer
3. Fill form and submit
4. Customer appears in dashboard
5. Can manage packages, content, payments

### Client User Flow
1. Receive login credentials from admin
2. Navigate to /auth/login
3. Login with provided email/password
4. Access Client Dashboard
5. View packages, content progress, payments
6. Download files from Drive links

### Visitor Flow
1. Visit public website
2. Browse Home page
3. View Services with pricing
4. Read About us page
5. Submit contact form
6. See success message

---

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Deploy

---

## 🔒 Security Features

- ✅ JWT authentication with 30-day expiration
- ✅ Bcrypt password hashing
- ✅ Admin-only middleware protection
- ✅ CORS enabled for cross-origin requests
- ✅ Role-based access control
- ✅ Protected API endpoints

---

## 📱 Responsive Design

- **Desktop:** Full layout with sidebars
- **Tablet:** Simplified navigation, grid layouts
- **Mobile:** Single column, touch-friendly buttons
- **Breakpoints:** 768px, 480px

---

## 🎓 Learning Resources

### Technologies Used
- **Frontend:** React, Vite, CSS3, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Styling:** CSS Grid, Flexbox, CSS Variables

### Key Concepts
- RESTful API design
- MVC architecture
- React hooks (useState, useEffect)
- Protected routes with ProtectedRoute component
- Gradient backgrounds and smooth animations

---

## 📞 Support & Troubleshooting

### Common Issues

**"Cannot POST /auth/seed-admin"**
- Make sure backend is running on port 4000
- Use correct full path: `/api/auth/seed-admin`

**"Invalid credentials" on login**
- Verify admin account exists (run seed-admin)
- Check email and password spelling
- Ensure .env variables are set

**CORS errors**
- Backend already has CORS enabled
- Check frontend API URL matches backend URL

**Port conflicts**
- Frontend runs on port 5173 (Vite)
- Backend runs on port 4000
- Change PORT in .env if needed

---

## 🎉 Next Steps

1. **Customize branding:**
   - Update company name in Navbar
   - Change colors in CSS variables
   - Update About page content

2. **Add more services:**
   - Admin can create services via dashboard
   - Services appear on public site automatically

3. **Add admin pages:**
   - Messages page to view contact submissions
   - Analytics/reporting dashboard
   - Client communication panel

4. **Email integration:**
   - Add NodeMailer for contact form emails
   - Send payment reminders
   - Welcome emails for new clients

5. **Enhanced features:**
   - File upload for content
   - Invoice generation
   - Calendar for deadlines
   - Team management

---

## 📄 License

This project is private and for personal/business use only.

---

**Last Updated:** December 2025
**Version:** 1.0.0
