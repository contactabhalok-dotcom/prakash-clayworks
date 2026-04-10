# Prakash Clayworks E-Commerce Platform

A full-stack e-commerce platform for handcrafted terracotta products, built with Next.js 16, Firebase, and PayU.

## Features

- 🛍️ **Customer Web App** - Browse products, add to cart, checkout with PayU/COD
- 🎛️ **Admin Dashboard** - Manage products, categories, orders, customers, and reviews
- 🔥 **Firebase Backend** - Firestore database, Authentication, and Storage
- 💳 **PayU Integration** - Secure online payments
- 📧 **Email Notifications** - Automated order confirmation and status update emails
- 🌐 **Internationalization** - Support for English and Hindi
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Built with Tailwind CSS and Framer Motion

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Payments:** PayU
- **Email:** Resend (https://resend.com)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Monorepo:** pnpm workspaces

## Project Structure

```
├── apps/
│   ├── web/              # Customer-facing website
│   └── admin/            # Admin dashboard
├── packages/
│   ├── firebase/         # Firebase utilities and services
│   └── types/            # Shared TypeScript types
└── images/               # Static images
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase project
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/prakash-clayworks.git
cd prakash-clayworks
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `apps/web/.env.example` to `apps/web/.env.local`
   - Copy `apps/admin/.env.local.example` to `apps/admin/.env.local` (if exists)
   - Fill in your Firebase, PayU, and other credentials
   - See `EMAIL_SETUP.md` for email configuration

4. Run the development servers:

**Web App:**
```bash
cd apps/web
pnpm dev
```
Visit http://localhost:3000

**Admin Dashboard:**
```bash
cd apps/admin
pnpm dev
```
Visit http://localhost:3001

## Environment Variables

See `apps/web/.env.example` for required environment variables.

### Required Variables:
- Firebase credentials (API key, project ID, etc.)
- Razorpay API keys
- Supabase credentials (for image storage)
- Site URLs and business information

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `apps/web`
4. Add all environment variables
5. Deploy

### Build Commands

```bash
# Build web app
cd apps/web && pnpm build

# Build admin app
cd apps/admin && pnpm build
```

## Features Overview

### Customer Web App
- Browse products by category
- Product search and filters
- Shopping cart with persistence
- Wishlist and recently viewed
- Secure checkout (PayU & COD)
- Order tracking
- User authentication
- Profile management
- Saved addresses for quick checkout
- Multi-language support (EN/HI)
- 📧 Email notifications for order status updates

### Admin Dashboard
- Product management (CRUD)
- Category management
- Order management and tracking
- Customer management
- Coupon management
- Banner management
- Review management
- Support ticket system
- Admin user management

## Email Notifications

The system automatically sends emails to customers at each order stage:
- ✅ **Order Placed** - Confirmation email with order details
- ✅ **Order Confirmed** - Admin confirmation notification
- ✅ **Order Shipped** - Shipping notification with tracking info
- ✅ **Order Delivered** - Delivery confirmation
- ✅ **Order Cancelled** - Cancellation notification

**Setup:** See [EMAIL_SETUP.md](EMAIL_SETUP.md) for configuration instructions.

**Quick Start:**
1. Create account at https://resend.com
2. Get API key from dashboard
3. Add to `.env.local`: `RESEND_API_KEY=re_your_key`
4. Test by placing an order

## Security Notes

- Never commit `.env.local` files
- Keep API keys and secrets secure
- Configure proper Firestore security rules
- Use environment variables for all sensitive data

## Contributing

This is a private project. Contact the owner for collaboration opportunities.

## License

All rights reserved. Copyright © 2024 Prakash Clayworks

## Support

For support, email support@prakashclayworks.com or call +91 6290351365
