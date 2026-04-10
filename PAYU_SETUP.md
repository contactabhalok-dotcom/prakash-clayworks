# PayU Payment Integration Setup

This document explains how to set up PayU payment gateway for Prakash Clayworks.

## Environment Variables

Add the following variables to your `.env.local` file in the `apps/web` directory:

```env
# PayU Configuration
NEXT_PUBLIC_PAYU_MERCHANT_KEY=your_merchant_key_here
PAYU_SALT=your_salt_key_here
```

## Getting PayU Credentials

1. Sign up for a PayU account at [https://www.payu.in/](https://www.payu.in/)
2. Complete the business verification process
3. Once approved, go to your dashboard
4. Navigate to Settings → API Keys
5. Copy your **Merchant Key** and **Salt** (use Test credentials for testing)

## Test Credentials

For testing purposes, use PayU's test credentials:
- **Merchant Key**: Test key provided by PayU
- **Salt**: Test salt provided by PayU
- Test cards are available on PayU's documentation

## Payment Flow

1. User completes checkout and clicks "Proceed to Payment"
2. System generates a unique transaction ID and hash
3. PayU Bolt SDK is loaded and payment modal opens
4. User completes payment through PayU's secure interface
5. PayU sends response back to our callback URL
6. Order is created in Firebase with payment details
7. User is redirected to success page

## Files Changed

### Web App (`apps/web/`)
- `src/hooks/usePayU.ts` - PayU integration hook
- `src/types/payu.d.ts` - PayU TypeScript definitions
- `src/app/api/payu/generate-hash/route.ts` - Hash generation API
- `src/app/api/payu/callback/route.ts` - Payment callback handler
- `src/app/[locale]/checkout/payment/page.tsx` - Updated payment page
- `package.json` - Updated dependencies (removed razorpay, added crypto-js)

### Types Package (`packages/types/`)
- `src/index.ts` - Updated PaymentMethod type to use 'payu' instead of 'razorpay'

### Orders Package (`packages/firebase/`)
- Order schema now uses `payuTransactionId` and `payuPaymentId` fields

## Testing

1. Use PayU test credentials
2. Use test card numbers provided by PayU
3. Test both success and failure scenarios
4. Verify order creation in Firebase after successful payment

## Production Deployment

1. Replace test credentials with live credentials
2. Update success/failure URLs if needed
3. Test thoroughly on staging environment
4. Monitor transactions in PayU dashboard

## Security Notes

- Never commit `.env.local` files to version control
- Keep PAYU_SALT secret and never expose it in client-side code
- Hash verification is mandatory for all payment responses
- Use HTTPS in production for all payment pages

## Support

For PayU integration issues, contact:
- PayU Support: [https://payu.in/support](https://payu.in/support)
- PayU Documentation: [https://docs.payu.in/](https://docs.payu.in/)
