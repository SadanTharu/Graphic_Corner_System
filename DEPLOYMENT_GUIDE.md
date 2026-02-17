# 🚀 Free Deployment Guide - Graphic Corner System

This guide covers deploying the full-stack app using **free tiers** of:

| Service        | What it hosts        | Free Tier                          |
|----------------|----------------------|------------------------------------|
| **Railway**    | Backend API (Node.js)| $5 free credit/month, no cold starts |
| **Vercel**     | Frontend (React SPA) | 100 GB bandwidth/month             |
| **MongoDB Atlas** | Database          | 512 MB storage (already configured)|
| **Cloudinary** | File uploads         | 25 credits/month (already configured)|

---

## Prerequisites

- A **GitHub account** with this repo pushed to it
- A [Railway](https://railway.app) account (sign up with GitHub)
- A [Vercel](https://vercel.com) account (sign up with GitHub)

---

## Step 1: Push Code to GitHub

Make sure all your code is committed and pushed:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

---

## Step 2: Deploy Backend on Railway

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `Graphic_Corner_System` repository
4. Railway will detect the project — click on the created service

### Configure Root Directory

5. Go to **Settings** tab → **Source** section
6. Set **Root Directory** to: `backend`
7. Set **Watch Paths** to: `/backend/**`

### Configure Build & Start

8. In **Settings** tab → **Deploy** section:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Add Environment Variables

9. Go to the **Variables** tab and add these (click **"+ New Variable"** for each):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |
   | `MONGODB_URI` | `mongodb+srv://sadantharu:12345@cluster0.7be0hzc.mongodb.net/graphic_corner?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` |
   | `JWT_EXPIRE` | `30d` |
   | `CLOUDINARY_CLOUD_NAME` | `drtabdhu3` |
   | `CLOUDINARY_API_KEY` | `523595574769263` |
   | `CLOUDINARY_API_SECRET` | `QN4neTrSmzlozM0kl7BEv5jmP8Q` |
   | `CLOUDINARY_FOLDER` | `graphic_corner` |
   | `MAX_FILE_SIZE` | `52428800` |
   | `MAILJET_API_KEY` | `932c77fbad7883ce7313635647b0b45f` |
   | `MAILJET_API_SECRET` | `5466fada10fb5499208ef25ec40ff16f` |
   | `MAILJET_FROM_EMAIL` | `sadantharu@gmail.com` |
   | `MAILJET_FROM_NAME` | `Graphic Corner` |
   | `FRONTEND_URL` | *(add after Step 4, e.g. `https://graphic-corner.vercel.app`)* |

   > 💡 **Tip**: You can click **"RAW Editor"** and paste all variables at once in `KEY=VALUE` format.

### Generate a Public URL

10. Go to **Settings** tab → **Networking** section
11. Click **"Generate Domain"** — Railway will give you a URL like:
    ```
    https://graphic-corner-api-production.up.railway.app
    ```

12. **Copy this URL** — you'll need it for the frontend deployment.

### Verify Backend

13. Visit `https://your-railway-url.up.railway.app/api/health` in your browser
14. You should see: `{"status":"ok","message":"Server is running"}`

---

## Step 3: Deploy Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `Graphic_Corner_System` repo
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **"Edit"** and set to `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. Expand **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-railway-url.up.railway.app` |

   > ⚠️ **Replace with your actual Railway URL from Step 2!** No trailing slash.

6. Click **"Deploy"**

7. Wait for the build. Your frontend will be available at something like:
   ```
   https://graphic-corner-system.vercel.app
   ```

---

## Step 4: Connect Frontend URL to Backend (CORS)

After the frontend is deployed on Vercel:

1. Go back to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your project → your backend service
3. Go to **Variables** tab
4. Add or update: `FRONTEND_URL` = `https://graphic-corner-system.vercel.app` (your actual Vercel URL, no trailing slash)
5. Railway will auto-redeploy with the new variable

---

## Step 5: Seed the Database (Optional)

To populate initial data (services, admin user, etc.), run from your local machine:

```bash
cd backend
npm run seed
```

This uses the `MONGODB_URI` from your local `.env` file, which already points to the Atlas cluster shared with production.

---

## Step 6: Verify Everything Works

1. **Backend Health**: Visit `https://your-railway-url.up.railway.app/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Register**: Create a new account
4. **Login**: Sign in and check the dashboard
5. **Test features**: Create orders, upload files, manage services

---

## ⚠️ Important Notes

### Railway Free Tier
- **$5 free credit/month** — enough for a small Node.js API running 24/7
- **No cold starts** — unlike Render, Railway keeps your app running
- **500 hours of execution** per month on the free plan
- If you run out of credits, the service pauses until next month
- Monitor usage at: Railway Dashboard → **Usage** tab

### Vercel Free Tier
- **100 GB bandwidth/month** — more than enough for testing
- **Serverless Functions**: 100 GB-hours/month
- Automatic HTTPS and CDN included

### Security Reminder
- Change `JWT_SECRET` to a strong random string in production
- Consider rotating your MongoDB password, Cloudinary keys, and Mailjet keys since they were committed to `.env.example`

---

## 🔄 Auto-Deployment

Both Railway and Vercel support auto-deployment:
- Every `git push` to `main` triggers a new deployment automatically on both services
- No manual steps needed after initial setup

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Railway build fails | Check **Deploy Logs** in Railway dashboard. Ensure Root Directory is `backend` |
| CORS errors in browser | Make sure `FRONTEND_URL` env var on Railway matches your Vercel URL exactly (no trailing slash) |
| API calls fail on frontend | Verify `VITE_API_URL` on Vercel points to your Railway URL (no trailing slash) |
| Build fails on Vercel | Ensure Root Directory is set to `frontend` |
| MongoDB connection fails | Check `MONGODB_URI` env var is set correctly on Railway |
| Images don't upload | Verify Cloudinary env vars are set on Railway |
| Railway shows "No domains" | Go to Settings → Networking → Generate Domain |
| Free credits running out | Check Railway Usage tab; reduce activity or upgrade |

---

## Alternative Frontend: Netlify

A `netlify.toml` is also included if you prefer Netlify over Vercel:
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub → Select your repo
4. **Base directory**: `frontend`
5. **Build command**: `npm run build`
6. **Publish directory**: `frontend/dist`
7. Add env var: `VITE_API_URL` = your Railway backend URL
8. Deploy!
