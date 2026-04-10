'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  getUserProfile,
  getUserOrderStats,
  getUserWallet,
  getWalletTransactions,
  adminCreditWallet,
  getOrdersByEmail,
} from '@prakash/firebase';
import type { UserProfile, OrderStats, UserWallet, WalletTransaction, Order } from '@prakash/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Wallet,
  Loader2,
  Calendar,
  Gift,
  Plus,
  Minus,
  ExternalLink,
  User,
  CreditCard,
  Package,
} from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export default function CustomerDetailPage({ params }: Props) {
  const { id: customerId } = use(params);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'addresses'>('overview');

  // Credit wallet form
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [crediting, setCrediting] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile(customerId);
      setCustomer(profile);

      if (profile?.email) {
        const [stats, walletData, txns, customerOrders] = await Promise.all([
          getUserOrderStats(profile.email),
          getUserWallet(customerId),
          getWalletTransactions(customerId, 20),
          getOrdersByEmail(profile.email, 20),
        ]);

        setOrderStats(stats);
        setWallet(walletData);
        setTransactions(txns);
        setOrders(customerOrders);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAmount || !creditDescription) return;

    setCrediting(true);
    try {
      await adminCreditWallet(customerId, parseFloat(creditAmount), creditDescription);
      // Reload wallet data
      const [walletData, txns] = await Promise.all([
        getUserWallet(customerId),
        getWalletTransactions(customerId, 20),
      ]);
      setWallet(walletData);
      setTransactions(txns);
      setShowCreditForm(false);
      setCreditAmount('');
      setCreditDescription('');
    } catch (error) {
      console.error('Error crediting wallet:', error);
    } finally {
      setCrediting(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
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

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-purple-100 text-purple-700',
      packing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Customer Not Found</h2>
        <Link href="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/customers"
        className="mb-6 inline-flex items-center text-slate-600 hover:text-terracotta"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center">
              {customer.photoURL ? (
                <img
                  src={customer.photoURL}
                  alt={customer.displayName || 'User'}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-terracotta font-bold text-3xl">
                  {(customer.displayName || customer.email || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {customer.displayName || 'No Name'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {orderStats?.totalOrders || 0}
                </p>
                <p className="text-sm text-slate-500">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(orderStats?.totalSpent || 0)}
                </p>
                <p className="text-sm text-slate-500">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-terracotta/20 rounded-lg">
                <Wallet className="h-6 w-6 text-terracotta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
                <p className="text-sm text-slate-500">Wallet Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {customer.addresses?.length || 0}
                </p>
                <p className="text-sm text-slate-500">Addresses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['overview', 'orders', 'wallet', 'addresses'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-medium">{customer.displayName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{customer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{customer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gender</p>
                  <p className="font-medium capitalize">{customer.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(customer.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Member Since</p>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Orders</span>
                  <span className="font-semibold">{orderStats?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Delivered</span>
                  <span className="font-semibold text-green-700">
                    {orderStats?.deliveredOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700">Pending</span>
                  <span className="font-semibold text-yellow-700">
                    {orderStats?.pendingOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700">Cancelled</span>
                  <span className="font-semibold text-red-700">
                    {orderStats?.cancelledOrders || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.orderNumber}</span>
                        <Badge className={getOrderStatusColor(order.orderStatus)}>
                          {order.orderStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {order.items?.length || 0} items | {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Wallet</CardTitle>
              {!showCreditForm && (
                <Button size="sm" onClick={() => setShowCreditForm(true)}>
                  <Gift className="h-4 w-4 mr-2" />
                  Add Credit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showCreditForm && (
                <form onSubmit={handleCreditWallet} className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
                  <h4 className="font-medium text-green-800">Credit Customer Wallet</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Amount (INR)"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      min="1"
                      required
                    />
                    <Input
                      placeholder="Description (e.g., Refund, Promotion)"
                      value={creditDescription}
                      onChange={(e) => setCreditDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={crediting}>
                      {crediting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Crediting...
                        </>
                      ) : (
                        'Credit Wallet'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreditForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-terracotta/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-terracotta">
                    {formatCurrency(wallet?.balance || 0)}
                  </p>
                  <p className="text-sm text-terracotta">Current Balance</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(wallet?.totalCredited || 0)}
                  </p>
                  <p className="text-sm text-green-600">Total Credited</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(wallet?.totalDebited || 0)}
                  </p>
                  <p className="text-sm text-red-600">Total Debited</p>
                </div>
              </div>

              <h4 className="font-medium text-slate-700 mb-4">Transaction History</h4>
              {transactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {txn.type === 'credit' ? (
                            <Plus className="h-4 w-4 text-green-600" />
                          ) : (
                            <Minus className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{txn.description}</p>
                          <p className="text-xs text-slate-500">{formatDateTime(txn.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Balance: {formatCurrency(txn.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'addresses' && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {!customer.addresses || customer.addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No addresses saved</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {customer.addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="capitalize">{addr.label}</Badge>
                      {addr.isDefault && (
                        <Badge className="bg-green-100 text-green-700">Default</Badge>
                      )}
                    </div>
                    <p className="font-medium text-slate-900">{addr.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{addr.address}</p>
                    {addr.landmark && (
                      <p className="text-sm text-slate-500">Near: {addr.landmark}</p>
                    )}
                    <p className="text-sm text-slate-600">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      <Phone className="h-3 w-3 inline mr-1" />
                      {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
