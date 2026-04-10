'use client';

import { useEffect, useState } from 'react';
import { getAllEnquiries, updateEnquiryStatus, deleteEnquiry, getEnquiryStats } from '@prakash/firebase';
import type { Enquiry, EnquiryStatus } from '@prakash/types';
import {
  Search,
  Trash2,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  Building2,
  Package,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enquiriesData, statsData] = await Promise.all([
        getAllEnquiries(),
        getEnquiryStats(),
      ]);
      setEnquiries(enquiriesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load enquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    setActionLoading(id);
    try {
      await updateEnquiryStatus(id, newStatus);
      setEnquiries(
        enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      const oldEnquiry = enquiries.find((e) => e.id === id);
      if (oldEnquiry) {
        setStats((prev) => ({
          ...prev,
          [oldEnquiry.status]: prev[oldEnquiry.status as keyof typeof prev] - 1,
          [newStatus]: prev[newStatus as keyof typeof prev] + 1,
        }));
      }
    } catch (err) {
      console.error('Error updating enquiry status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    setActionLoading(id);
    try {
      await deleteEnquiry(id);
      const deleted = enquiries.find((e) => e.id === id);
      setEnquiries(enquiries.filter((e) => e.id !== id));
      if (deleted) {
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          [deleted.status]: prev[deleted.status as keyof typeof prev] - 1,
        }));
      }
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      alert('Failed to delete enquiry');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(search.toLowerCase()) ||
      enquiry.phone.includes(search) ||
      enquiry.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: EnquiryStatus) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  const businessTypeLabels: Record<string, string> = {
    shop: 'Retail Shop',
    reseller: 'Reseller',
    decorator: 'Event Decorator',
    individual: 'Individual',
    other: 'Other',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading enquiries...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Enquiries</h1>
          <p className="text-slate-500 mt-1">Manage bulk order enquiries ({enquiries.length} total)</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-600">New</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600">Contacted</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.contacted}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600">Closed</p>
          <p className="text-2xl font-bold text-green-700">{stats.closed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'new', 'contacted', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-terracotta text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-terracotta" />
            Enquiries ({filteredEnquiries.length})
          </h2>
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No enquiries found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {enquiry.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Building2 className="h-3 w-3" />
                        {businessTypeLabels[enquiry.businessType]}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Package className="h-3 w-3" />
                        Qty: {enquiry.quantity}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-600">
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="flex items-center gap-1 hover:text-terracotta"
                      >
                        <Phone className="h-4 w-4" />
                        {enquiry.phone}
                      </a>
                      {enquiry.email && (
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="flex items-center gap-1 hover:text-terracotta truncate max-w-[200px]"
                        >
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{enquiry.email}</span>
                        </a>
                      )}
                    </div>

                    <p className="text-slate-700 line-clamp-2">{enquiry.message}</p>

                    <div className="flex flex-wrap items-center gap-3">
                      {enquiry.referenceImage && (
                        <a
                          href={enquiry.referenceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-terracotta hover:underline"
                        >
                          View Reference Image
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDate(enquiry.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <div className="relative">
                      <select
                        value={enquiry.status}
                        onChange={(e) =>
                          handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                        }
                        disabled={actionLoading === enquiry.id}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta disabled:opacity-50"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      {actionLoading === enquiry.id ? (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(enquiry.id)}
                      disabled={actionLoading === enquiry.id}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {actionLoading === enquiry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
