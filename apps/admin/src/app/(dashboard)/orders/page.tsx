'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { getAllOrders, updateOrderStatus } from '@prakash/firebase';
import type { Order, OrderStatus } from '@prakash/types';
import {
  Search,
  Loader2,
  Eye,
  Package,
  Filter,
  RefreshCw,
  AlertTriangle,
  ShoppingCart,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  RotateCcw,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';

const ORDER_STATUSES: { value: OrderStatus; label: string; icon: typeof Clock; color: string }[] = [
  { value: 'new', label: 'New', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'packing', label: 'Packing', icon: Package, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
  { value: 'return_requested', label: 'Return Requested', icon: RotateCcw, color: 'bg-orange-100 text-orange-700' },
  { value: 'return_approved', label: 'Return Approved', icon: Check, color: 'bg-lime-100 text-lime-700' },
  { value: 'return_rejected', label: 'Return Rejected', icon: XCircle, color: 'bg-red-100 text-red-700' },
  { value: 'return_received', label: 'Return Received', icon: Package, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'refund_processing', label: 'Refund Processing', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { value: 'refunded', label: 'Refunded', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'exchanged', label: 'Exchanged', icon: ArrowRightLeft, color: 'bg-teal-100 text-teal-700' },
  { value: 'exchange_delivered', label: 'Exchange Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusConfig = (status: OrderStatus) => {
    return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.orderStatus === 'new').length,
    processing: orders.filter((o) => ['confirmed', 'packing'].includes(o.orderStatus)).length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Manage customer orders ({orders.length} total)</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">All Orders</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-600">New</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600">Processing</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.processing}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm text-purple-600">Shipped</p>
          <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600">Delivered</p>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order number, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta appearance-none bg-white min-w-[180px]"
            >
              <option value="all">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-slate-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here when customers place them'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Order</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Customer</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Items</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Total</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Payment</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-medium text-slate-900">{order.customer.name}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden"
                              >
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-slate-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-semibold text-slate-900">{formatPrice(order.total)}</p>
                          <p className="text-xs text-slate-500 uppercase">{order.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="relative">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            disabled={updatingStatus === order.id}
                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-offset-1 ${statusConfig.color} ${
                              updatingStatus === order.id ? 'opacity-50' : ''
                            }`}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {updatingStatus === order.id ? (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin" />
                          ) : (
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/orders/${order.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
