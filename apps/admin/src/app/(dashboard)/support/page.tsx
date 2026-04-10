'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllSupportTickets, updateTicketStatus } from '@prakash/firebase';
import type { SupportTicket } from '@prakash/types';
import {
  MessageSquare,
  Search,
  Loader2,
  RefreshCw,
  Clock,
  User,
  Eye,
  Package,
  CreditCard,
  Truck,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
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

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSupportTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    setUpdatingStatus(ticketId);
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets(prev =>
        prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.userEmail.toLowerCase().includes(query) ||
      ticket.userName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  const getStatusCounts = () => {
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={loadTickets}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-500 mt-1">Manage customer support requests ({tickets.length} total)</p>
        </div>
        <button
          onClick={loadTickets}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'All Tickets', color: 'border-slate-200 hover:border-terracotta/50', activeColor: 'border-terracotta bg-terracotta/5', textColor: 'text-slate-900' },
          { key: 'open', label: 'Open', color: 'border-slate-200 hover:border-blue-300', activeColor: 'border-blue-500 bg-blue-50', textColor: 'text-blue-600' },
          { key: 'in_progress', label: 'In Progress', color: 'border-slate-200 hover:border-yellow-300', activeColor: 'border-yellow-500 bg-yellow-50', textColor: 'text-yellow-600' },
          { key: 'resolved', label: 'Resolved', color: 'border-slate-200 hover:border-green-300', activeColor: 'border-green-500 bg-green-50', textColor: 'text-green-600' },
          { key: 'closed', label: 'Closed', color: 'border-slate-200 hover:border-slate-400', activeColor: 'border-slate-500 bg-slate-50', textColor: 'text-slate-600' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-colors ${
              statusFilter === item.key ? item.activeColor : item.color
            }`}
          >
            <p className={`text-xl sm:text-2xl font-bold ${item.textColor}`}>
              {statusCounts[item.key as keyof typeof statusCounts]}
            </p>
            <p className={`text-xs sm:text-sm ${item.textColor}`}>{item.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, subject, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-[180px] px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="order">Order Issue</option>
              <option value="payment">Payment Issue</option>
              <option value="delivery">Delivery Issue</option>
              <option value="product">Product Query</option>
              <option value="refund">Refund Request</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => {
              const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
              return (
                <div
                  key={ticket.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    {/* Main Content */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-slate-100 rounded-lg flex-shrink-0">
                        <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs sm:text-sm font-mono text-slate-500">
                            {ticket.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                            {ticket.category}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {ticket.subject}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{ticket.userName}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.messages.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.messages.length} messages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 justify-end">
                      <div className="relative">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            handleStatusChange(ticket.id, e.target.value as SupportTicket['status'])
                          }
                          disabled={updatingStatus === ticket.id}
                          className="appearance-none px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta bg-white disabled:opacity-50"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        {updatingStatus === ticket.id ? (
                          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        )}
                      </div>
                      <Link
                        href={`/support/${ticket.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
