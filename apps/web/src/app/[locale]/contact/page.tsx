'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  Store,
  Package,
} from 'lucide-react';
import { createEnquiry } from '@prakash/firebase';
import type { BusinessType } from '@prakash/types';
import { toast } from 'sonner';

const businessTypes = [
  { value: 'shop', label: 'Retail Shop' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'decorator', label: 'Event Decorator' },
  { value: 'individual', label: 'Individual' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const t = useTranslations('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRetailerLoading, setIsRetailerLoading] = useState(false);
  const [isRetailerSuccess, setIsRetailerSuccess] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    businessType: BusinessType;
    quantity: string;
    message: string;
  }>({
    name: '',
    phone: '',
    email: '',
    businessType: 'individual',
    quantity: '',
    message: '',
  });

  const [retailerFormData, setRetailerFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    businessType: BusinessType;
    companyName: string;
    quantity: string;
    productInterest: string;
    message: string;
  }>({
    name: '',
    phone: '',
    email: '',
    businessType: 'shop',
    companyName: '',
    quantity: '',
    productInterest: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'businessType') {
      setFormData((prev) => ({ ...prev, [name]: value as BusinessType }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRetailerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'businessType') {
      setRetailerFormData((prev) => ({ ...prev, [name]: value as BusinessType }));
    } else {
      setRetailerFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save enquiry to Firebase
      await createEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        businessType: formData.businessType,
        quantity: formData.quantity,
        message: formData.message,
      });

      setIsSuccess(true);
      toast.success('Enquiry Submitted!', {
        description: 'We will get back to you soon.',
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        businessType: 'individual',
        quantity: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to submit enquiry:', error);
      toast.error('Failed to submit enquiry', {
        description: error instanceof Error ? error.message : 'Please try again or contact us directly via WhatsApp.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetailerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRetailerLoading(true);

    try {
      // Save retailer enquiry to Firebase
      await createEnquiry({
        name: retailerFormData.name,
        phone: retailerFormData.phone,
        email: retailerFormData.email || undefined,
        businessType: retailerFormData.businessType,
        quantity: retailerFormData.quantity,
        message: `Company: ${retailerFormData.companyName}\nProduct Interest: ${retailerFormData.productInterest}\n\n${retailerFormData.message}`,
      });

      setIsRetailerSuccess(true);
      toast.success('Retailer Enquiry Submitted!', {
        description: 'Our sales team will contact you within 24 hours.',
      });

      setRetailerFormData({
        name: '',
        phone: '',
        email: '',
        businessType: 'shop',
        companyName: '',
        quantity: '',
        productInterest: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to submit retailer enquiry:', error);
      toast.error('Failed to submit enquiry', {
        description: error instanceof Error ? error.message : 'Please try again or contact us directly.',
      });
    } finally {
      setIsRetailerLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-clay-brown py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="mb-4 text-3xl sm:text-4xl font-bold">{t('title')}</h1>
          <p className="text-base sm:text-lg text-white/80">{t('subtitle')}</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-clay-brown">
                Contact Information
              </h2>

              <div className="space-y-4">
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-xl border border-clay-brown/10 bg-white p-4 transition-colors hover:border-terracotta"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">
                      {t('info.whatsapp')}
                    </h3>
                    <p className="text-sm text-gray-600">{process.env.NEXT_PUBLIC_PHONE_NUMBER || '+91 98765 43210'}</p>
                    <p className="text-xs text-terracotta">Click to chat</p>
                  </div>
                </a>

                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}`}
                  className="flex items-start gap-4 rounded-xl border border-clay-brown/10 bg-white p-4 transition-colors hover:border-terracotta"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                    <Mail className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">
                      {t('info.email')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4 rounded-xl border border-clay-brown/10 bg-white p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                    <MapPin className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">
                      {t('info.address')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {process.env.NEXT_PUBLIC_ADDRESS || '123 Clay Street, Pottery Lane, City, State 123456'}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '+919876543210'}`}
                  className="flex items-start gap-4 rounded-xl border border-clay-brown/10 bg-white p-4 transition-colors hover:border-terracotta"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                    <Phone className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">Call Us</h3>
                    <p className="text-sm text-gray-600">{process.env.NEXT_PUBLIC_PHONE_NUMBER || '+91 98765 43210'}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-clay-brown/10 bg-white p-4 sm:p-6 md:p-8">
                <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-clay-brown">
                  {t('form.title')}
                </h2>

                {isSuccess ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                    <h3 className="mb-2 text-xl font-semibold text-clay-brown">
                      {t('form.success')}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setIsSuccess(false)}
                    >
                      Send Another Enquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <Input
                        name="name"
                        placeholder={t('form.name')}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="min-h-[48px]"
                      />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder={t('form.phone')}
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="min-h-[48px]"
                      />
                    </div>

                    <Input
                      name="email"
                      type="email"
                      placeholder={t('form.email')}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="min-h-[48px]"
                    />

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <Select
                        name="businessType"
                        options={businessTypes}
                        value={formData.businessType}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="quantity"
                        placeholder={t('form.quantity')}
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="min-h-[48px]"
                      />
                    </div>

                    <Textarea
                      name="message"
                      placeholder={t('form.message')}
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      required
                      className="min-h-[120px]"
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full min-h-[52px]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          {t('form.submit')}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Retailer/Bulk Buying Section */}
      <section className="py-12 sm:py-16 bg-warm-beige/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta/10 mb-4">
              <Store className="h-8 w-8 text-terracotta" />
            </div>
            <h2 className="text-3xl font-bold text-clay-brown mb-3">
              Become a Retailer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Partner with us for bulk orders, wholesale pricing, and exclusive deals. Perfect for retail shops, resellers, and event decorators.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-clay-brown/10 bg-white p-6 sm:p-8">
              {isRetailerSuccess ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-16 w-16 text-terracotta" />
                  <h3 className="mb-2 text-xl font-semibold text-clay-brown">
                    Thank You for Your Interest!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our sales team will contact you within 24 hours to discuss bulk pricing and partnership opportunities.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsRetailerSuccess(false)}
                  >
                    Submit Another Enquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRetailerSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="name"
                      placeholder="Contact Person Name *"
                      value={retailerFormData.name}
                      onChange={handleRetailerInputChange}
                      required
                    />
                    <Input
                      name="companyName"
                      placeholder="Company/Shop Name *"
                      value={retailerFormData.companyName}
                      onChange={handleRetailerInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number *"
                      value={retailerFormData.phone}
                      onChange={handleRetailerInputChange}
                      required
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={retailerFormData.email}
                      onChange={handleRetailerInputChange}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Select
                      name="businessType"
                      options={businessTypes}
                      value={retailerFormData.businessType}
                      onChange={handleRetailerInputChange}
                    />
                    <Input
                      name="quantity"
                      placeholder="Expected Quantity *"
                      value={retailerFormData.quantity}
                      onChange={handleRetailerInputChange}
                      required
                    />
                    <Input
                      name="productInterest"
                      placeholder="Product Categories"
                      value={retailerFormData.productInterest}
                      onChange={handleRetailerInputChange}
                    />
                  </div>

                  <Textarea
                    name="message"
                    placeholder="Tell us about your business requirements, expected delivery timeline, and any specific customization needs..."
                    value={retailerFormData.message}
                    onChange={handleRetailerInputChange}
                    rows={4}
                    required
                  />

                  <div className="bg-terracotta/5 rounded-lg p-4 text-sm text-clay-brown">
                    <p className="font-medium mb-2">Benefits of Partnering with Us:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Wholesale pricing with bulk discounts</li>
                      <li>• Priority delivery and dedicated support</li>
                      <li>• Customization options for large orders</li>
                      <li>• Flexible payment terms for verified partners</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isRetailerLoading}
                  >
                    {isRetailerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Retailer Enquiry
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section with Business Location */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta/10 mb-4">
              <MapPin className="h-8 w-8 text-terracotta" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-clay-brown mb-3">
              Our Location
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit us at our business location
            </p>
          </div>

          <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-clay-brown/10">
            <iframe
              src="https://www.google.com/maps?q=22.849719,88.392181&z=13&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Business Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
