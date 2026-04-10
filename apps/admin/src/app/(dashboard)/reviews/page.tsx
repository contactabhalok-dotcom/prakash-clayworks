'use client';

import { useEffect, useState } from 'react';
import { getAllReviews, deleteReview, toggleReviewApproval } from '@prakash/firebase';
import type { Review } from '@prakash/types';
import {
  Plus,
  Trash2,
  Loader2,
  Star,
  Check,
  X,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await toggleReviewApproval(id, !currentStatus);
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
      );
    } catch (err) {
      console.error('Error toggling review approval:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setActionLoading(id);
    try {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'approved') return review.isApproved;
    if (filter === 'pending') return !review.isApproved;
    return true;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchReviews}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reviews</h1>
          <p className="text-slate-500 mt-1">Manage customer reviews ({reviews.length} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/reviews/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Review</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'approved', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-terracotta text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === f ? 'bg-white/20' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-terracotta" />
            Reviews ({filteredReviews.length})
          </h2>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
            <p className="text-slate-500 mb-6">
              {filter !== 'all' ? 'Try changing the filter' : 'Add your first review'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className="font-medium text-slate-900">
                        {review.customerName}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-1">{review.review}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleToggleApproval(review.id, review.isApproved)}
                      disabled={actionLoading === review.id}
                      className={`p-2 rounded-lg transition-colors ${
                        review.isApproved
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={review.isApproved ? 'Unapprove' : 'Approve'}
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : review.isApproved ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {actionLoading === review.id ? (
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
