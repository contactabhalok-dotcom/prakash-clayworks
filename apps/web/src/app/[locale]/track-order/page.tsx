'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  Loader2,
  CheckCircle2,
  Truck,
  PackageCheck,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { getOrderByNumber } from '@prakash/firebase';
import { formatPrice, getLocalizedText } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import type { Order } from '@prakash/types';

export default function TrackOrderPage() {
  const t = useTranslations('track');
  const locale = useLocale();
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const foundOrder = await getOrderByNumber(orderNumber.trim().toUpperCase());

      if (foundOrder) {
        setOrder(foundOrder);
        toast.success('Order found!');
      } else {
        setError('Order not found. Please check your order number and try again.');
        toast.error('Order not found');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Unable to track order. Please try again later.');
      toast.error('Unable to track order');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle2 className="h-6 w-6 text-blue-500" />;
      case 'packing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <PackageCheck className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <Package className="h-6 w-6 text-red-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'packing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-warm-beige/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-terracotta to-clay-brown py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <Package className="mx-auto mb-4 h-12 w-12 sm:h-16 sm:w-16" />
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl font-bold">Track Your Order</h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Enter your order number to check the current status of your delivery
          </p>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-clay-brown/10 bg-white p-6 sm:p-8 shadow-lg">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-clay-brown">
                    Order Number
                  </label>
                  <div className="flex gap-2 flex-col xs:flex-row">
                    <Input
                      type="text"
                      placeholder="e.g., PC1A2B3C4D"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className="flex-1 min-h-[48px] text-base"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="min-h-[48px] w-full xs:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div className="rounded-lg bg-warm-beige/30 p-4">
                  <p className="text-sm text-clay-brown/70">
                    <strong>Tip:</strong> You can find your order number in the confirmation email or SMS sent after placing your order.
                  </p>
                </div>
              </form>
            </div>

            {/* Order Details */}
            {order && (
              <div className="mt-8 space-y-6">
                {/* Status Card */}
                <div className="rounded-2xl border border-clay-brown/10 bg-white p-6 sm:p-8 shadow-lg">
                  <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.orderStatus)}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-clay-brown">
                          Order #{order.orderNumber}
                        </h2>
                        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-semibold text-clay-brown">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                      <div className="space-y-6">
                        {/* Pending/Confirmed */}
                        <div className="relative flex items-start gap-4">
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            ['confirmed', 'packing', 'shipped', 'delivered'].includes(order.orderStatus)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}>
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-clay-brown">Order Confirmed</p>
                            <p className="text-sm text-gray-500">Your order has been received</p>
                          </div>
                        </div>

                        {/* Processing */}
                        <div className="relative flex items-start gap-4">
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            ['packing', 'shipped', 'delivered'].includes(order.orderStatus)
                              ? 'bg-green-500'
                              : order.orderStatus === 'confirmed'
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-gray-300'
                          }`}>
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-clay-brown">Processing</p>
                            <p className="text-sm text-gray-500">We're preparing your items</p>
                          </div>
                        </div>

                        {/* Shipped */}
                        <div className="relative flex items-start gap-4">
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            ['shipped', 'delivered'].includes(order.orderStatus)
                              ? 'bg-green-500'
                              : order.orderStatus === 'packing'
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-gray-300'
                          }`}>
                            <Truck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-clay-brown">Shipped</p>
                            <p className="text-sm text-gray-500">Your order is on the way</p>
                          </div>
                        </div>

                        {/* Delivered */}
                        <div className="relative flex items-start gap-4">
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            order.orderStatus === 'delivered'
                              ? 'bg-green-500'
                              : order.orderStatus === 'shipped'
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-gray-300'
                          }`}>
                            <PackageCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-clay-brown">Delivered</p>
                            <p className="text-sm text-gray-500">Order successfully delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="rounded-2xl border border-clay-brown/10 bg-white p-6 sm:p-8 shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold text-clay-brown">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 border-b border-clay-brown/10 pb-4 last:border-0">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-warm-beige">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={getLocalizedText(item.title, locale)}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-clay-brown">
                            {getLocalizedText(item.title, locale)}
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-terracotta">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 space-y-2 border-t border-clay-brown/10 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-clay-brown/10 pt-2 text-base font-semibold">
                      <span className="text-clay-brown">Total</span>
                      <span className="text-terracotta">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="rounded-2xl border border-clay-brown/10 bg-white p-6 sm:p-8 shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold text-clay-brown">Delivery Address</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-terracotta" />
                      <div>
                        <p className="font-medium text-clay-brown">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {order.customer.address}, {order.customer.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.state} - {order.customer.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 flex-shrink-0 text-terracotta" />
                      <a href={`tel:${order.customer.phone}`} className="text-sm text-clay-brown hover:text-terracotta">
                        {order.customer.phone}
                      </a>
                    </div>
                    {order.customer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 flex-shrink-0 text-terracotta" />
                        <a href={`mailto:${order.customer.email}`} className="text-sm text-clay-brown hover:text-terracotta">
                          {order.customer.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Need Help */}
                <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-6 text-center">
                  <h3 className="mb-2 font-semibold text-clay-brown">Need Help?</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    If you have any questions about your order, feel free to contact us.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button variant="outline" asChild>
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
