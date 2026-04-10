'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Loader2, Mail, Phone, MapPin, Clock } from 'lucide-react';

function OrderSuccessContent() {
  const t = useTranslations('orderSuccess');
  const searchParams = useSearchParams();
  const locale = useLocale();

  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const method = searchParams.get('method') || 'cod';
  const paymentId = searchParams.get('paymentId');
  const [showEmailInfo, setShowEmailInfo] = useState(false);

  useEffect(() => {
    // Show email info after a short delay for better UX
    const timer = setTimeout(() => setShowEmailInfo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8 sm:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-green-100"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
            </motion.div>
          </motion.div>

          {/* Title with Animation */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-3xl sm:text-4xl font-bold text-clay-brown"
          >
            {t('title') || 'Order Placed Successfully!'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8 text-base sm:text-lg text-clay-brown/70"
          >
            {t('thankYou') || 'Thank you for your order! We\'ve received your request.'}
          </motion.p>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8 rounded-xl border border-clay-brown/10 bg-white p-4 sm:p-6 text-left shadow-lg"
          >
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <span className="text-sm sm:text-base text-gray-600">{t('orderNumber') || 'Order Number'}</span>
              <span className="font-mono font-semibold text-terracotta text-base sm:text-lg">
                {orderNumber}
              </span>
            </div>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <span className="text-sm sm:text-base text-gray-600">Payment Method</span>
              <span className="font-medium text-clay-brown text-sm sm:text-base">
                {method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
              </span>
            </div>

            {paymentId && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <span className="text-sm sm:text-base text-gray-600">Payment ID</span>
                <span className="font-mono text-xs sm:text-sm text-clay-brown">
                  {paymentId}
                </span>
              </div>
            )}
          </motion.div>

          {/* Email Confirmation Message */}
          {showEmailInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6 sm:mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 sm:p-6 text-left"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <Mail className="mt-1 h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-blue-900">
                    📧 Email Confirmation Sent!
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    We've sent a detailed confirmation email to your email address. 
                    Please check your inbox (and spam folder) for complete order details, 
                    including items, pricing, and shipping address.
                  </p>
                  <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm text-blue-700">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      You'll receive email updates at each stage:
                    </p>
                    <div className="ml-6 space-y-1">
                      <p>✅ Order Placed</p>
                      <p>✅ Order Confirmed</p>
                      <p>✅ Order Shipped</p>
                      <p>✅ Order Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 sm:mb-8 rounded-xl bg-white border border-clay-brown/10 p-4 sm:p-6 text-left shadow-md"
          >
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-clay-brown">
              📦 What's Next?
            </h3>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-semibold text-xs">
                  1
                </div>
                <p>Our team will review and confirm your order within 24 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-semibold text-xs">
                  2
                </div>
                <p>You'll receive a confirmation email once your order is processed</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-semibold text-xs">
                  3
                </div>
                <p>We'll carefully pack your items and arrange for delivery</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-semibold text-xs">
                  4
                </div>
                <p>Track your order status anytime using the order number above</p>
              </div>
            </div>
          </motion.div>

          {/* Support Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6 sm:mb-8 rounded-xl bg-gradient-to-r from-terracotta/5 to-orange-50 border border-terracotta/20 p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm sm:text-base font-medium text-clay-brown">
                  Need Help or Have Questions?
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Our support team is here to assist you
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 font-medium text-sm sm:text-base"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild className="flex-1 text-sm sm:text-base min-h-[48px]">
              <Link href="/shop">
                {t('continueShopping') || 'Continue Shopping'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 text-sm sm:text-base min-h-[48px]">
              <Link href={`/orders/${orderNumber}`}>
                <MapPin className="mr-2 h-4 w-4" />
                {t('viewOrderDetails') || 'View Order Details'}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
