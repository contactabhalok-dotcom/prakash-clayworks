'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@prakash/firebase';
import { formatPrice } from '@/lib/utils';
import {
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePayU } from '@/hooks/usePayU';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const { clearCart } = useCartStore();
  const { isLoaded, isProcessing, initiatePayment } = usePayU();

  const amount = searchParams.get('amount');
  const customerName = searchParams.get('name');
  const customerEmail = searchParams.get('email');
  const customerPhone = searchParams.get('phone');

  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error' | 'cancelled'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Wait for PayU to load
  useEffect(() => {
    if (isLoaded) {
      setStatus('ready');
    }
  }, [isLoaded]);

  // Retrieve checkout data from sessionStorage and generate idempotency key
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('pendingCheckout');
      if (!storedData) {
        setError('Checkout session expired. Please start again.');
        setStatus('error');
        return;
      }
      const data = JSON.parse(storedData);
      setCheckoutData(data);

      // Generate unique idempotency key for this payment attempt
      const key = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      setIdempotencyKey(key);
    } catch (error) {
      console.error('Failed to retrieve checkout data:', error);
      setError('Invalid checkout session. Please try again.');
      setStatus('error');
    }
  }, []);

  // Validate required params
  useEffect(() => {
    if (!amount) {
      setError('Invalid payment details. Please go back and try again.');
      setStatus('error');
    }
  }, [amount]);

  const handlePayment = useCallback(async () => {
    if (!isLoaded || !amount || !checkoutData) {
      setError('Payment system not ready. Please wait...');
      return;
    }

    const payuKey = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY;
    if (!payuKey) {
      setError('Payment system not configured. Please contact support.');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setError(null);

    // Generate temp order ID for PayU
    const tempOrderId = `ORD${Date.now()}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    initiatePayment({
      amount: parseFloat(amount),
      orderId: tempOrderId,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || user?.email || 'customer@example.com',
      customerPhone: customerPhone || '0000000000',
      productInfo: `Order Payment - Prakash Clayworks`,
      onSuccess: async (response) => {
        setStatus('processing');

        // NOW create the order in Firebase with payment status 'paid'
        try {
          const { orderId, orderNumber: createdOrderNumber } = await createOrder({
            customer: checkoutData.customer,
            items: checkoutData.items,
            subtotal: checkoutData.subtotal,
            shipping: checkoutData.shipping,
            total: checkoutData.total,
            paymentMethod: 'payu',
            payuPaymentId: response.mihpayid,
            payuTransactionId: response.txnid,
            idempotencyKey,
          });

          // Clear sessionStorage and cart
          sessionStorage.removeItem('pendingCheckout');
          clearCart();
          setOrderNumber(createdOrderNumber);
          setStatus('success');

          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push(
              `/${locale}/order/success?orderNumber=${createdOrderNumber}&method=payu&paymentId=${response.mihpayid}`
            );
          }, 1500);
        } catch (err) {
          console.error('Failed to create order after payment:', err);
          setError('Payment successful but order creation failed. Please contact support with your transaction ID: ' + response.txnid);
          setStatus('error');
        }
      },
      onError: (error) => {
        console.error('Payment error:', error);
        setError(error.message || 'Payment failed. Please try again.');
        setStatus('error');
      },
      onCancel: () => {
        setStatus('cancelled');
      },
    });
  }, [isLoaded, amount, checkoutData, customerName, customerEmail, customerPhone, user?.email, idempotencyKey, initiatePayment, clearCart, router, locale]);

  // Don't auto-open payment - let user click the button
  // useEffect removed

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-clay-brown mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-4">
            Your order <span className="font-mono font-semibold">{orderNumber}</span> has been confirmed.
          </p>
          <p className="text-sm text-slate-500 mb-6">Redirecting to order confirmation...</p>
          <Loader2 className="h-6 w-6 animate-spin text-terracotta mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/checkout"
          className="inline-flex items-center text-clay-brown hover:text-terracotta mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-terracotta to-clay-brown p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-6 w-6" />
              <h1 className="text-xl font-bold">Complete Payment</h1>
            </div>
            <p className="text-white/80 text-sm">Secure payment powered by PayU</p>
          </div>

          {/* Order Details */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Amount to Pay</span>
              <span className="text-2xl font-bold text-terracotta">
                {amount ? formatPrice(parseFloat(amount)) : '---'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Your order will be created after successful payment</p>
          </div>

          {/* Payment Section */}
          <div className="p-6">
            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-terracotta mx-auto mb-4" />
                <p className="text-slate-600">Loading payment system...</p>
              </div>
            )}

            {status === 'ready' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Secure Payment</h3>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. We use PayU&apos;s trusted payment gateway.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-terracotta hover:bg-terracotta-dark text-white py-6 text-lg font-semibold rounded-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay {amount ? formatPrice(parseFloat(amount)) : ''}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-500">
                  By proceeding, you agree to our terms and conditions
                </p>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-terracotta mx-auto mb-4" />
                <p className="text-slate-600">Processing payment...</p>
                <p className="text-sm text-slate-500 mt-2">Please do not close this window</p>
              </div>
            )}

            {status === 'cancelled' && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Cancelled</h3>
                <p className="text-slate-600 mb-6">You cancelled the payment. Would you like to try again?</p>
                <Button
                  onClick={handlePayment}
                  className="bg-terracotta hover:bg-terracotta-dark text-white"
                >
                  Try Again
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Failed</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/checkout">
                    <Button variant="outline">Back to Checkout</Button>
                  </Link>
                  {!error?.includes('session expired') && (
                    <Button
                      onClick={handlePayment}
                      className="bg-terracotta hover:bg-terracotta-dark text-white"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
