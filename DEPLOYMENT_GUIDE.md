# PRAKASH_CLAYWORKS - Deployment Guide

## 🚀 Post-Update Deployment Steps

This guide covers the steps needed to deploy the stability updates to production.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [x] All code changes committed to version control
- [x] Dependencies installed (`pnpm install` in root)
- [ ] Firestore rules deployed (see below)
- [ ] Environment variables configured
- [ ] Local testing completed

---

## 1. Deploy Firestore Security Rules (CRITICAL)

**Why**: The admin panel currently shows "Missing or insufficient permissions" because the updated Firestore rules haven't been deployed.

### Steps:

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Select your project
firebase use prakash-clayworks

# 3. Deploy the rules
firebase deploy --only firestore:rules

# 4. (Optional) Deploy indexes if you get index warnings
firebase deploy --only firestore:indexes
```

### Expected Output:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/prakash-clayworks/overview
```

### Verification:
- Go to Firebase Console → Firestore Database → Rules
- Verify the rules show your latest changes
- Test admin panel: Navigate to `/coupons` page - should load without errors

---

## 2. Environment Variables

Ensure these are set in your deployment environment:

### Web App (`apps/web/.env.local`)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prakash-clayworks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prakash-clayworks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prakash-clayworks.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=901359301788
NEXT_PUBLIC_FIREBASE_APP_ID=1:901359301788:web:c45f18026810b476326959

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://hzjhdfffjattogrtcwnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
SUPABASE_STORAGE_BUCKET=images

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>

# Cart Settings
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=500
NEXT_PUBLIC_SHIPPING_COST=50
```

### Admin App (`apps/admin/.env.local`)
```env
# Firebase Configuration (same as web)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPopwtCLXxsg-pXqmxH2whlUFKsbZ3Vr4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prakash-clayworks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prakash-clayworks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prakash-clayworks.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=901359301788
NEXT_PUBLIC_FIREBASE_APP_ID=1:901359301788:web:c45f18026810b476326959

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://hzjhdfffjattogrtcwnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
SUPABASE_STORAGE_BUCKET=images
```

---

## 3. Build and Deploy

### Local Testing (Recommended First)

```bash
# Install dependencies
pnpm install

# Build both apps
pnpm build

# Test web app locally
pnpm --filter web dev

# Test admin app locally (different terminal)
pnpm --filter admin dev
```

### Deployment Options

#### Option A: Vercel (Recommended)

**Web App:**
```bash
cd apps/web
vercel --prod
```

**Admin App:**
```bash
cd apps/admin
vercel --prod
```

#### Option B: Manual Build + Host

```bash
# Build both apps
pnpm build

# Output will be in:
# - apps/web/.next
# - apps/admin/.next

