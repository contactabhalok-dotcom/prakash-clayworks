'use client';

import { useEffect, useState } from 'react';
import { getAllBanners, deleteBanner, toggleBannerStatus } from '@prakash/firebase';
import type { Banner } from '@prakash/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBanners();
      setBanners(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await toggleBannerStatus(id, !currentStatus);
      setBanners(
        banners.map((b) => (b.id === id ? { ...b, isActive: !currentStatus } : b))
      );
    } catch (err) {
      console.error('Error toggling banner status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setActionLoading(id);
    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading banners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchBanners}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Banners</h1>
          <p className="text-slate-500 mt-1">Manage homepage banners ({banners.length} banners)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/banners/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Banner</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-terracotta" />
            All Banners ({banners.length})
          </h2>
        </div>

        {banners.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No banners yet</h3>
            <p className="text-slate-500 mb-6">Start by adding your first banner</p>
            <Link
              href="/banners/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add First Banner
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <GripVertical className="h-5 w-5 text-slate-400 cursor-grab flex-shrink-0 hidden sm:block" />

                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title.en}
                        className="w-20 h-12 sm:w-24 sm:h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-12 sm:w-24 sm:h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{banner.title.en}</h3>
                      <p className="text-sm text-slate-500 truncate">{banner.subtitle.en}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          banner.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-slate-400">Order: {banner.order}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                      disabled={actionLoading === banner.id}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      title={banner.isActive ? 'Hide banner' : 'Show banner'}
                    >
                      {actionLoading === banner.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : banner.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={`/banners/${banner.id}`}
                      className="p-2 text-slate-500 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(banner.id, banner.title.en)}
                      disabled={actionLoading === banner.id}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {actionLoading === banner.id ? (
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
