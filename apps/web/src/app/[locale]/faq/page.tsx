'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, HelpCircle, ChevronDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // Orders & Delivery
  {
    category: 'Orders & Delivery',
    question: 'How can I place an order?',
    answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You\'ll need to provide your shipping address and payment details to complete the order.'
  },
  {
    category: 'Orders & Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 3-5 business days for metro cities, 5-7 business days for other cities, and 7-10 business days for remote areas. Orders are processed within 1-2 business days.'
  },
  {
    category: 'Orders & Delivery',
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer FREE shipping on all orders above ₹999. For orders below ₹999, a flat shipping charge of ₹99 applies.'
  },
  {
    category: 'Orders & Delivery',
    question: 'Can I track my order?',
    answer: 'Yes, once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from your account dashboard.'
  },
  {
    category: 'Orders & Delivery',
    question: 'Can I cancel or modify my order?',
    answer: 'You can cancel your order before it is shipped. Contact us immediately if you need to cancel or modify your order. Once shipped, orders cannot be cancelled but can be returned.'
  },

  // Products
  {
    category: 'Products',
    question: 'Are all your products handmade?',
    answer: 'Yes, all our clay products are handcrafted by skilled artisans. Each piece is unique, and slight variations in color, size, and design are natural characteristics of handmade items.'
  },
  {
    category: 'Products',
    question: 'What materials are used in your products?',
    answer: 'We use high-quality natural clay and eco-friendly materials. Our products are made using traditional pottery techniques and are safe for daily use.'
  },
  {
    category: 'Products',
    question: 'Are your products microwave and dishwasher safe?',
    answer: 'Most of our terracotta products are not recommended for microwave or dishwasher use. For specific product care instructions, please check the product description or contact us.'
  },
  {
    category: 'Products',
    question: 'Can I customize a product?',
    answer: 'Yes, we offer customization services for bulk orders. Please contact us with your requirements, and we\'ll be happy to create custom pieces for you.'
  },

  // Returns & Refunds
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery if the product is damaged, defective, or significantly different from the description. The product must be in its original packaging with tags.'
  },
  {
    category: 'Returns & Refunds',
    question: 'How do I return a product?',
    answer: 'Contact us via email or phone within 7 days of delivery with your order number and reason for return. If approved, we\'ll provide return instructions and arrange pickup.'
  },
  {
    category: 'Returns & Refunds',
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned product. It may take an additional 5-10 business days for the amount to reflect in your account.'
  },
  {
    category: 'Returns & Refunds',
    question: 'Do you offer exchanges?',
    answer: 'We currently do not offer direct exchanges. If you wish to exchange a product, please return it and place a new order for the desired item.'
  },

  // Payment
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, UPI, net banking, and various digital wallets including Paytm, PhonePe, and Google Pay.'
  },
  {
    category: 'Payment',
    question: 'Is it safe to pay on your website?',
    answer: 'Yes, all payments are processed through secure payment gateways with SSL encryption. We do not store your card or banking information.'
  },
  {
    category: 'Payment',
    question: 'Can I pay cash on delivery?',
    answer: 'Cash on delivery may be available for select locations. Please check at checkout if COD is available for your area.'
  },

  // Account & Support
  {
    category: 'Account & Support',
    question: 'Do I need an account to place an order?',
    answer: 'While you can browse products without an account, creating an account makes checkout faster and allows you to track orders, save addresses, and view order history.'
  },
  {
    category: 'Account & Support',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page and enter your registered email. You\'ll receive a password reset link via email.'
  },
  {
    category: 'Account & Support',
    question: 'How can I contact customer support?',
    answer: 'You can reach us via email at hello@prakashclayworks.com or call us at +91 98765 43210 during business hours (Monday-Saturday, 9 AM - 6 PM).'
  },

  // Care & Maintenance
  {
    category: 'Care & Maintenance',
    question: 'How do I clean clay products?',
    answer: 'Hand wash with mild soap and warm water. Avoid harsh detergents and abrasive scrubbers. Dry thoroughly before storing. Do not use in dishwasher unless specified.'
  },
  {
    category: 'Care & Maintenance',
    question: 'How should I store clay products?',
    answer: 'Store in a dry place away from direct sunlight. Stack carefully with padding between items to prevent chipping. Ensure products are completely dry before storage.'
  },
  {
    category: 'Care & Maintenance',
    question: 'Can terracotta products be used for hot beverages?',
    answer: 'Yes, our terracotta products are suitable for hot beverages. However, avoid sudden temperature changes to prevent cracking.'
  },
];

export default function FAQPage() {
  const t = useTranslations('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
                <HelpCircle className="h-8 w-8 text-terracotta" />
                Frequently Asked Questions
              </CardTitle>
              <p className="text-sm text-slate-500">Find answers to common questions about our products and services</p>
            </CardHeader>
          </Card>

          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-terracotta text-white'
                        : 'bg-white border border-slate-200 text-clay-brown hover:border-terracotta'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 hover:bg-warm-beige/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-terracotta font-medium">{faq.category}</span>
                        <h3 className="font-semibold text-clay-brown mt-1">{faq.question}</h3>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${
                          openIndex === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No FAQs found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-clay-brown mb-3">Still have questions?</h3>
              <p className="text-slate-700 mb-4">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'hello@prakashclayworks.com'}`}
                  className="flex-1 px-4 py-3 bg-terracotta text-white rounded-lg text-center font-medium hover:bg-terracotta/90 transition-colors"
                >
                  Email Us
                </a>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '+919876543210'}`}
                  className="flex-1 px-4 py-3 bg-white border-2 border-terracotta text-terracotta rounded-lg text-center font-medium hover:bg-terracotta/5 transition-colors"
                >
                  Call Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