# Deploy these to your hosting provider
```

---

## 4. Post-Deployment Verification

### Critical Tests:

#### ✅ Payment Flow Test
1. Add item to cart
2. Go to checkout
3. Fill in details
4. Select "Pay Online"
5. **Verify**: Payment page opens (no order created yet)
6. Complete payment
7. **Verify**: Order created AFTER payment success
8. **Verify**: Cart cleared
9. **Verify**: Redirect to success page

#### ✅ Price Validation Test
1. Note a product's price
2. Add to cart
3. Change product price in admin panel
4. Go to checkout
5. **Verify**: Toast notification "Prices updated to current rates"
6. **Verify**: Cart shows new price

#### ✅ Coupon Test
1. Create a coupon with category restriction in admin
2. Add matching category item to cart
3. Go to checkout
4. Apply coupon
5. **Verify**: Success toast with discount amount
6. **Verify**: Total updated correctly

#### ✅ Admin Panel Test
1. Login to admin panel
2. Navigate to Coupons page
3. **Verify**: No "Missing or insufficient permissions" error
4. **Verify**: Coupons load successfully

---

## 5. Database Indexes (If Needed)

If you see warnings about missing indexes in the console:

```bash
firebase deploy --only firestore:indexes
```

The `firestore.indexes.json` file already contains the necessary indexes for coupon queries.

---

## 6. Monitoring & Logs

### What to Monitor After Deployment:

1. **Payment Success Rate**
   - Check Firestore orders collection
   - Verify `paymentStatus: 'paid'` for Razorpay orders
   - Ensure no orphaned orders (orders without payment)

2. **Error Logs**
   - Check browser console for errors
   - Check server logs for Firebase errors
   - Monitor Razorpay dashboard for payment failures

3. **User Feedback**
   - Toast notifications appearing correctly
   - No UI flickering or broken states
   - Cart price updates working smoothly

---

## 7. Rollback Plan (If Needed)

If critical issues occur after deployment:

### Quick Rollback:
1. Revert to previous Git commit
2. Redeploy previous version
3. Keep Firestore rules (they're backward compatible)

### Specific Component Rollback:

**Payment Flow:**
- Revert: `apps/web/src/app/[locale]/checkout/page.tsx`
- Revert: `apps/web/src/app/[locale]/checkout/payment/page.tsx`
- Revert: `packages/firebase/src/orders.ts`

**Price Validation:**
- Remove price validation `useEffect` from checkout page
- Cart will work without validation (just won't auto-update)

---

## 8. Known Behaviors After Update

### Expected Changes:

✅ **For Razorpay Payments:**
- Order now created AFTER payment (not before)
- Order immediately has `paymentStatus: 'paid'`
- No more orphaned pending orders

✅ **For Cart:**
- Prices auto-update on checkout page load
- Toast appears if prices changed
- Category stored with each item

✅ **For Coupons:**
- Category restrictions now work correctly
- Toast feedback on apply/remove

✅ **For Admin:**
- All operations show toast notifications
- Firestore rules enforce proper permissions

### No Changes To:
- COD order flow (still creates immediately)
- Product browsing
- User authentication
- Admin authentication
- Existing orders in database

---

## 9. Database Migration

**Good News**: No database migration needed!

The updates are backward compatible:
- Existing orders work fine (they don't have idempotency keys - that's OK)
- Existing cart items will get categories added on next "add to cart"
- Price validation happens only on checkout (doesn't affect stored data)

---

## 10. Support & Troubleshooting

### Common Issues:

#### Issue: "Missing or insufficient permissions" in admin
**Solution**: Deploy Firestore rules (Step 1)

#### Issue: Toast notifications not appearing
**Solution**: Verify Toaster component in layout, check browser console

#### Issue: Cart prices not updating
**Solution**: Check network tab for getProductById calls, verify Firestore read permissions

#### Issue: Payment creates order twice
**Solution**: Idempotency keys should prevent this - check Firestore for duplicate orders with same key

### Debug Mode:

To enable verbose logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true')
```

Then check console for detailed logs from:
- Price validation
- Coupon application
- Payment flow
- Order creation

---

## 11. Performance Considerations

### Expected Impact:

**Checkout Page Load:**
- +200-500ms (for price validation API calls)
- Non-blocking, doesn't affect user experience

**Payment Processing:**
- Same speed (order creation moved, not removed)
- Actually slightly faster (no failed order to clean up)

**Admin Panel:**
- Same speed
- Toast notifications add <50ms

### Optimization Tips:

1. **Enable Firestore Caching:**
   Already enabled in Firebase config

2. **Monitor API Quotas:**
   Price validation adds extra reads on checkout

3. **Index Coverage:**
   Deploy indexes if warnings appear

---

## 12. Success Metrics

After 24-48 hours, verify:

- [ ] Zero orphaned orders in Firestore
- [ ] Payment success rate maintained or improved
- [ ] No increase in customer support tickets
- [ ] Admin panel accessible and functional
- [ ] Toast notifications providing good UX

---

## 🎉 Deployment Complete!

Once you've completed steps 1-3, your site is production-ready with:

✅ Secure payment flow
✅ Accurate cart pricing
✅ Better user feedback
✅ Data consistency
✅ Proper error handling

---

## Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Firestore rules are deployed
3. Verify environment variables are set
4. Test in incognito mode (clears cache)
5. Check this guide's troubleshooting section

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
