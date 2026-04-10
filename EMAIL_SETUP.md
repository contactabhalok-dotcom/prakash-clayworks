# Email Notification Setup

This guide will help you set up email notifications for order statuses.

## Overview

The application now sends email notifications for:
- ✅ Order Placed (immediately after checkout)
- ✅ Order Confirmed (when admin confirms the order)
- ✅ Order Shipped (when order status changes to shipped)
- ✅ Order Delivered (when order status changes to delivered)
- ✅ Order Cancelled (when order is cancelled)

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to the Resend Dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Prakash Clayworks")
5. Copy the API key (it starts with `re_`)

### 3. Add Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend Dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records they provide to your domain registrar
4. Wait for verification (usually takes a few minutes to a few hours)

**Note:** For testing, you can use the default `onboarding@resend.dev` email.

### 4. Configure Environment Variables

Add these to your `.env.local` file in the `apps/web` directory:

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Email sender (use your verified domain or keep default for testing)
FROM_EMAIL=Prakash Clayworks <onboarding@resend.dev>

# Your site URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# WhatsApp number for support links in emails
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

**For production:**
```env
RESEND_API_KEY=re_your_production_api_key
FROM_EMAIL=Prakash Clayworks <orders@yourdomain.com>
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 5. Test the Email Service

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Place a test order (you can use Cash on Delivery for testing)

3. Check the console logs - you should see:
   ```
   Email sent successfully to: your-email@example.com
   ```

4. Check your inbox (and spam folder) for the order confirmation email

## Email Templates

The emails include:
- **Order Number** and **Total Amount**
- **Order Items** with quantities and prices
- **Shipping Address**
- **Payment Method** and **Payment Status**
- **Call-to-action button** to view order details
- **Support contact information** (WhatsApp)

Each email has a color-coded header:
- 🔴 **Terracotta** - Order Placed/Confirmed
- 🔵 **Blue** - Order Shipped
- 🟢 **Green** - Order Delivered
- 🔴 **Red** - Order Cancelled

## Troubleshooting

### Email not sending?

1. Check that `RESEND_API_KEY` is set correctly
2. Check the console for error messages
3. Verify your Resend account is active
4. Check Resend dashboard for email logs

### Emails going to spam?

1. Verify your domain in Resend
2. Add SPF, DKIM, and DMARC records to your DNS
3. Use a recognizable "From" name
4. Don't use generic subject lines

### Can't use Resend?

You can easily switch to another email provider by modifying:
`packages/firebase/src/email-service.ts`

Just replace the `sendEmail()` function with your provider's API call.

## Production Recommendations

1. **Verify your domain** in Resend for better deliverability
2. **Set up DNS records** (SPF, DKIM, DMARC)
3. **Monitor email logs** in Resend dashboard
4. **Set up webhooks** to track email delivery status
5. **Use a custom domain** for sending emails (e.g., `orders@yourdomain.com`)

## API Rate Limits

- **Free tier:** 100 emails/day, 3,000 emails/month
- **Pro tier:** Unlimited emails

For most small businesses, the free tier is sufficient for testing.

## Support

If you need help:
- Check Resend documentation: https://resend.com/docs
- Contact support via WhatsApp: `+91 98765 43210`
