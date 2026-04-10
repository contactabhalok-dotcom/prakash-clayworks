'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createSupportTicket,
  getUserSupportTickets,
} from '@prakash/firebase';
import type { SupportTicket, TicketCategory } from '@prakash/types';
import {
  HelpCircle,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Package,
  CreditCard,
  Truck,
  ShoppingBag,
  RefreshCw,
  Plus,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ticketCategories: { id: TicketCategory; label: string; icon: typeof Package }[] = [
  { id: 'order', label: 'Order Issue', icon: Package },
  { id: 'payment', label: 'Payment Issue', icon: CreditCard },
  { id: 'delivery', label: 'Delivery Issue', icon: Truck },
  { id: 'product', label: 'Product Query', icon: ShoppingBag },
  { id: 'refund', label: 'Refund Request', icon: RefreshCw },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

const faqs = [
  {
    question: 'How can I track my order?',
    answer: 'You can track your order by going to "My Orders" section in your profile. Click on any order to view its current status and tracking details.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking through PayU, and Cash on Delivery (COD).',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 5-7 business days. Delivery time may vary based on your location and product availability.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for unused items in original packaging. Please contact support to initiate a return.',
  },
  {
    question: 'How do I cancel my order?',
    answer: 'You can cancel your order before it is shipped by contacting our support team. Once shipped, cancellation is not possible.',
  },
  {
    question: 'Are the products handmade?',
    answer: 'Yes! All our products are handcrafted by skilled artisans using traditional techniques passed down through generations.',
  },
];

export default function HelpPage() {
  const t = useTranslations('help');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'contact'>('faq');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // New ticket form
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'other' as TicketCategory,
    subject: '',
    description: '',
    orderId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.uid && activeTab === 'tickets') {
      loadTickets();
    }
  }, [user, activeTab]);

  const loadTickets = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const data = await getUserSupportTickets(user.uid);
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Detailed error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !user?.email) {
      setError('Please login to submit a ticket');
      return;
    }

    if (!ticketForm.subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!ticketForm.description.trim()) {
      setError('Please describe your issue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ticketData: {
        category: typeof ticketForm.category;
        subject: string;
        description: string;
        orderId?: string;
      } = {
        category: ticketForm.category,
        subject: ticketForm.subject,
        description: ticketForm.description,
      };

      // Only add orderId if it has a value
      if (ticketForm.orderId && ticketForm.orderId.trim()) {
        ticketData.orderId = ticketForm.orderId;
      }

      await createSupportTicket(
        user.uid,
        user.email,
        user.displayName || 'Customer',
        ticketData
      );

      setSuccess(true);
      setShowNewTicket(false);
      setTicketForm({
        category: 'other',
        subject: '',
        description: '',
        orderId: '',
      });

      // Reload tickets
      loadTickets();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to submit ticket: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    return colors[status];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToProfile') || 'Back to Profile'}
        </Link>

        <h1 className="text-2xl font-bold text-clay-brown mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-terracotta" />
          {t('title') || 'Help Center'}
        </h1>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Your support ticket has been submitted successfully. We'll get back to you soon!
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'faq' ? 'default' : 'outline'}
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {t('faqs') || 'FAQs'}
          </Button>
          <Button
            variant={activeTab === 'tickets' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tickets')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('myTickets') || 'My Tickets'}
          </Button>
          <Button
            variant={activeTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contact')}
          >
            <Phone className="h-4 w-4 mr-2" />
            {t('contactUs') || 'Contact Us'}
          </Button>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('frequentlyAskedQuestions') || 'Frequently Asked Questions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                  >
                    <span className="font-medium text-clay-brown">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('supportTickets') || 'Support Tickets'}</CardTitle>
              {user && !showNewTicket && (
                <Button size="sm" onClick={() => setShowNewTicket(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newTicket') || 'New Ticket'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Please login to view your support tickets</p>
                  <Link href="/auth/login?redirect=/help">
                    <Button>Login</Button>
                  </Link>
                </div>
              ) : showNewTicket ? (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <h3 className="font-medium text-clay-brown">
                    {t('createTicket') || 'Create Support Ticket'}
                  </h3>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-clay-brown mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ticketCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setTicketForm({ ...ticketForm, category: cat.id })}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-colors ${
                            ticketForm.category === cat.id
                              ? 'border-terracotta bg-terracotta/10'
                              : 'border-slate-200 hover:border-terracotta/50'
                          }`}
                        >
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order ID (optional) */}
                  {(ticketForm.category === 'order' ||
                    ticketForm.category === 'delivery' ||
                    ticketForm.category === 'refund') && (
                    <div>
                      <label className="block text-sm font-medium text-clay-brown mb-1">
                        Order Number (Optional)
                      </label>
                      <Input
                        value={ticketForm.orderId}
                        onChange={(e) =>
                          setTicketForm({ ...ticketForm, orderId: e.target.value })
                        }
                        placeholder="e.g., PC..."
                      />
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-clay-brown mb-1">
                      Subject *
                    </label>
                    <Input
                      value={ticketForm.subject}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, subject: e.target.value })
                      }
                      placeholder="Brief summary of your issue"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-clay-brown mb-1">
                      Description *
                    </label>
                    <Textarea
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, description: e.target.value })
                      }
                      placeholder="Please describe your issue in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Ticket'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewTicket(false);
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">
                    {t('noTickets') || 'No support tickets yet'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t('createTicketDesc') || 'Create a ticket if you need help'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {ticket.ticketNumber}
                            </span>
                          </div>
                          <p className="font-medium text-clay-brown">{ticket.subject}</p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(ticket.createdAt)}
                            </span>
                            {ticket.messages.length > 0 && (
                              <span>{ticket.messages.length} messages</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('getInTouch') || 'Get in Touch'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="p-3 bg-terracotta/10 rounded-full">
                    <Phone className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <p className="font-medium text-clay-brown">Phone Support</p>
                    <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '+919876543210'}`} className="text-terracotta hover:underline">
                      {process.env.NEXT_PUBLIC_PHONE_NUMBER || '+91 98765 43210'}
                    </a>
                    <p className="text-sm text-slate-500">Mon-Sat, 9 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="p-3 bg-terracotta/10 rounded-full">
                    <Mail className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <p className="font-medium text-clay-brown">Email Support</p>
                    <a
                      href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@prakashclayworks.com'}`}
                      className="text-terracotta hover:underline"
                    >
                      {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@prakashclayworks.com'}
                    </a>
                    <p className="text-sm text-slate-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="p-3 bg-green-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-clay-brown">WhatsApp Support</p>
                    <p className="text-sm text-slate-500">Quick responses on WhatsApp</p>
                  </div>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="bg-green-600 text-white border-green-600 hover:bg-green-700">
                      Chat Now
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('visitUs') || 'Visit Us'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-clay-brown mb-2">Prakash Clayworks</p>
                  <p className="text-slate-600">
                    123, Potter Street<br />
                    Kumhar Nagar<br />
                    Jaipur, Rajasthan 302001<br />
                    India
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
