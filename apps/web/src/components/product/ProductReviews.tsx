'use client';

import { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getProductReviews, getProductReviewStats, submitProductReview } from '@prakash/firebase';
import { useAuth } from '@/context/AuthContext';
import { Star, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Review } from '@prakash/types';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<number, number>;
  }>({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    rating: 0,
    review: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        getProductReviews(productId),
        getProductReviewStats(productId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // Don't crash - just show empty state
      setReviews([]);
      setStats({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!formData.review.trim()) {
      toast.error('Please write your review');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitProductReview({
        productId,
        userId: user?.uid,
        customerName: formData.customerName || user?.displayName || 'Anonymous',
        email: formData.email || user?.email || '',
        rating: formData.rating,
        review: formData.review,
      });

      toast.success('Review submitted!', {
        description: 'Your review will be visible after admin approval.',
      });

      setFormData({ customerName: '', email: '', rating: 0, review: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-clay-brown">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
            <StarRating rating={Math.round(stats.averageRating)} size="lg" />
            <p className="mt-2 text-sm text-gray-600">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingBreakdown[star] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowForm(!showForm)}
          size="lg"
          className="bg-terracotta hover:bg-terracotta/90"
        >
          {showForm ? 'Cancel' : '✍️ Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-lg">
          <h3 className="text-xl font-bold text-clay-brown">Write Your Review</h3>

          {!user && (
            <>
              <Input
                placeholder="Your Name *"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </>
          )}

          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <User className="h-4 w-4" />
              <span>Posting as <strong>{user.displayName || 'Anonymous'}</strong></span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <StarRating
              rating={formData.rating}
              size="lg"
              interactive
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
            {formData.rating > 0 && (
              <p className="mt-1 text-sm text-terracotta">
                You selected: {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]}
              </p>
            )}
          </div>

          <Textarea
            placeholder="Share your experience with this product... What did you like? Any suggestions? *"
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            rows={5}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Your review will be published after admin approval
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-terracotta hover:bg-terracotta/90"
            disabled={isSubmitting || formData.rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-clay-brown">
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-clay-brown">{review.customerName}</p>
                      {review.isVerifiedPurchase && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="md" />
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.review}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}
