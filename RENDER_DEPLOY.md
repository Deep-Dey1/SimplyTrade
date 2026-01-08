# SimplyTrade - Render Deployment Guide

## Deploy to Render

Render is better than Vercel for this app because:
- ✅ Persistent SQLite database
- ✅ Traditional web service (no serverless limitations)
- ✅ Free tier available
- ✅ Simpler configuration

### Step 1: Push to GitHub

Your code is already pushed. Just make sure the latest changes are committed:

```bash
cd "C:/Users/deepd/DeepSpace/programming/projects/SimplyTrade-Bajaj/SimplyTrade"
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 3: Deploy Web Service

1. **From Dashboard:**
   - Click "New +" button
   - Select "Web Service"

2. **Connect Repository:**
   - Find and select your `SimplyTrade` repository
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `simplytrade` (or your preferred name)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty (uses root)
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `bash start.sh`
   - **Instance Type:** `Free`

4. **Advanced Settings (Optional):**
   - Click "Advanced"
   - Add environment variable if needed:
     - Key: `PYTHON_VERSION`
     - Value: `3.12.0`

5. **Create Web Service:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment

### Step 4: Access Your App

Once deployed:
- Your app will be live at: `https://simplytrade-XXXX.onrender.com`
- The free tier may spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds

### Step 5: Custom Domain (Optional)

To use `simplytrade.deepdey.me`:

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings" → "Custom Domains"
   - Add: `simplytrade.deepdey.me`

2. **In Namecheap:**
   - Go to DNS settings for `deepdey.me`
   - Add CNAME record:
     - Host: `simplytrade`
     - Value: `simplytrade-XXXX.onrender.com` (from Render)
     - TTL: Automatic

3. **Verify:**
   - Return to Render and click "Verify"
   - SSL will be auto-configured

### Database Persistence

Unlike Vercel:
- ✅ Your database **persists** between deployments
- ✅ User accounts and trades are **saved**
- ⚠️ On free tier, database is reset if service is deleted

### Monitoring

- View logs in real-time from Render dashboard
- Check deployment status
- Monitor resource usage

### Updating Your App

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically redeploy!

---

**Free Tier Limitations:**
- Spins down after 15 min inactivity
- 750 hours/month runtime
- Shared CPU/RAM
- Perfect for demos and assignments!

**Need paid features?**
- Upgrade to $7/month for always-on service
- Better performance and no spin-down
