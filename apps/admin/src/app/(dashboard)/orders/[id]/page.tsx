'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { getOrderById, updateOrderStatus, updatePaymentStatus } from '@prakash/firebase';
import type { Order, OrderStatus, PaymentStatus } from '@prakash/types';
import {
  Loader2,
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packing', label: 'Packing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (params.id) {
        const data = await getOrderById(params.id as string);
        setOrder(data);
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, orderStatus: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updatePaymentStatus(order.id, newStatus);
      setOrder({ ...order, paymentStatus: newStatus });
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus): 'default' | 'success' | 'warning' | 'info' | 'danger' => {
    const variants: Record<OrderStatus, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      new: 'info',
      confirmed: 'info',
      packing: 'warning',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'danger',
      return_requested: 'warning',
      return_approved: 'info',
      return_rejected: 'danger',
      return_received: 'info',
      refund_processing: 'warning',
      refunded: 'success',
      exchanged: 'info',
      exchange_delivered: 'success',
    };
    return variants[status];
  };

  const getPaymentBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Order not found</p>
        <Link href="/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              Order {order.orderNumber}
            </h1>
            <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
              {order.orderStatus}
            </Badge>
          </div>
          <p className="text-slate-500">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title.en}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.title.en}</p>
                      <p className="text-sm text-slate-500">{item.title.hi}</p>
                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">
                      {order.customer.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">
                      {order.customer.phone}
                    </p>
                  </div>
                </div>
                {order.customer.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg md:col-span-2">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900">
                  {order.customer.name}
                </p>
                <p className="text-slate-600">{order.customer.address}</p>
                <p className="text-slate-600">
                  {order.customer.city}, {order.customer.state} -{' '}
                  {order.customer.pincode}
                </p>
                <p className="text-slate-600 mt-2">Phone: {order.customer.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={order.orderStatus}
                onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Method</span>
                <Badge variant="default" className="uppercase">
                  {order.paymentMethod}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Status
                </label>
                <Select
                  value={order.paymentStatus}
                  onValueChange={(value) =>
                    handlePaymentStatusChange(value as PaymentStatus)
                  }
                  disabled={updating}
                >
                  <SelectTrigger>
                    <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {order.payuPaymentId && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">PayU Payment ID</p>
                  <p className="font-mono text-sm text-slate-900 break-all">
                    {order.payuPaymentId}
                  </p>
                </div>
              )}

              {order.payuTransactionId && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">PayU Transaction ID</p>
                  <p className="font-mono text-sm text-slate-900 break-all">
                    {order.payuTransactionId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full">
                  Back to Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
