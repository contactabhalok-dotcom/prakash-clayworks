'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  getSupportTicketById,
  updateTicketStatus,
  addTicketMessage,
  getUserProfile,
  getOrderByNumber,
} from '@prakash/firebase';
import type { SupportTicket, UserProfile, Order } from '@prakash/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Send,
  User,
  Clock,
  Package,
  CreditCard,
  Truck,
  ShoppingBag,
  HelpCircle,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

const categoryIcons: Record<string, typeof Package> = {
  order: Package,
  payment: CreditCard,
  delivery: Truck,
  product: ShoppingBag,
  refund: CreditCard,
  other: HelpCircle,
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function SupportTicketDetailPage({ params }: Props) {
  const { id: ticketId } = use(params);
  const { user: adminUser } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [relatedOrder, setRelatedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  const loadTicketData = async () => {
    setLoading(true);
    try {
      const ticketData = await getSupportTicketById(ticketId);
      setTicket(ticketData);

      if (ticketData) {
        // Load customer profile
        const customerData = await getUserProfile(ticketData.userId);
        setCustomer(customerData);

        // Load related order if exists
        if (ticketData.orderId) {
          try {
            const orderData = await getOrderByNumber(ticketData.orderId);
            setRelatedOrder(orderData);
          } catch (e) {
            console.error('Error loading order:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !ticket || !adminUser) return;

    setSending(true);
    try {
      await addTicketMessage(ticketId, adminUser.uid, 'admin', replyMessage.trim());
      setReplyMessage('');
      // Reload ticket to get updated messages
      const updatedTicket = await getSupportTicketById(ticketId);
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: SupportTicket['status']) => {
    if (!ticket) return;

    setUpdatingStatus(true);
    try {
      await updateTicketStatus(ticketId, newStatus, adminUser?.email || undefined);
      setTicket({ ...ticket, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Ticket Not Found</h2>
        <Link href="/support">
          <Button variant="outline">Back to Support Tickets</Button>
        </Link>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;

  return (
    <div>
      <Link
        href="/support"
        className="mb-6 inline-flex items-center text-slate-600 hover:text-terracotta"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Support Tickets
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <CategoryIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-mono text-slate-500">{ticket.ticketNumber}</p>
                    <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Created {formatDate(ticket.createdAt)}
                </span>
                <span className="capitalize flex items-center gap-1">
                  <CategoryIcon className="h-4 w-4" />
                  {ticket.category.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-terracotta" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No messages yet. Send a reply below.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {ticket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.senderType === 'admin'
                            ? 'bg-terracotta text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.senderType === 'admin' ? 'text-white/70' : 'text-slate-500'
                          }`}
                        >
                          {msg.senderType === 'admin' ? 'Support Team' : ticket.userName} | {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {ticket.status !== 'closed' && (
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSendReply} disabled={sending || !replyMessage.trim()}>
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status === 'closed' && (
                <div className="text-center py-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">This ticket has been closed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Update Status
                </label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => handleStatusChange(value as SupportTicket['status'])}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full" onClick={loadTicketData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-terracotta" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-slate-900">{ticket.userName}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-4 w-4" />
                <span>{ticket.userEmail}</span>
              </div>
              {customer?.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <Link href={`/customers/${ticket.userId}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Related Order */}
          {ticket.orderId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-terracotta" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedOrder ? (
                  <div className="space-y-2">
                    <p className="font-mono text-sm text-slate-500">
                      {relatedOrder.orderNumber}
                    </p>
                    <p className="font-medium">{formatCurrency(relatedOrder.total)}</p>
                    <Badge className={
                      relatedOrder.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : relatedOrder.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {relatedOrder.orderStatus.replace('_', ' ')}
                    </Badge>
                    <Link href={`/orders/${relatedOrder.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Order
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">
                      Order #{ticket.orderId}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Could not load order details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-xs text-slate-500">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
                {ticket.status !== 'open' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Status Updated</p>
                      <p className="text-xs text-slate-500">{formatDate(ticket.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-slate-500">{formatDate(ticket.resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
