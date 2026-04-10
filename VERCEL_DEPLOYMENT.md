# Deploying Admin Panel & Website to Vercel

This guide shows you how to deploy both the customer website and admin panel to Vercel.

## 🎯 Deployment Strategy

You'll create **TWO separate Vercel projects** from the same GitHub repository:
1. **Website** (Customer-facing) - `https://prakashclayworks.com` or `https://web-xxx.vercel.app`
2. **Admin Panel** - `https://admin.prakashclayworks.com` or `https://admin-xxx.vercel.app`

---

## 📋 Prerequisites

1. GitHub account with your repository pushed
2. Vercel account (sign up at https://vercel.com with GitHub)
3. All environment variables from `.env.local` files

---

## 🌐 Deploy Website (Customer App)

### Step 1: Import Project in Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your `prakash-clayworks` repository
4. Click "Import"

### Step 2: Configure Website Project

**Project Name:** `prakash-clayworks-web` (or any name you prefer)

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/web` ⚠️ **Important!**
- Build Command: `cd ../.. && pnpm install && cd apps/web && pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add all from `apps/web/.env.local`:

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
```

⚠️ **Important:** Use temporary URLs for `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` initially. Update them after first deployment.

### Step 4: Deploy Website
- Click "Deploy"
- Wait 2-3 minutes
- You'll get a URL like: `https://prakash-clayworks-web-xxx.vercel.app`

### Step 5: Update URLs
1. Copy your Vercel URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` with actual URL
4. Click "Redeploy" or push a new commit

---

## 🎛️ Deploy Admin Panel

### Step 1: Import Project Again

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select the **SAME** `prakash-clayworks` repository
4. Click "Import"

### Step 2: Configure Admin Project

**Project Name:** `prakash-clayworks-admin`

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/admin` ⚠️ **Important!**
- Build Command: `cd ../.. && pnpm install && cd apps/admin && pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add all from `apps/admin/.env.local`:

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
```

### Step 4: Deploy Admin
- Click "Deploy"
- Wait 2-3 minutes
- You'll get a URL like: `https://prakash-clayworks-admin-xxx.vercel.app`

### Step 5: Update URLs
1. Copy your admin Vercel URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`
4. Redeploy

---

## 🌍 Add Custom Domains (Optional)

### For Website:
1. Go to Website Project → Settings → Domains
2. Add domain: `prakashclayworks.com`
3. Follow DNS configuration instructions
4. Update environment variables with new domain

### For Admin Panel:
1. Go to Admin Project → Settings → Domains
2. Add subdomain: `admin.prakashclayworks.com`
3. Add CNAME record in your DNS:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`
4. Update environment variables with new domain

---

## 📊 Your Final Setup

After deployment, you'll have:

| App | Vercel URL | Custom Domain |
|-----|-----------|---------------|
| Website | `https://prakash-clayworks-web.vercel.app` | `https://prakashclayworks.com` |
| Admin | `https://prakash-clayworks-admin.vercel.app` | `https://admin.prakashclayworks.com` |

---

## 🔄 Automatic Deployments

Both apps will automatically redeploy when you push to GitHub:
- Push to `main` branch → Both apps redeploy
- Vercel detects changes in respective directories

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find workspace"
**Solution:** Use this Build Command instead:
```bash
pnpm install --no-frozen-lockfile && pnpm build
```

### "Module not found" errors
**Solution:** Make sure you're using the correct Root Directory:
- Website: `apps/web`
- Admin: `apps/admin`

### Environment variables not working
**Solution:**
1. Check they're added in Vercel dashboard
2. Variable names must match exactly (case-sensitive)
3. Redeploy after adding new variables

### Images not loading
**Solution:**
1. Check Supabase Storage bucket is public
2. Verify CORS settings in Supabase
3. Check `NEXT_PUBLIC_SUPABASE_URL` is correct

---

## 📝 Quick Checklist

### Before Deploying:
- [ ] Code pushed to GitHub
- [ ] `.env.local` files ready for both apps
- [ ] Firebase project configured
- [ ] Supabase storage bucket created
- [ ] Razorpay account set up

### Website Deployment:
- [ ] Root Directory: `apps/web`
- [ ] All environment variables added
- [ ] Deployed successfully
- [ ] URLs updated in environment variables

### Admin Deployment:
- [ ] Root Directory: `apps/admin`
- [ ] All environment variables added
- [ ] Deployed successfully
- [ ] URLs updated in environment variables

### Post-Deployment:
- [ ] Test website functionality
- [ ] Test admin login
- [ ] Test payment flow
- [ ] Add custom domains (optional)
- [ ] Update Firebase authorized domains

---

## 🎉 You're Done!

Your e-commerce platform is now live on Vercel!

**Website:** For customers to browse and shop
**Admin:** For you to manage products, orders, and content

Both apps share the same Firebase backend and will stay in sync automatically.
