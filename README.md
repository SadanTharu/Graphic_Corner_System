# Graphic Corner - Creative Agency Management System

A full-stack modern, responsive application for managing creative services including graphics design, video editing, 3D rendering, and AI services.

## 🎨 Features

### Public Features
- **Landing Page** with hero section, features, packages, and testimonials
- **Services Catalog** with category filtering
- **Authentication** (Login/Register with JWT)

### Customer Dashboard
- **Order Management** with real-time status tracking
- **StatusStepper Component** - Visual progress tracker for orders
- **Service Request** - Browse and select services/packages
- **Wallet Management** - Top-up balance and view transactions
- **Order History** with detailed views

### Admin Dashboard
- **Overview** - Business metrics and recent orders
- **Service Management** - CRUD operations for services
- **Financial Dashboard** with Recharts:
  - Bar Chart: Target vs Actual Sales
  - Pie Chart: Revenue by Service Type
  - Transaction History
- **Team Management** with Kanban Board:
  - Drag & Drop task organization
  - Task assignment to team members
  - Team member profiles

### Team Member Dashboard
- **Task Management** - View assigned tasks and orders
- **File Management**:
  - Download raw footage
  - Upload watermark previews
  - Upload final files/links

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Dark Mode Theme)
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **State Management:** React Context API
- **Charts:** Recharts
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud Database)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **File Storage:** Cloudinary (Cloud Storage)
- **File Upload:** Multer + Cloudinary SDK
- **Validation:** Express Validator
- **Logging:** Morgan

## 🎨 Design System

- **Primary Color:** `#E63946` (Red)
- **Background:** `#1A1A1A` (Dark Grey)
- **Secondary BG:** `#0F0F0F` (Darker)
- **Text:** `#FFFFFF` (White) / `#B0B0B0` (Grey)

## 📁 Project Structure

```
Graphic_Corner_System/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DashboardNavbar.jsx
│   │   │   ├── StatusStepper.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── layouts/         # Layout components
│   │   │   ├── PublicLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── public/      # Public pages
│   │   │   ├── customer/    # Customer dashboard
│   │   │   ├── admin/       # Admin dashboard
│   │   │   └── team/        # Team member pages
│   │   ├── data.js          # Mock data (for demo)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                 # Express Backend API
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Order.js
│   │   ├── Task.js
│   │   └── Transaction.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── services.js
│   │   ├── orders.js
│   │   ├── tasks.js
│   │   ├── wallet.js
│   │   └── upload.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js
│   ├── scripts/            # Utility scripts
│   │   └── seed.js
│   ├── uploads/            # File upload directory
│   ├── server.js           # Entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── package.json            # Root package.json for scripts
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Graphic_Corner_System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend and backend dependencies
npm run install:all
```

### 3. Configure Environment Variables

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas - Get from https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/graphic_corner?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary - Get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=graphic_corner
MAX_FILE_SIZE=52428800
```

**Setup Guides:**
- MongoDB Atlas: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Cloudinary: See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)
 & Cloud Storage

**MongoDB Atlas:**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Get connection string and add to `.env`

**Cloudinary:**
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to `.env`

For detailed instructions, see [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)
6
### 5. Seed the Database

Make sure MongoDB Atlas is configured
Make sure MongoDB is running, then seed the database:
```bash
npm run seed
```

This will create:
- Admin, Team members, and Customer accounts
- Sample services
- Sample orders and tasks

### 5. Start Development Servers

#### Option 1: Run Both Servers Concurrently (Recommended)
```bash
npm run dev
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:5000`

## 👥 Demo Credentials

### Admin Account
- **Email:** `admin@graphiccorner.lk`
- **Password:** `admin123`

### Team Member Account
- **Email:** `nimal@graphiccorner.lk`
- **Password:** `team123`

### Customer Account
- **Email:** `kasun@example.com`
- **Password:** `customer123`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/team` - Get team members
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Orders
- `GET /api/orders` - Get all orders (filtered by role)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/payment` - Upload payment
- `POST /api/orders/:id/files` - Upload files (Team)
- `POST /api/orders/:id/notes` - Add note/comment
- `POST /api/orders/:id/revision` - Request revision

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transactions
- `POST /api/wallet/topup` - Top up wallet
- `POST /api/wallet/pay` - Make payment from wallet

### Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

## 🎯 Key Components

### StatusStepper Component
Visual progress tracker showing 6 steps:
1. Pending Approval
2. Advance Payment (25%)
3. Work in Progress
4. Review Watermark
5. Final Payment
6. Completed

### Service Cards
Displays services with category badges, price ranges, delivery time, and interactive actions.

### Financial Charts
- **Bar Chart:** Monthly target vs actual sales comparison
- **Pie Chart:** Revenue breakdown by service category

## 🎨 Services & Packages

### Services Categories
- **Graphics:** Logo Design, Social Media Posts, Flyers
- **Video:** Short Reels, YouTube Editing, Thumbnails
- **3D:** Product Rendering, Animation
- **AI:** Image Generation, Content Writing

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly controls
- Optimized for all screen sizes

## 🔐 Security

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Input validation with express-validator

## 📦 Build for Production

### Build Frontend
```bash
cd frontend
npm run build
```

### Start Backend
```bash
cd backend
npm start
```

## 🚧 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Chat system between customers and team
- [ ] Mobile app (React Native)
- [ ] File preview system
- [ ] Automated invoicing

## 📄 License

This project is created for demonstration purposes.

## 👨‍💻 Development

Built with ❤️ using React, Express, MongoDB, and modern web technologies.

---

For any questions or issues, please open an issue on the repository.
