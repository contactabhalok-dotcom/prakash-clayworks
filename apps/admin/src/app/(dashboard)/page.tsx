'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { getOrderStats, getAllOrders, getAllProducts, getAllUsers, getAllSupportTickets } from '@prakash/firebase';
import type { Order, Product, SupportTicket } from '@prakash/types';
import {
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  Users,
  HeadphonesIcon,
  ArrowUpRight,
  AlertTriangle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  openTickets: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [openTickets, setOpenTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderStats, orders, products, customers, tickets] = await Promise.all([
        getOrderStats(),
        getAllOrders(),
        getAllProducts(),
        getAllUsers(100),
        getAllSupportTickets(),
      ]);

      const openTicketsList = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');

      setStats({
        totalOrders: orderStats.total,
        newOrders: orderStats.new,
        processingOrders: orderStats.processing,
        completedOrders: orderStats.completed,
        totalRevenue: orderStats.totalRevenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        openTickets: openTicketsList.length,
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(products.filter((p) => p.stock <= 5).slice(0, 5));
      setOpenTickets(openTicketsList.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const getStatusColor = (status: Order['orderStatus']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-indigo-100 text-indigo-700',
      packing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <IndianRupee className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">All Time</span>
          </div>
          <p className="text-green-100 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <Link href="/orders" className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors">
              View All
            </Link>
          </div>
          <p className="text-blue-100 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{stats?.totalOrders || 0}</p>
        </div>

        {/* Customers Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <Link href="/customers" className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors">
              View All
            </Link>
          </div>
          <p className="text-purple-100 text-sm font-medium">Total Customers</p>
          <p className="text-3xl font-bold mt-1">{stats?.totalCustomers || 0}</p>
        </div>

        {/* Products Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <Link href="/products" className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors">
              View All
            </Link>
          </div>
          <p className="text-orange-100 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold mt-1">{stats?.totalProducts || 0}</p>
        </div>
      </div>

      {/* Order Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.newOrders || 0}</p>
              <p className="text-sm text-slate-500">New Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.processingOrders || 0}</p>
              <p className="text-sm text-slate-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {recentOrders.filter(o => o.orderStatus === 'shipped').length}
              </p>
              <p className="text-sm text-slate-500">In Transit</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.completedOrders || 0}</p>
              <p className="text-sm text-slate-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-lg text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-terracotta hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500 truncate">{order.customer.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-slate-900">{formatPrice(order.total)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg text-slate-900">Support Tickets</h2>
              {(stats?.openTickets || 0) > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {stats?.openTickets} open
                </span>
              )}
            </div>
            <Link href="/support" className="text-sm text-terracotta hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {openTickets.length === 0 ? (
              <div className="p-8 text-center">
                <HeadphonesIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No open tickets</p>
              </div>
            ) : (
              openTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${ticket.status === 'open' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                    <HeadphonesIcon className={`h-4 w-4 ${ticket.status === 'open' ? 'text-blue-600' : 'text-yellow-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                    <p className="text-sm text-slate-500 truncate">{ticket.userName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg text-slate-900">Low Stock Alert</h2>
              {lowStockProducts.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                  {lowStockProducts.length} items
                </span>
              )}
            </div>
            <Link href="/products" className="text-sm text-terracotta hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">All products well stocked</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title.en}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{product.title.en}</p>
                    <p className="text-sm text-slate-500">{formatPrice(product.price)}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
