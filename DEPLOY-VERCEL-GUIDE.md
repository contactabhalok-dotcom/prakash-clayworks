# Deploy to Vercel - Step by Step Guide

## Prerequisites

✅ Code is committed to Git (ready to push)
✅ GitHub repository exists
✅ Vercel account created (sign up at https://vercel.com)
✅ Environment variables ready (from `.env.local` files)

---

## Step 1: Push Code to GitHub

### Option A: Using the batch script (Recommended)
```bash
push-to-github.bat
```

### Option B: Manual push
```bash
git remote add origin https://github.com/contactabhalok-dotcom/prakash-clayworks.git
git branch -M main
git push -u origin main
```

**If authentication fails:**
- You'll need to authenticate with GitHub (browser login or Personal Access Token)
- Or create the repository manually at https://github.com/new

---

## Step 2: Deploy Web App to Vercel

### 2.1 Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub account
4. Find and select `prakash-clayworks` repository
5. Click **"Import"**

### 2.2 Configure Project

**Project Name:** `prakash-clayworks-web`

**Configure Project:**
- Click **"Edit"** next to "Root Directory"
- Set to: `apps/web`

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/web` ✅
- Build Command: Leave blank (will use vercel.json)
- Output Directory: `.next`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add ALL variables from `apps/web/.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prakash-clayworks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prakash-clayworks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prakash-clayworks.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=901359301788
NEXT_PUBLIC_FIREBASE_APP_ID=1:901359301788:web:c45f18026810b476326959
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RqZJKTkHXguW2E
RAZORPAY_KEY_SECRET=1BXu6DOyGjByKT041TH1qHjo
NEXTAUTH_URL=https://prakash-clayworks-web.vercel.app
NEXT_PUBLIC_SITE_URL=https://prakash-clayworks-web.vercel.app
JWT_SECRET=6a9fa0374ba03923d2c4e5706aee5d15
NEXT_PUBLIC_PHONE_NUMBER=+916290351365
NEXT_PUBLIC_WHATSAPP_NUMBER=916290351365
NEXT_PUBLIC_EMAIL=hello@prakashclayworks.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@prakashclayworks.com
NEXT_PUBLIC_ADDRESS=34/3/5 old mullajor road jagatdal kolkata 743125 west bengal india
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/prakashclayworks
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/prakashclayworks
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@prakashclayworks
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=500
NEXT_PUBLIC_SHIPPING_COST=50
NEXT_PUBLIC_SUPABASE_URL=https://hzjhdfffjattogrtcwnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6amhkZmZmamF0dG9ncnRjd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTYzNjEzNCwiZXhwIjoyMDgxMjEyMTM0fQ.mRbeFVzcfk48m8xC52_yadSpdGHTx_VgVOlNYYTBB5k
SUPABASE_STORAGE_BUCKET=images
RESEND_API_KEY=re_your_api_key_here
```

⚠️ **IMPORTANT:** 
- Replace placeholder values with your actual credentials
- Use temporary Vercel URL for `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` initially
- Update them after first deployment

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://prakash-clayworks-web-xxx.vercel.app`

### 2.5 Update URLs
1. Copy your Vercel URL
2. Go to Project Settings → Environment Variables
3. Update:
   - `NEXTAUTH_URL` = `https://your-actual-url.vercel.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-actual-url.vercel.app`
4. Click **"Redeploy"** or push a new commit

---

## Step 3: Deploy Admin Dashboard to Vercel

### 3.1 Import Project Again
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select the **SAME** `prakash-clayworks` repository
4. Click **"Import"**

### 3.2 Configure Admin Project

**Project Name:** `prakash-clayworks-admin`

**Configure Project:**
- Click **"Edit"** next to "Root Directory"
- Set to: `apps/admin`

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/admin` ✅
- Build Command: Leave blank (will use vercel.json)
- Output Directory: `.next`

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add ALL variables from `apps/admin/.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prakash-clayworks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prakash-clayworks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prakash-clayworks.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=901359301788
NEXT_PUBLIC_FIREBASE_APP_ID=1:901359301788:web:c45f18026810b476326959
NEXTAUTH_URL=https://prakash-clayworks-admin.vercel.app
NEXT_PUBLIC_SITE_URL=https://prakash-clayworks-admin.vercel.app
JWT_SECRET=6a9fa0374ba03923d2c4e5706aee5d15
NEXT_PUBLIC_SUPABASE_URL=https://hzjhdfffjattogrtcwnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6amhkZmZmamF0dG9ncnRjd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTYzNjEzNCwiZXhwIjoyMDgxMjEyMTM0fQ.mRbeFVzcfk48m8xC52_yadSpdGHTx_VgVOlNYYTBB5k
SUPABASE_STORAGE_BUCKET=images
RESEND_API_KEY=re_your_api_key_here
```

⚠️ **IMPORTANT:** 
- Replace placeholder values with your actual credentials
- Use temporary Vercel URL initially, update after deployment

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://prakash-clayworks-admin-xxx.vercel.app`

### 3.5 Update URLs
1. Copy your admin Vercel URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`
4. Redeploy

---

## Step 4: Test Your Deployment

### Web App Tests:
- [ ] Homepage loads correctly
- [ ] Product browsing works
- [ ] Cart functionality
- [ ] User login/signup works
- [ ] Checkout flow (test mode)
- [ ] Mobile responsive

### Admin Dashboard Tests:
- [ ] Login with admin credentials
- [ ] Dashboard loads
- [ ] Can view products
- [ ] Can view orders
- [ ] Can view customers
- [ ] All navigation works

---

## Step 5: Add Custom Domains (Optional)

### For Website:
1. Go to Web Project → Settings → Domains
2. Add domain: `prakashclayworks.com` or `www.prakashclayworks.com`
3. Follow DNS configuration instructions
4. Update environment variables with new domain

### For Admin Panel:
1. Go to Admin Project → Settings → Domains
2. Add subdomain: `admin.prakashclayworks.com`
3. Add CNAME record in your DNS provider:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`
4. Update environment variables with new domain

---

## Automatic Deployments

Both apps will automatically redeploy when you push to GitHub:
- Push to `main` branch → Both apps redeploy
- Vercel detects changes in respective directories
- You can view deployment logs in Vercel dashboard

---

## Troubleshooting

### Build Fails
**Common solutions:**
1. Check Root Directory is set correctly
2. Verify all environment variables are added
3. Check build logs for specific errors
4. Try local build: `cd apps/web && pnpm build`

### Environment Variables Not Working
1. Variable names must match exactly (case-sensitive)
2. Redeploy after adding new variables
3. Check they're added in Vercel dashboard, not just locally

### Images Not Loading
1. Verify Supabase Storage bucket is public
2. Check CORS settings in Supabase
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Authentication Issues
1. Check Firebase authorized domains include your Vercel URL
2. Update Firebase config in Firebase Console
3. Add your Vercel URL to Firebase authorized domains

---

## Your Final Setup

After deployment, you'll have:

| App | Vercel URL | Custom Domain (Optional) |
|-----|-----------|-------------------------|
| Website | `https://prakash-clayworks-web.vercel.app` | `https://prakashclayworks.com` |
| Admin | `https://prakash-clayworks-admin.vercel.app` | `https://admin.prakashclayworks.com` |

---

## Need Help?

- See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for more details
- See [EMAIL_SETUP.md](EMAIL_SETUP.md) for email configuration
- Contact: support@prakashclayworks.com
