'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrdersByEmail, getOrderByNumber } from '@prakash/firebase';
import type { Order } from '@prakash/types';
import {
  Package,
  Loader2,
  ArrowLeft,
  Search,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';

export default function OrdersPage() {
  const t = useTranslations('orders');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user?.email) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      const data = await getOrdersByEmail(user.email);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchResult(null);
    try {
      const order = await getOrderByNumber(searchQuery.trim().toUpperCase());
      setSearchResult(order);
    } catch (error) {
      console.error('Error searching order:', error);
    } finally {
      setSearchLoading(false);
    }
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
      month: 'short',
      year: 'numeric',
    });
  };

  const getOrderStatusColor = (status: Order['orderStatus']) => {
    const colors: Record<Order['orderStatus'], string> = {
      new: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-purple-100 text-purple-700',
      packing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      return_requested: 'bg-orange-100 text-orange-700',
      return_approved: 'bg-lime-100 text-lime-700',
      return_rejected: 'bg-red-100 text-red-700',
      return_received: 'bg-cyan-100 text-cyan-700',
      refund_processing: 'bg-amber-100 text-amber-700',
      refunded: 'bg-emerald-100 text-emerald-700',
      exchanged: 'bg-teal-100 text-teal-700',
      exchange_delivered: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Order['orderStatus']) => {
    const labels: Record<Order['orderStatus'], string> = {
      new: t('statusNew') || 'New',
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome') || 'Back to Home'}
        </Link>

        <h1 className="text-2xl font-bold text-clay-brown mb-6">
          {t('title') || 'My Orders'}
        </h1>

        {/* Order Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {t('trackOrder') || 'Track Order'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('orderNumberPlaceholder') || 'Enter order number (e.g., PC...)'}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('search') || 'Search'
                )}
              </Button>
            </form>

            {searchResult && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-2">
                  {t('orderFound') || 'Order found!'}
                </p>
                <Link href={`/orders/${searchResult.orderNumber}`}>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-clay-brown">
                        {searchResult.orderNumber}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDate(searchResult.createdAt)} • {formatPrice(searchResult.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                          searchResult.orderStatus
                        )}`}
                      >
                        {getStatusLabel(searchResult.orderStatus)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {searchQuery && !searchLoading && !searchResult && (
              <p className="mt-4 text-sm text-red-600">
                {t('orderNotFound') || 'Order not found. Please check the order number.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-terracotta" />
                {t('orderHistory') || 'Order History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">{t('noOrders') || 'No orders yet'}</p>
                  <Link href="/shop">
                    <Button className="mt-4">
                      {t('startShopping') || 'Start Shopping'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <img
                                key={i}
                                src={item.image}
                                alt={item.title[locale as 'en' | 'hi']}
                                className="w-12 h-12 rounded-lg border-2 border-white object-cover"
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-12 h-12 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-clay-brown">
                              {order.orderNumber}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatDate(order.createdAt)} • {order.items.length}{' '}
                              {order.items.length === 1
                                ? (t('item') || 'item')
                                : (t('items') || 'items')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className="font-medium text-clay-brown">
                              {formatPrice(order.total)}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {getStatusLabel(order.orderStatus)}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {t('loginToView') || 'Login to view your orders'}
              </p>
              <Link href="/auth/login?redirect=/orders">
                <Button>{t('login') || 'Login'}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
