# Deployment Checklist for Voicemation

## Pre-Deployment

### ✅ Code Ready
- [x] Frontend uses environment variables for API URL
- [x] Backend configured for production (PORT, host)
- [x] Gunicorn added to requirements.txt
- [x] CORS configuration in place (needs Vercel domain update)
- [x] .gitignore configured
- [x] Environment variable files created

### 📦 Files to Check
- [x] `requirements.txt` - includes all dependencies
- [x] `Procfile` - for Render deployment
- [x] `vercel.json` - Vercel configuration
- [x] `.env` - local environment (not committed)
- [x] `.env.production` - production template (update with real URLs)
- [x] `DEPLOYMENT.md` - full deployment guide

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub

### 1.2 Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select repository: `voicemation_pipeline`

### 1.3 Configure Service
Fill in these settings:
- [ ] **Name**: `voicemation-backend` (or your choice)
- [ ] **Environment**: Python 3
- [ ] **Branch**: main
- [ ] **Build Command**: `pip install -r requirements.txt`
- [ ] **Start Command**: `gunicorn app:app`

### 1.4 Add Environment Variables
- [ ] Add `GITHUB_TOKEN` with your GitHub personal access token
- [ ] PORT will be auto-set by Render

### 1.5 Deploy and Test
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for errors
- [ ] Copy your backend URL: `https://voicemation-backend.onrender.com`
- [ ] Test endpoint: `https://your-backend.onrender.com/` should return HTML

---

## Step 2: Update CORS for Production

### 2.1 Update app.py
After getting Vercel domain (Step 3), update CORS:
```python
allowed_origins = [
    "http://localhost:5173",
    "https://your-actual-domain.vercel.app",  # Replace with real domain
]
```

### 2.2 Redeploy Backend
- [ ] Push changes to GitHub
- [ ] Render will auto-deploy
- [ ] Verify in logs

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Variables
Edit `Voicemation/voicemation/.env.production`:
- [ ] Replace `VITE_API_URL` with your Render URL from Step 1.5

### 3.2 Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub

### 3.3 Import Project
- [ ] Click "Add New" → "Project"
- [ ] Import from GitHub
- [ ] Select your repository

### 3.4 Configure Project
- [ ] **Framework Preset**: Vite
- [ ] **Root Directory**: Click "Edit" → Select `Voicemation/voicemation`
- [ ] **Build Command**: `npm run build` (auto-detected)
- [ ] **Output Directory**: `dist` (auto-detected)

### 3.5 Add Environment Variables
- [ ] Click "Environment Variables"
- [ ] Add `VITE_API_URL` = `https://your-render-url.onrender.com`
- [ ] For all environments (Production, Preview, Development)

### 3.6 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Copy your Vercel URL: `https://your-project.vercel.app`

---

## Step 4: Update CORS with Vercel Domain

### 4.1 Update Backend
- [ ] Edit `app.py` with your actual Vercel domain
- [ ] Commit and push to GitHub
- [ ] Wait for Render to redeploy

---

## Step 5: Testing

### 5.1 Test Backend Endpoints
- [ ] Visit `https://your-backend.onrender.com/`
- [ ] Should see Flask app response

### 5.2 Test Frontend
- [ ] Visit `https://your-frontend.vercel.app`
- [ ] App should load without errors

### 5.3 Test Full Flow
- [ ] Click "New Chat" button
- [ ] Try text input with a simple topic (e.g., "Pythagorean theorem")
- [ ] Verify animation generates
- [ ] Try voice input
- [ ] Check conversation history
- [ ] Test rename conversation
- [ ] Create multiple conversations

### 5.4 Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Should see no CORS errors
- [ ] API calls should succeed

### 5.5 Test on Mobile
- [ ] Open on phone
- [ ] Test responsiveness
- [ ] Test voice input permission

---

## Step 6: Monitor and Optimize

### 6.1 Check Logs
- [ ] Render: Check for any errors in logs
- [ ] Vercel: Check function logs
- [ ] Monitor for failed requests

### 6.2 Performance
- [ ] Test cold start time (Render free tier sleeps)
- [ ] First request may take 30+ seconds
- [ ] Subsequent requests should be fast

### 6.3 Set Up Auto-Deploy
- [ ] Render: Enable auto-deploy on main branch
- [ ] Vercel: Auto-enabled by default
- [ ] Test by pushing a small change

---

## Common Issues & Solutions

### ❌ CORS Error
**Symptom**: "Access to fetch blocked by CORS policy"
**Solution**: 
1. Check CORS configuration in `app.py`
2. Verify exact Vercel domain is in allowed_origins
3. No trailing slash in domain
4. Redeploy backend after change

### ❌ 502/504 Error
**Symptom**: "Bad Gateway" or "Gateway Timeout"
**Solution**:
1. Check Render logs for Python errors
2. Verify gunicorn is installed
3. Check Build Command succeeded
4. Restart service in Render dashboard

### ❌ Module Not Found
**Symptom**: "No module named 'X'"
**Solution**:
1. Check `requirements.txt` includes the module
2. Trigger manual rebuild in Render
3. Check Python version compatibility

### ❌ API Not Responding
**Symptom**: Frontend shows loading forever
**Solution**:
1. Render free tier sleeps - first request takes 30s
2. Check environment variables are set
3. Verify GITHUB_TOKEN is valid
4. Check Render service is running

### ❌ Video Not Playing
**Symptom**: Video player shows error
**Solution**:
1. Check backend logs for Manim errors
2. Verify ffmpeg is working on Render
3. Check video file was created
4. Verify CORS allows video serving

---

## Post-Deployment

### Update README
- [ ] Add live demo links
- [ ] Update setup instructions
- [ ] Add deployment status badges

### Share Links
- [ ] Frontend: `https://your-app.vercel.app`
- [ ] Backend: `https://your-backend.onrender.com`

### Monitor Usage
- [ ] Render: 750 free hours/month
- [ ] Vercel: Unlimited on free tier
- [ ] Check monthly usage in dashboards

---

## Maintenance

### Regular Tasks
- [ ] Check logs weekly
- [ ] Monitor error rates
- [ ] Update dependencies monthly
- [ ] Renew GitHub token if needed

### Scaling Considerations
If you exceed free tier:
- **Render**: Upgrade to $7/month for no sleep
- **Vercel**: Free tier usually sufficient
- Consider CDN for video files
- Implement caching

---

## Quick Reference

### Render Commands
```bash
# View logs
render logs --service voicemation-backend

# Restart service
render restart --service voicemation-backend
```

### Vercel Commands
```bash
# Deploy from CLI
cd Voicemation/voicemation
vercel --prod

# View logs
vercel logs
```

### Local Testing
```bash
# Backend
cd /path/to/project
source venv/bin/activate
python app.py

# Frontend
cd Voicemation/voicemation
npm run dev
```

---

## Success Criteria

✅ Backend deployed and accessible
✅ Frontend deployed and accessible  
✅ No CORS errors in browser console
✅ Text input generates animations
✅ Voice input generates animations
✅ Videos play correctly
✅ Conversation history works
✅ Rename feature works
✅ Mobile responsive
✅ No console errors

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Flask CORS**: https://flask-cors.readthedocs.io/
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html

---

**Good luck with your deployment! 🚀**
