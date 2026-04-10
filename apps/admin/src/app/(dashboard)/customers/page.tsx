'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllUsers,
  getUserOrderStats,
  getUserWallet,
} from '@prakash/firebase';
import type { UserProfile, OrderStats, UserWallet } from '@prakash/types';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Wallet,
  Eye,
  Loader2,
  UserCircle,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  X,
} from 'lucide-react';

interface CustomerWithStats extends UserProfile {
  orderStats?: OrderStats;
  wallet?: UserWallet;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<string | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(100);
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomerStats = async (customer: CustomerWithStats) => {
    if (!customer.email) return;

    setLoadingStats(customer.id);
    try {
      const [orderStats, wallet] = await Promise.all([
        getUserOrderStats(customer.email),
        getUserWallet(customer.id),
      ]);

      const updatedCustomer = {
        ...customer,
        orderStats,
        wallet: wallet || undefined,
      };

      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? updatedCustomer : c)
      );
      setSelectedCustomer(updatedCustomer);
    } catch (err) {
      console.error('Error loading customer stats:', err);
    } finally {
      setLoadingStats(null);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.email?.toLowerCase().includes(query) ||
      customer.displayName?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={loadCustomers}
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
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">Manage your customer base ({customers.length} customers)</p>
        </div>
        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="lg:col-span-2">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <UserCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Customers will appear here when they sign up'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id ? 'bg-terracotta/5 border-l-4 border-terracotta' : ''
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      if (!customer.orderStats) {
                        loadCustomerStats(customer);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-terracotta to-terracotta-dark rounded-full flex items-center justify-center flex-shrink-0">
                        {customer.photoURL ? (
                          <img
                            src={customer.photoURL}
                            alt={customer.displayName || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {(customer.displayName || customer.email || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {customer.displayName || 'No Name'}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{customer.email || 'No email'}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400">Joined</p>
                        <p className="text-sm font-medium text-slate-600">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* List Footer */}
              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-500">
                  Showing {filteredCustomers.length} of {customers.length} customers
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Detail Panel */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-terracotta to-terracotta-dark p-6 text-white relative">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    {selectedCustomer.photoURL ? (
                      <img
                        src={selectedCustomer.photoURL}
                        alt={selectedCustomer.displayName || 'User'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {(selectedCustomer.displayName || selectedCustomer.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedCustomer.displayName || 'No Name'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      ID: {selectedCustomer.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Information</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-slate-700">{selectedCustomer.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-slate-700">{selectedCustomer.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-slate-700">Joined {formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Addresses ({selectedCustomer.addresses?.length || 0})
                  </h4>
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.addresses.slice(0, 2).map((addr, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium capitalize text-slate-700">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 line-clamp-2">
                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No addresses saved</p>
                  )}
                </div>

                {/* Order Stats */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Statistics</h4>
                  {loadingStats === selectedCustomer.id ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
                    </div>
                  ) : selectedCustomer.orderStats ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedCustomer.orderStats.totalOrders}
                        </p>
                        <p className="text-xs font-medium text-blue-600">Total Orders</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {selectedCustomer.orderStats.deliveredOrders}
                        </p>
                        <p className="text-xs font-medium text-green-600">Delivered</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-yellow-700">
                          {selectedCustomer.orderStats.pendingOrders}
                        </p>
                        <p className="text-xs font-medium text-yellow-600">Pending</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl text-center">
                        <p className="text-lg font-bold text-slate-700">
                          {formatCurrency(selectedCustomer.orderStats.totalSpent)}
                        </p>
                        <p className="text-xs font-medium text-slate-500">Total Spent</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Click to load stats...</p>
                  )}
                </div>

                {/* Wallet */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Wallet Balance</h4>
                  {selectedCustomer.wallet ? (
                    <div className="p-4 bg-gradient-to-br from-terracotta/10 to-terracotta/5 rounded-xl border border-terracotta/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-terracotta/20 rounded-lg">
                          <Wallet className="h-5 w-5 text-terracotta" />
                        </div>
                        <span className="text-xl font-bold text-terracotta">
                          {formatCurrency(selectedCustomer.wallet.balance)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg">
                          <Wallet className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-slate-500">No wallet created</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <Link
                    href={`/customers/${selectedCustomer.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm sticky top-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
