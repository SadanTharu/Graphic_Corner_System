# 🚀 Free Deployment Guide - Graphic Corner System

This guide covers deploying the full-stack app using **free tiers** of:

| Service       | What it hosts        | Free Tier Limits                  |
|---------------|----------------------|-----------------------------------|
| **Render**    | Backend API (Node.js)| Spins down after 15 min inactivity, 750 hrs/month |
| **Vercel**    | Frontend (React SPA) | 100 GB bandwidth/month            |
| **MongoDB Atlas** | Database         | 512 MB storage (already in use)   |
| **Cloudinary**| File uploads         | 25 credits/month (already in use) |

---

## Prerequisites

- A GitHub account with this repo pushed to it
- Accounts on [Render](https://render.com), [Vercel](https://vercel.com) (sign up with GitHub for easiest setup)

---

## Step 1: Push Code to GitHub

Make sure all your code is committed and pushed:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

---

## Step 2: Deploy Backend on Render

### Option A: Using the Dashboard (Recommended)

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `Graphic_Corner_System`
4. Configure:
   - **Name**: `graphic-corner-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

5. Click **"Advanced"** → **"Add Environment Variable"** and add these:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://sadantharu:12345@cluster0.7be0hzc.mongodb.net/graphic_corner?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `your-strong-secret-key-here` (change this!) |
   | `CLOUDINARY_CLOUD_NAME` | `drtabdhu3` |
   | `CLOUDINARY_API_KEY` | `523595574769263` |
   | `CLOUDINARY_API_SECRET` | `QN4neTrSmzlozM0kl7BEv5jmP8Q` |
   | `CLOUDINARY_FOLDER` | `graphic_corner` |
   | `MAX_FILE_SIZE` | `52428800` |
   | `MAILJET_API_KEY` | `932c77fbad7883ce7313635647b0b45f` |
   | `MAILJET_API_SECRET` | `5466fada10fb5499208ef25ec40ff16f` |
   | `MAILJET_FROM_EMAIL` | `sadantharu@gmail.com` |
   | `MAILJET_FROM_NAME` | `Graphic Corner` |
   | `FRONTEND_URL` | *(add after deploying frontend, e.g. `https://graphic-corner.vercel.app`)* |

6. Click **"Create Web Service"**

7. Wait for the build to complete. Your backend will be available at:
   ```
   https://graphic-corner-api.onrender.com
   ```

8. Test it by visiting: `https://graphic-corner-api.onrender.com/api/health`

### Option B: Using render.yaml (Blueprint)

1. Go to [https://dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
2. Click **"New Blueprint Instance"**
3. Select your repo
4. Render will auto-detect the `render.yaml` file and configure the service
5. Fill in the environment variables marked as `sync: false`

---

## Step 3: Deploy Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `Graphic_Corner_System` repo
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and set to `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. Expand **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://graphic-corner-api.onrender.com` |

   > ⚠️ Replace with your actual Render backend URL from Step 2!

6. Click **"Deploy"**

7. Your frontend will be available at:
   ```
   https://graphic-corner-system.vercel.app
   ```

---

## Step 4: Connect Frontend URL to Backend

After the frontend is deployed:

1. Go back to your Render dashboard → your backend service
2. Go to **"Environment"** tab
3. Add/Update: `FRONTEND_URL` = `https://graphic-corner-system.vercel.app` (your actual Vercel URL)
4. Click **"Save Changes"** — the service will auto-redeploy

---

## Step 5: Seed the Database (Optional)

If you need to populate initial data, run from your local machine:

```bash
cd backend
# Create a .env file with your production MONGODB_URI
npm run seed
```

---

## Step 6: Verify Everything Works

1. **Backend Health**: Visit `https://your-backend.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Login**: Try registering a new account or logging in
4. **Test features**: Create orders, upload files, etc.

---

## ⚠️ Important Notes

### Render Free Tier Limitations
- **Cold starts**: The free tier spins down after 15 minutes of inactivity. The first request after that takes ~30-60 seconds to wake up.
- **750 hours/month**: Enough for one always-running service, but it will sleep when inactive.

### Alternative Free Backend: Railway
If Render is too slow, try [Railway](https://railway.app):
1. Sign up → New Project → Deploy from GitHub
2. Select your repo, set Root Directory to `backend`
3. Add the same environment variables
4. Railway gives $5 free credit/month

### Alternative Frontend: Netlify
A `netlify.toml` is also included. To deploy on Netlify:
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub → Select your repo
4. **Base directory**: `frontend`
5. **Build command**: `npm run build`
6. **Publish directory**: `frontend/dist`
7. Add env var: `VITE_API_URL` = your backend URL
8. Deploy!

---

## 🔄 Auto-Deployment

Both Render and Vercel support auto-deployment:
- Every `git push` to `main` triggers a new deployment automatically
- No manual steps needed after initial setup

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend returns 503 | Wait 30-60s for cold start on free tier |
| CORS errors | Make sure `FRONTEND_URL` env var on Render matches your Vercel URL exactly (no trailing slash) |
| API calls fail on frontend | Verify `VITE_API_URL` on Vercel points to your Render URL (no trailing slash) |
| Build fails on Vercel | Ensure Root Directory is set to `frontend` |
| Build fails on Render | Ensure Root Directory is set to `backend` |
| MongoDB connection fails | Check `MONGODB_URI` env var is set correctly on Render |
| Images don't upload | Verify Cloudinary env vars are set on Render |
