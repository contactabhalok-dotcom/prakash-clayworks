'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
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
                <Shield className="h-8 w-8 text-terracotta" />
                Privacy Policy
              </CardTitle>
              <p className="text-sm text-slate-500">Last updated: December 19, 2025</p>
            </CardHeader>
          </Card>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-700 leading-relaxed">
                At Prakash Clay Works, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-terracotta" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-clay-brown mb-2">Personal Information</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Name, email address, phone number</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Billing and shipping addresses</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Payment information (processed securely through payment gateways)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Order history and preferences</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-clay-brown mb-2">Automatically Collected Information</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>IP address and browser type</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Device information and operating system</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Pages visited and time spent on our website</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span>Referring website addresses</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-terracotta" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Process and fulfill your orders</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Send order confirmations and shipping updates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Respond to your inquiries and provide customer support</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Send promotional emails about new products and special offers (with your consent)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Improve our website and personalize your shopping experience</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Detect and prevent fraud</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-terracotta" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Secure Socket Layer (SSL) encryption for data transmission</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Regular security assessments and updates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Limited access to personal information by authorized personnel only</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Secure payment processing through trusted payment gateways</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-terracotta" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device that help us:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Remember your preferences and settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Keep you logged in to your account</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Understand how you use our website</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Display relevant advertisements</span>
                </li>
              </ul>
              <p className="text-slate-700">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-terracotta" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business, including:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Payment processors (PayU, PhonePe, etc.)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Shipping and logistics partners</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Email service providers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Analytics providers (Google Analytics, etc.)</span>
                </li>
              </ul>
              <p className="text-slate-700">
                These third parties are contractually obligated to keep your information confidential and use it only for the purposes we specify.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-3">You have the right to:</p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Access and receive a copy of your personal information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Correct inaccurate or incomplete information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Request deletion of your personal information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Withdraw consent for data processing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Children's Privacy</h3>
              <p className="text-slate-700">
                Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Changes to This Privacy Policy</h3>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Contact Us</h3>
              <p className="text-slate-700">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
