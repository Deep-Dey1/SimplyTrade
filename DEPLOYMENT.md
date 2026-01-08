# SimplyTrade - Deployment Guide

## Deploying to Vercel with GitHub

Follow these steps to deploy your SimplyTrade application to Vercel:

### Step 1: Push to GitHub

1. **Initialize and commit your code:**
   ```bash
   cd "C:/Users/deepd/DeepSpace/programming/projects/SimplyTrade-Bajaj/SimplyTrade"
   git add .
   git commit -m "Initial commit - SimplyTrade trading platform"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it `simplytrade` or your preferred name
   - **DO NOT** initialize with README (you already have one)
   - Click "Create repository"

3. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/simplytrade.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Select your `simplytrade` repository from the list
   - Click "Import"

3. **Configure the project:**
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** Leave empty (static frontend)
   - **Output Directory:** frontend
   - **Install Command:** pip install -r backend/requirements.txt

4. **Environment Variables (if needed):**
   - You can add these later in Project Settings

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)

### Step 3: Access Your Deployed App

Once deployment is complete:
- Your app will be live at `https://your-project-name.vercel.app`
- Vercel will automatically deploy updates when you push to GitHub

### Important Notes:

1. **Database:**
   - The SQLite database will be recreated on each deployment
   - For production, consider using a hosted database like:
     - Vercel Postgres
     - Supabase
     - PlanetScale
     - Railway

2. **Backend Limitations:**
   - Vercel serverless functions have a 10-second execution limit
   - Consider using Vercel's hobby plan for testing

3. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain

### Testing Locally

To test the production build locally:
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Open frontend
# Open frontend/landing.html in your browser
```

### Troubleshooting

If deployment fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in requirements.txt
3. Verify the vercel.json configuration
4. Check that the API routes are correct

For questions or issues, refer to:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
