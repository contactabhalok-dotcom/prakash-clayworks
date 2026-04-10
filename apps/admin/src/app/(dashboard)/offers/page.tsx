'use client';

import { useEffect, useState } from 'react';
import { getAllOffers, deleteOffer, toggleOfferStatus } from '@prakash/firebase';
import type { Offer } from '@prakash/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Megaphone,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

const typeBadgeColors: Record<string, string> = {
  discount: 'bg-red-100 text-red-700',
  deal: 'bg-amber-100 text-amber-700',
  promotion: 'bg-violet-100 text-violet-700',
  announcement: 'bg-blue-100 text-blue-700',
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllOffers();
      setOffers(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await toggleOfferStatus(id, !currentStatus);
      setOffers(
        offers.map((o) => (o.id === id ? { ...o, isActive: !currentStatus } : o))
      );
    } catch (err) {
      console.error('Error toggling offer status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setActionLoading(id);
    try {
      await deleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Error deleting offer:', err);
      alert('Failed to delete offer');
    } finally {
      setActionLoading(null);
    }
  };

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    if (!offer.isActive) return { label: 'Inactive', color: 'text-slate-400', bg: 'bg-slate-100', icon: <XCircle className="h-3.5 w-3.5" /> };
    if (offer.validFrom > now) return { label: 'Scheduled', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock className="h-3.5 w-3.5" /> };
    if (offer.validUntil < now) return { label: 'Expired', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="h-3.5 w-3.5" /> };
    return { label: 'Active', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchOffers}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const activeCount = offers.filter((o) => {
    const now = new Date();
    return o.isActive && o.validFrom <= now && o.validUntil >= now;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Offers & Announcements</h1>
          <p className="text-slate-500 mt-1">Manage promotional offers and website announcements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOffers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/offers/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Offer</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{offers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-600">Scheduled/Expired</p>
          <p className="text-2xl font-bold text-amber-700">{offers.length - activeCount - offers.filter(o => !o.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-slate-700">{offers.filter(o => !o.isActive).length}</p>
        </div>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Megaphone className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No offers yet</h3>
          <p className="text-slate-500 mb-6">Start by adding your first offer, discount, or announcement</p>
          <Link
            href="/offers/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add First Offer
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const status = getOfferStatus(offer);
            return (
              <div
                key={offer.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Top Banner */}
                {offer.image ? (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={offer.image}
                      alt={offer.title.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-20 bg-gradient-to-r from-terracotta/10 to-orange-50 flex items-center justify-center">
                    <Megaphone className="h-8 w-8 text-terracotta/40" />
                  </div>
                )}

                {/* Discount Badge */}
                {offer.discount && (
                  <div className="absolute top-3 right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-terracotta">
                    <span className="text-sm font-black text-terracotta">{offer.discount}%</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate">{offer.title.en}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{offer.description.en}</p>
                  </div>

                  {/* Status & Type Row */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[offer.type]}`}>
                      {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                    </span>
                    {offer.showAsAnnouncement && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Announcement
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {offer.validFrom.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {offer.validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleStatus(offer.id, offer.isActive)}
                      disabled={actionLoading === offer.id}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        offer.isActive
                          ? 'text-green-700 hover:bg-green-50'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {actionLoading === offer.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : offer.isActive ? (
                        <><Eye className="h-3.5 w-3.5" /> Active</>
                      ) : (
                        <><EyeOff className="h-3.5 w-3.5" /> Inactive</>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/offers/${offer.id}`}
                        className="p-1.5 text-slate-400 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(offer.id, offer.title.en)}
                        disabled={actionLoading === offer.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {actionLoading === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
