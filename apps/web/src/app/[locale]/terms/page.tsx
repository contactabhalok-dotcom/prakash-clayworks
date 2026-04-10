'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, FileText, Shield, CreditCard, Package, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
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
                <FileText className="h-8 w-8 text-terracotta" />
                Terms and Conditions
              </CardTitle>
              <p className="text-sm text-slate-500">Last updated: December 19, 2025</p>
            </CardHeader>
          </Card>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-700 leading-relaxed">
                Welcome to Prakash Clay Works. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website and placing orders, you accept these terms and conditions in full. Do not continue to use Prakash Clay Works if you do not accept all of the terms and conditions stated on this page.
              </p>
            </CardContent>
          </Card>

          {/* Account Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-terracotta" />
                Account Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>You must be at least 18 years old to use our services and create an account.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>You are responsible for maintaining the security of your account and password.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>You must provide accurate, current, and complete information during registration.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>We reserve the right to suspend or terminate accounts that violate these terms.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Orders and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-terracotta" />
                Orders and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>We reserve the right to refuse or cancel any order for any reason.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Payment must be received before order processing begins.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>We accept various payment methods including credit/debit cards, UPI, net banking, and wallets.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>All transactions are processed through secure payment gateways.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-terracotta" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>We strive to display product colors and images as accurately as possible, but actual products may vary slightly.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>All clay products are handmade and each piece is unique, slight variations are natural.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Product availability is subject to change without notice.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>We reserve the right to limit quantities purchased per person or per order.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Shipping and Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-terracotta" />
                Shipping and Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Delivery times are estimates and may vary based on location and product availability.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Risk of loss and title for products pass to you upon delivery to the carrier.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Please inspect products upon delivery and report any damage within 48 hours.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                All content on this website, including text, graphics, logos, images, and software, is the property of Prakash Clay Works and is protected by Indian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-terracotta" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Prakash Clay Works shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our products or services. Our liability is limited to the amount paid for the product in question.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Changes to Terms</h3>
              <p className="text-slate-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following any changes constitutes acceptance of those changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Contact Us</h3>
              <p className="text-slate-700">
                If you have any questions about these Terms and Conditions, please contact us at{' '}
                <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}`} className="text-terracotta hover:underline">
                  {process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
