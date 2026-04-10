'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderByNumber, getRefundAccounts, createReturnRequest } from '@prakash/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Order, ReturnAction } from '@prakash/types';
import {
  Package,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Copy,
  Check,
  ArrowLeftRight,
} from 'lucide-react';
import { ReturnRequestModal } from '@/components/returns/ReturnRequestModal';

export default function OrderDetailsPage() {
  const t = useTranslations('orders');
  const locale = useLocale();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Return modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [refundAccounts, setRefundAccounts] = useState<{ id: string; type: string; accountName: string; upiId?: string }[]>([]);

  const openReturnModal = async () => {
    if (user?.uid) {
      try {
        const accounts = await getRefundAccounts(user.uid);
        setRefundAccounts(accounts as any);
      } catch {}
    }
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (data: {
    itemIndex: number;
    action: ReturnAction;
    reason: string;
    reasonDetail: string;
    exchangeProductId?: string;
    refundAccountId?: string;
  }) => {
    if (!order || !user?.uid) return;
    const item = order.items[data.itemIndex];

    await createReturnRequest({
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: user.uid,
      customerEmail: order.customer.email || '',
      customerPhone: order.customer.phone,
      itemIndex: data.itemIndex,
      itemId: item.productId,
      itemTitle: item.title,
      itemQuantity: item.quantity,
      itemPrice: item.price,
      reason: data.reason,
      reasonDetail: data.reasonDetail,
      action: data.action,
      exchangeProductId: data.exchangeProductId,
      refundAccountId: data.refundAccountId,
    });

    // Refresh order
    const updated = await getOrderByNumber(orderNumber);
    setOrder(updated);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderByNumber(orderNumber);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const orderStatuses: Order['orderStatus'][] = [
    'new',
    'confirmed',
    'packing',
    'shipped',
    'delivered',
  ];

  const getStatusIndex = (status: Order['orderStatus']) => {
    if (status === 'cancelled') return -1;
    return orderStatuses.indexOf(status);
  };

  const getStatusLabel = (status: Order['orderStatus']) => {
    const labels: Record<Order['orderStatus'], string> = {
      new: t('statusNew') || 'Order Placed',
      confirmed: t('statusConfirmed') || 'Confirmed',
      packing: t('statusPacking') || 'Packing',
      shipped: t('statusShipped') || 'Shipped',
      delivered: t('statusDelivered') || 'Delivered',
      cancelled: t('statusCancelled') || 'Cancelled',
      return_requested: t('statusReturnRequested') || 'Return Requested',
      return_approved: t('statusReturnApproved') || 'Return Approved',
      return_rejected: t('statusReturnRejected') || 'Return Rejected',
      return_received: t('statusReturnReceived') || 'Return Received',
      refund_processing: t('statusRefundProcessing') || 'Refund Processing',
      refunded: t('statusRefunded') || 'Refunded',
      exchanged: t('statusExchanged') || 'Exchanged',
      exchange_delivered: t('statusExchangeDelivered') || 'Exchange Delivered',
    };
    return labels[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-warm-beige/20 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/orders"
            className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToOrders') || 'Back to Orders'}
          </Link>

          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {t('orderNotFound') || 'Order not found'}
              </p>
              <Link href="/orders">
                <Button className="mt-4">
                  {t('viewAllOrders') || 'View All Orders'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToOrders') || 'Back to Orders'}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-clay-brown flex items-center gap-2">
              {t('orderDetails') || 'Order Details'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500">{order.orderNumber}</span>
              <button
                onClick={copyOrderNumber}
                className="text-slate-400 hover:text-terracotta"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-terracotta" />
                  {t('orderStatus') || 'Order Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.orderStatus === 'cancelled' ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-medium">
                      {t('orderCancelled') || 'Order Cancelled'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex justify-between mb-8">
                      {orderStatuses.map((status, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div key={status} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-slate-200 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : index === 3 ? (
                                <Truck className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <span
                              className={`text-xs mt-2 text-center ${
                                isCompleted ? 'text-green-600 font-medium' : 'text-slate-400'
                              }`}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-center mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-500">
                    {t('orderedOn') || 'Ordered on'} {formatDate(order.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('items') || 'Items'} ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.title[locale as 'en' | 'hi']}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-clay-brown">
                          {item.title[locale as 'en' | 'hi']}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('qty') || 'Qty'}: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-clay-brown">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t('orderSummary') || 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal') || 'Subtotal'}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('shipping') || 'Shipping'}</span>
                  <span>
                    {order.shipping === 0
                      ? t('free') || 'Free'
                      : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-clay-brown pt-3 border-t">
                  <span>{t('total') || 'Total'}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      {order.paymentMethod === 'cod'
                        ? t('cod') || 'Cash on Delivery'
                        : t('online') || 'Paid Online'}
                    </span>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.paymentStatus === 'paid'
                        ? t('paid') || 'Paid'
                        : order.paymentStatus === 'failed'
                        ? t('failed') || 'Failed'
                        : t('pending') || 'Pending'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-terracotta" />
                  {t('shippingAddress') || 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-600">
                <p className="font-medium text-clay-brown">{order.customer.name}</p>
                <p>{order.customer.address}</p>
                <p>
                  {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="hover:text-terracotta"
                  >
                    {order.customer.phone}
                  </a>
                </div>
                {order.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="hover:text-terracotta"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Need Help & Return */}
            <Card>
              <CardContent className="py-4 space-y-3">
                <p className="text-sm text-slate-500">
                  {t('needHelp') || 'Need help with your order?'}
                </p>
                {order.orderStatus === 'delivered' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={openReturnModal}
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Return / Exchange
                  </Button>
                )}
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    {t('contactUs') || 'Contact Us'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && order && (
        <ReturnRequestModal
          order={order}
          onClose={() => setShowReturnModal(false)}
          onSubmit={handleReturnSubmit}
          refundAccounts={refundAccounts}
        />
      )}
    </div>
  );
}
