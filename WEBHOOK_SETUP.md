# Razorpay Webhook Setup Guide

This guide explains how to set up Razorpay webhooks for automatic order processing in Prakash Clayworks.

## 🎯 What the Webhook Does

The webhook automatically:
1. ✅ Confirms orders when payment is captured
2. ✅ Reduces product stock automatically
3. ✅ Updates order status to "confirmed"
4. ✅ Marks payment as "paid"
5. ✅ Handles payment failures gracefully

## 📋 Prerequisites

- Razorpay account (Test or Live mode)
- Deployed website URL (Vercel, Netlify, etc.)
- Access to Razorpay Dashboard

## 🔧 Setup Steps

### Step 1: Generate Webhook Secret

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** > **Webhooks**
3. Click **Generate Secret** (copy and save this securely)

### Step 2: Add Environment Variable

Add the webhook secret to your `.env.local` file:

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: Also add this to your deployment platform (Vercel/Netlify):
- Go to your project settings
- Navigate to Environment Variables
- Add `RAZORPAY_WEBHOOK_SECRET` with the secret value

### Step 3: Configure Webhook URL in Razorpay

1. In Razorpay Dashboard, go to **Settings** > **Webhooks**
2. Click **Create New Webhook** or **Add Webhook URL**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/razorpay/webhook
   ```
   Example: `https://prakashclayworks.vercel.app/api/razorpay/webhook`

4. Select the following events:
   - ✅ `payment.captured` (Payment successful)
   - ✅ `payment.failed` (Payment failed)

5. Enter the **Active Secret** you generated in Step 1
6. Click **Create Webhook**

### Step 4: Test the Webhook

#### Option A: Test in Test Mode

1. Make a test payment using Razorpay Test Cards
2. Check webhook logs in Razorpay Dashboard
3. Verify order status changed to "confirmed"
4. Check product stock reduced automatically

#### Option B: Use Razorpay Webhook Tester

1. In Razorpay Dashboard > Webhooks
2. Click **Test Webhook**
3. Select `payment.captured` event
4. Click **Send Test Request**
5. Check your server logs for webhook receipt

## 🔐 Security Features

The webhook includes multiple security layers:

1. **Signature Verification**: All webhooks are verified using HMAC SHA256
2. **Transaction Safety**: Stock reduction uses Firebase transactions (prevents race conditions)
3. **Idempotency**: Prevents duplicate order confirmations
4. **Error Handling**: Gracefully handles failures and logs errors

## 📊 Webhook Events Handled

### `payment.captured`
Triggers when payment is successful:
- Updates order payment status to "paid"
- Changes order status to "confirmed"
- Reduces stock for all ordered items
- Logs success for audit trail

### `payment.failed`
Triggers when payment fails:
- Updates order payment status to "failed"
- Sends notification to admins (future feature)
- Order remains in "new" status

## 🐛 Troubleshooting

### Webhook not receiving events

**Check:**
1. ✅ Webhook URL is correct and publicly accessible
2. ✅ `RAZORPAY_WEBHOOK_SECRET` is set correctly
3. ✅ SSL certificate is valid (HTTPS required)
4. ✅ Firewall/security groups allow Razorpay IPs

**View Razorpay IP Addresses:**
- Check [Razorpay Documentation](https://razorpay.com/docs/webhooks/#ip-addresses)

### Signature verification failing

**Check:**
1. ✅ Webhook secret matches exactly (no extra spaces)
2. ✅ Environment variable loaded correctly
3. ✅ Restart your server after adding env variables

### Stock not reducing

**Check:**
1. ✅ Product IDs in order match Firebase product IDs
2. ✅ Sufficient stock available before order
3. ✅ Check Firebase console for error logs
4. ✅ Verify `updateProduct` permission in Firestore rules

## 📝 Webhook Logs

View webhook activity in Razorpay Dashboard:
1. Go to **Settings** > **Webhooks**
2. Click on your webhook URL
3. View **Recent Deliveries** tab
4. Check status codes and response times

**Status Codes:**
- `200`: Success - Webhook processed correctly
- `400`: Bad Request - Invalid signature or data
- `404`: Not Found - Order not found in database
- `500`: Server Error - Check application logs

## 🔄 Order Flow After Payment

```
User Pays with Razorpay
         ↓
Razorpay captures payment
         ↓
Webhook receives `payment.captured`
         ↓
Signature verified ✓
         ↓
Find order by razorpayOrderId
         ↓
Update payment status → "paid"
         ↓
Update order status → "confirmed"
         ↓
Reduce stock for each item
         ↓
Return success (200)
```

## 🚀 Next Steps

After webhook setup, consider implementing:

1. **Email Notifications**: Send order confirmation emails
2. **WhatsApp Notifications**: Order updates via WhatsApp
3. **Admin Dashboard**: Real-time order monitoring
4. **Shipping Integration**: Auto-create shipments (Shiprocket/Delhivery)
5. **SMS Notifications**: Order tracking via SMS

## 📞 Support

If you encounter issues:

1. Check application logs on your hosting platform
2. Review Razorpay webhook delivery logs
3. Test with Razorpay Test Mode first
4. Contact Razorpay support for webhook issues
5. Check Firebase logs for database errors

## ⚠️ Important Notes

- Always test in **Test Mode** before going live
- Keep webhook secret secure (never commit to Git)
- Monitor webhook delivery success rates
- Set up alerting for failed webhooks
- Regularly review webhook logs

## 🔗 Resources

- [Razorpay Webhooks Documentation](https://razorpay.com/docs/webhooks/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
