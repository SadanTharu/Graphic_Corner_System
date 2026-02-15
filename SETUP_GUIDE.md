# Graphic Corner System - Setup Guide

## Quick Start

### 1. Install All Dependencies
```bash
npm install
npm run install:all
```

### 2. Setup MongoDB Atlas
MongoDB Atlas is a cloud-hosted MongoDB service (free tier available).

**Steps:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `graphic_corner`

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/graphic_corner?retryWrites=true&w=majority
```

### 3. Setup Cloudinary
Cloudinary provides cloud-based image and video management (free tier available).

**Steps:**
1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. After login, go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 4. Configure Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/graphic_corner?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary Credentials (from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary Settings
CLOUDINARY_FOLDER=graphic_corner
MAX_FILE_SIZE=52428800
```

### 5. Seed Database
```bash
# From project root
npm run seed
```

This creates:
- 1 Admin user
- 2 Team members
- 2 Customer users
- 6 Sample services
- 2 Sample orders
- 3 Sample tasks

### 6. Start Development Servers
```bash
# From project root - runs both frontend and backend
npm run dev
```

**OR run separately:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Demo Accounts

### Admin Dashboard
```
Email: admin@graphiccorner.lk
Password: admin123
Access: Full system control, analytics, team management
```

### Team Member Dashboard
```
Email: nimal@graphiccorner.lk
Password: team123
Access: Task management, file uploads, order updates
```

### Customer Dashboard
```
Email: kasun@example.com
Password: customer123
Access: Create orders, track progress, wallet management
```

## Testing Backend API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@graphiccorner.lk","password":"admin123"}'
```

**Get Services:**
```bash
curl http://localhost:5000/api/services
```

**Get Orders (with auth):**
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import collection (create one from API docs)
2. Set base URL: `http://localhost:5000`
3. For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`

## Project Structure Verification

After setup, your structure should look like:

```
Graphic_Corner_System/
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── scripts/
│   ├── uploads/
│   ├── server.js
│   ├── .env
│   └── package.json
├── package.json
└── README.md
```

## Common Issues & Solutions

### Issue: MongoDB Atlas Connection Failed
**Solution:**
- Verify connection string format is correct
- Check username and password (no special characters unescaped)
- Whitelist your IP address in MongoDB Atlas:
  - Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
- Ensure database name is `graphic_corner`

### Issue: Cloudinary Upload Failed
**Solution:**
- Verify all three Cloudinary credentials are correct
- Check Cloud Name, API Key, and API Secret
- Ensure you're using the correct account
- Check Cloudinary dashboard for quota limits

### Issue: Port Already in Use
**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=5001
```

### Issue: CORS Errors
**Solution:**
- Verify `FRONTEND_URL` in `backend/.env` matches frontend URL
- Check Vite proxy in `frontend/vite.config.js`

### Issue: JWT Token Invalid
**Solution:**
- Clear localStorage in browser
- Re-login to get fresh token
- Verify `JWT_SECRET` in `backend/.env`

### Issue: Modules Not Found
**Solution:**
```bash
# Reinstall dependencies
cd frontend && npm install
cd ../backend && npm install
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, test

# Commit changes
git add .
git commit -m "Add: your feature"
```

### 2. Backend Changes
```bash
cd backend

# Make model/route changes
# Test with Postman or cURL

# Restart backend
npm run dev
```

### 3. Frontend Changes
```bash
cd frontend

# Make component changes
# Hot reload will update automatically

# Build for production
npm run build
```

### 4. Database Reset
```bash
# Drop database and reseed
npm run seed
```

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway/Render)
```bash
# Set environment variables on platform
# Deploy backend/ folder
```

### Database (MongoDB Atlas)
```bash
# Update MONGODB_URI with Atlas connection string
# Ensure IP whitelist is configured
```Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/graphic_corner` |
| `JWT_SECRET` | Secret key for JWT | `your-secret-key` |
| `JWT_EXPIRE` | Token expiration time | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `CLOUDINARY_FOLDER` | Upload folder name | `graphic_corner` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `52428800` (50MB)
### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/graphic_corner` |
| `JWT_SECRET` | Secret key for JWT | `your-secret-key` |
| `JWT_EXPIRE` | Token expiration time | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Scripts Reference

### Root Package Scripts
| Script | Description |
|--------|-------------|
| `npm install` | Install root dependencies |
| `npm run install:all` | Install all dependencies (frontend + backend) |
| `npm run dev` | Run both servers concurrently |
| `npm run dev:frontend` | Run frontend only |
| `npm run dev:backend` | Run backend only |
| `npm run build:frontend` | Build frontend for production |
| `npm run seed` | Seed database with sample data |

### Backend Scripts
| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run seed` | Seed database |

### Frontend Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Next Steps

1. ✅ Complete setup above
2. 🔐 Test login with demo accounts
3. 🎨 Explore admin dashboard features
4. 📦 Create test orders as customer
5. 👥 Assign tasks as admin
6. 🔧 Start customizing for your needs

## Support

For issues or questions:
- Check [README.md](README.md) for detailed documentation
- Review API endpoints in README
- Check console logs for errors
- Verify environment variables are set correctly

---

**Happy Coding! 🚀**
