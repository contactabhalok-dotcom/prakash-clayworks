'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Truck, Package, Clock, MapPin, IndianRupee, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShippingPage() {
  const t = useTranslations('profile');

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome') || 'Back to Home'}
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Truck className="h-8 w-8 text-terracotta" />
                Shipping Policy
              </CardTitle>
              <p className="text-sm text-slate-500">Last updated: December 19, 2025</p>
            </CardHeader>
          </Card>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-700 leading-relaxed">
                At Prakash Clay Works, we are committed to delivering your handcrafted clay products safely and efficiently. This Shipping Policy outlines our delivery process, timelines, and charges.
              </p>
            </CardContent>
          </Card>

          {/* Shipping Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-terracotta" />
                Delivery Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-clay-brown mb-2">We Currently Deliver To:</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>All major cities and towns across India</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Most pin codes serviceable by our courier partners</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Remote areas may have longer delivery times</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  International shipping is currently not available. We ship only within India.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-clay-brown">Metro Cities</h4>
                    <span className="text-terracotta font-bold">3-5 Business Days</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-clay-brown">Other Cities & Towns</h4>
                    <span className="text-terracotta font-bold">5-7 Business Days</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Tier 2 and Tier 3 cities
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-clay-brown">Remote Areas</h4>
                    <span className="text-terracotta font-bold">7-10 Business Days</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Rural areas and hard-to-reach locations
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-clay-brown">Bulk Orders</h4>
                    <span className="text-terracotta font-bold">Varies</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    For bulk or customized orders, delivery time will be communicated separately
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  Delivery times are estimates and may vary due to unforeseen circumstances, weather conditions, or courier delays. Orders are processed within 1-2 business days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-terracotta" />
                Shipping Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2 items-start">
                  <span className="text-terracotta font-bold">•</span>
                  <div>
                    <p className="font-medium">Orders above ₹999:</p>
                    <p className="text-sm text-slate-600">FREE SHIPPING across India</p>
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-terracotta font-bold">•</span>
                  <div>
                    <p className="font-medium">Orders below ₹999:</p>
                    <p className="text-sm text-slate-600">Flat shipping charge of ₹99 will apply</p>
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-terracotta font-bold">•</span>
                  <div>
                    <p className="font-medium">Bulk Orders:</p>
                    <p className="text-sm text-slate-600">Shipping charges will be calculated based on weight and destination</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Order Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-terracotta" />
                Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Orders are processed within 1-2 business days (Monday to Saturday)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Orders placed on Sundays or public holidays will be processed the next business day</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>You will receive an email with tracking details once your order is shipped</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>All products are carefully packed to prevent damage during transit</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Order Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Once your order is shipped, you will receive:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Shipping confirmation email with tracking number</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>SMS updates on your registered mobile number</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Real-time tracking link to monitor your shipment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>You can also track your order from your account dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Packaging */}
          <Card>
            <CardHeader>
              <CardTitle>Safe Packaging</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-3">
                We take extra care in packaging fragile clay products:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Each product is wrapped individually with bubble wrap</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Additional cushioning material for protection</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Sturdy corrugated boxes designed for fragile items</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>"Fragile - Handle with Care" labels on all packages</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Delivery Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-terracotta" />
                Delivery Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-clay-brown mb-2">If Your Order is Delayed:</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Check the tracking information for updates</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Contact us if your order hasn't arrived within the estimated timeframe</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>We will coordinate with the courier to resolve the issue</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-clay-brown mb-2">Incorrect or Incomplete Address:</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Please ensure your shipping address is complete and correct</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Delays or returns due to incorrect addresses may incur additional charges</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Contact us immediately if you notice any address errors after placing the order</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Undelivered Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Undelivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-3">
                If the courier is unable to deliver your order due to:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Incorrect address or unavailability of recipient</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Customer refused to accept the delivery</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Multiple failed delivery attempts</span>
                </li>
              </ul>
              <p className="text-slate-700 mt-3">
                The order will be returned to us, and you may be charged return shipping fees. A refund (minus shipping costs) will be processed after the product is received back in good condition.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Questions About Shipping?</h3>
              <p className="text-slate-700">
                For any shipping-related queries, please contact us:
              </p>
              <div className="mt-3 text-slate-700">
                <p>Email: <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}`} className="text-terracotta hover:underline">
                  {process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}
                </a></p>
                <p>Phone: <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '+919876543210'}`} className="text-terracotta hover:underline">
                  {process.env.NEXT_PUBLIC_PHONE_NUMBER || '+91 98765 43210'}
                </a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
