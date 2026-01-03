# Deployment Guide for Voicemation

## Architecture
- **Frontend**: React + Vite (Deploy to Vercel)
- **Backend**: Flask + Python (Deploy to Render)

## 🚀 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
The frontend is in `Voicemation/voicemation/` directory.

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Update API URLs** - Create `.env.production` in frontend:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo
   - Set root directory to: `Voicemation/voicemation`
   - Framework Preset: Vite
   - Add environment variable: `VITE_API_URL` with your backend URL
   - Deploy!

### Step 2: Update Frontend Code
After backend is deployed, update the API URLs in the frontend to use environment variables.

## 🐍 Backend Deployment (Railway - RECOMMENDED)

### Why Railway?
- Easy Python deployment
- Supports long-running processes
- Free tier available
- Works great with Flask

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project** → "Deploy from GitHub repo"

3. **Configure the deployment**:
   - Root directory: `/` (root of your repo)
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py` or `gunicorn app:app`

4. **Add Environment Variables** in Railway:
   ```
   GITHUB_TOKEN=your_github_token_here
   PORT=5001
   ```

5. **Install Gunicorn** (for production):
   Add to `requirements.txt`:
   ```
   gunicorn==21.2.0
   ```

6. **Update app.py** for production:
   Change the last line from:
   ```python
   app.run(debug=True, port=5001)
   ```
   To:
   ```python
   if __name__ == "__main__":
       app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
   ```

7. **Copy the Render URL** - You'll use this in frontend environment variables

## 🚀 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository

### Step 3: Configure Service
- **Name**: voicemation-backend (or your choice)
- **Environment**: Python 3
- **Region**: Choose closest to you
- **Branch**: main (or your branch)
- **Root Directory**: Leave empty (uses repo root)
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  gunicorn app:app
  ```

### Step 4: Add Environment Variables
Click "Environment" tab and add:
- **GITHUB_TOKEN**: Your GitHub personal access token
- **PORT**: 10000 (Render's default, will be auto-set)

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (may take 5-10 minutes first time)
3. Copy your service URL: `https://voicemation-backend.onrender.com`

### Step 6: Update Frontend
Update `.env.production` in frontend with your Render URL:
```
VITE_API_URL=https://voicemation-backend.onrender.com
```

## 📝 Final Checklist

### Frontend (Vercel)
- [ ] Root directory set to `Voicemation/voicemation`
- [ ] Environment variable `VITE_API_URL` added
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Backend (Render)
- [ ] `requirements.txt` includes `gunicorn`
- [ ] Environment variable `GITHUB_TOKEN` added
- [ ] CORS configured to allow frontend domain
- [ ] Build and Start commands configured

### After Deployment
- [ ] Update frontend `.env.production` with Render URL
- [ ] Redeploy frontend on Vercel
- [ ] Test the application end-to-end

## 🔧 CORS Configuration

Make sure your Flask backend allows requests from your Vercel domain:

```python
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://your-frontend.vercel.app",
            "http://localhost:5173"
        ],
        "supports_credentials": True
    }
})
```

## 🐛 Troubleshooting

### Issue: CORS errors
- Check backend CORS configuration in `app.py`
- Verify frontend is using correct API URL
- Add your Vercel domain to CORS origins

### Issue: 502/504 errors on Render
- Check Render service logs (click "Logs" tab)
- Ensure gunicorn is installed in `requirements.txt`
- Verify `gunicorn app:app` command is correct
- Check if PORT is properly configured

### Issue: Module not found
- Check all dependencies in `requirements.txt`
- Trigger manual rebuild in Render dashboard

### Issue: GitHub API errors
- Verify GITHUB_TOKEN is set in Render environment variables
- Check token has correct permissions
- Generate new token if expired

## 📦 What Gets Deployed Where

**Vercel (Frontend)**:
- React app from `Voicemation/voicemation/`
- Static files
- Environment: Node.js
- Free tier: Unlimited bandwidth

**Render (Backend)**:
- Flask API from root directory
- Python dependencies
- Manim library
- ffmpeg (pre-installed on Render)
- Environment: Python 3.9+
- Free tier: 750 hours/month (sleeps after 15 min inactivity)

## 💡 Tips

1. **Render Free Tier**: Service sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up
2. Keep backend logs open during first deployment
3. Test locally before deploying
4. Use Render's free tier for testing
5. Set up GitHub auto-deploys for both services
6. Monitor Render dashboard for build status and logs

## 🔄 Auto-Deployment

Both services can auto-deploy on git push:

**Vercel**: 
- Automatically detects new commits
- Deploys preview for PRs

**Render**:
- Enable "Auto-Deploy" in Settings
- Deploys on push to main branch
- View build logs in real-time
