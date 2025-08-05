# Deployment Guide

## Backend Deployment (Railway)

1. **Push to GitHub**
   ```bash
   git push origin deployment-config
   ```

2. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your bet-tracker repository
   - Set root directory to `backend`
   - Railway will auto-detect Node.js and deploy

4. **Add PostgreSQL Database**
   - In your Railway project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL environment variable

5. **Set Environment Variables**
   - In Railway dashboard, go to your backend service
   - Variables tab → Add these:
     ```
     JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
     NODE_ENV=production
     PORT=5000
     ```

6. **Run Migrations**
   - In Railway dashboard, go to Deployments tab
   - In the latest deployment, click "View Logs"
   - Wait for deployment to complete
   - Migrations should run automatically on startup

## Frontend Deployment (Netlify)

1. **Update API URL**
   - Get your Railway backend URL (e.g., `https://your-app.railway.app`)
   - Update `frontend/src/services/api.ts`:
     ```typescript
     const API_BASE = 'https://your-app.railway.app';
     ```

2. **Build and Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "New site from Git"
   - Select your repository
   - Set build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

3. **Set Environment Variables** (if needed)
   - In Netlify dashboard → Site settings → Environment variables
   - Add any frontend environment variables

## Alternative: Render Deployment

If you prefer Render over Railway:

1. **Backend on Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service from GitHub
   - Set:
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Add PostgreSQL database (Render → New → PostgreSQL)
   - Set environment variables as above

## Testing

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

2. **Frontend Access**
   - Visit your Netlify URL
   - Test login/registration
   - Verify API calls work

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
PORT=5000
```

### Frontend
- Update API_BASE in `src/services/api.ts` to your deployed backend URL

## Troubleshooting

1. **CORS Issues**: Ensure backend allows frontend domain in CORS settings
2. **Database Connection**: Verify DATABASE_URL is correctly set
3. **Build Failures**: Check Node.js version compatibility (use Node 18)
4. **API 404s**: Verify backend routes are properly configured and deployed