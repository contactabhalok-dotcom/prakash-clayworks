# Admin Dashboard Permission Fix - Deployment Guide

## Problem
Admin dashboard and other pages are showing "Missing or insufficient permissions" errors and not loading properly.

## Root Cause
The Firestore security rules need to be deployed to your Firebase project. The rules file (`firestore.rules`) has been updated with the correct permissions, but they haven't been deployed to Firebase yet.

## Solution

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with your Firebase account that owns the `prakash-clayworks` project.

### Step 3: Verify Project Selection

```bash
firebase use prakash-clayworks
```

If it says the project is not found, run:
```bash
firebase use --add
```
And select `prakash-clayworks` from the list.

### Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

You should see output like:
```
=== Deploying to 'prakash-clayworks'...

i  deploying firestore
✓  cloud.firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

### Step 5: Verify the Fix

1. Go to your admin panel URL
2. Login with your admin credentials
3. The dashboard should now load without permission errors
4. Check browser console (F12) - there should be no "Missing or insufficient permissions" errors

## Alternative: Deploy via Firebase Console

If you can't use the CLI, you can manually update the rules:

1. Go to: https://console.firebase.google.com/project/prakash-clayworks/firestore/rules
2. Copy the entire content of `firestore.rules` file
3. Paste it into the rules editor
4. Click "Publish"

## What Changed in the Rules

The rules file already had the correct permissions structure:

1. **Admins Collection**: Allows authenticated users to read admin documents (needed for verification)
2. **Products/Categories/Banners**: Public read, admin-only write
3. **Orders**: Authenticated users can read/create their own orders, admins can update/delete
4. **All other collections**: Properly configured for admin access

The key function is `isAdmin()` which checks:
- User is authenticated
- Admin document exists in Firestore
- Admin's `isActive` field is `true`

## Troubleshooting

### Still Getting Permission Errors?

1. **Verify the rules were deployed:**
   - Go to Firebase Console → Firestore → Rules
   - Check that the rules match the `firestore.rules` file

2. **Verify your admin document exists:**
   - Go to Firebase Console → Firestore Database
   - Look for the `admins` collection
   - Find a document with your Firebase Auth UID as the document ID
   - Ensure it has `isActive: true`

3. **Check browser console:**
   - Open F12 Developer Tools
   - Look for specific error messages
   - The error should tell you which collection is being denied

4. **Try clearing browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito mode

### Admin Document Doesn't Exist?

If there's no admin document in Firestore, you need to create one:

**Option 1: Use the setup endpoint**
```
Visit: /api/setup-admin?uid=YOUR_FIREBASE_UID&email=your@email.com
```

**Option 2: Manually create via Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Create collection: `admins` (if it doesn't exist)
3. Create document with ID = your Firebase Auth UID
4. Add fields:
   - `email`: "your@email.com" (string)
   - `displayName`: "Your Name" (string)
   - `role`: "super_admin" (string)
   - `isActive`: true (boolean)
   - `createdAt`: current timestamp
   - `updatedAt`: current timestamp

### Firebase CLI Installation Fails?

If `npm install -g firebase-tools` fails or times out:

1. Try with elevated permissions:
   ```bash
   sudo npm install -g firebase-tools  # Mac/Linux
   # Run as Administrator on Windows
   ```

2. Or use npx:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

3. Or use the Firebase Console web interface (see "Alternative" section above)

## Verification Checklist

After deploying the rules:

- [ ] Admin login works
- [ ] Dashboard loads without errors
- [ ] Products page loads
- [ ] Orders page loads
- [ ] Categories page loads
- [ ] Settings page loads
- [ ] No "Missing or insufficient permissions" errors in browser console
- [ ] All admin CRUD operations work (create, update, delete)

## Files Updated

- `firestore.rules` - Updated and ready to deploy
- `ADMIN_PERMISSION_FIX.md` - This file

## Need Help?

If you're still experiencing issues after following these steps:

1. Check the browser console for specific error messages
2. Verify your admin document exists in Firestore with `isActive: true`
3. Ensure you deployed the rules to the correct Firebase project
4. Check that your admin panel is using the correct Firebase project ID

---

**Last Updated**: April 11, 2026
**Status**: Ready to Deploy ✅
