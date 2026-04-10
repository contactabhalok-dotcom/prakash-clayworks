'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Star, Quote, Loader2 } from 'lucide-react';
import { getAllReviews } from '@prakash/firebase';
import type { Review } from '@prakash/types';

export function ReviewsSection() {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getAllReviews();
        // Only show approved reviews
        const approved = data.filter(r => r.isApproved);
        setReviews(approved.slice(0, 6)); // Show max 6 reviews
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section id="testimonials" className="bg-gradient-to-b from-clay-brown to-clay-brown/90 py-16 sm:py-20 md:py-24 relative overflow-hidden scroll-mt-16">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {t('title')}
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">{t('subtitle')}</p>
            <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gold" />
          </motion.div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => {
              const customerName = review.customerName || 'Happy Customer';

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="relative rounded-2xl bg-white p-6 sm:p-8 h-full hover:shadow-2xl transition-all duration-300 border border-clay-brown/10">
                    {/* Quote Icon */}
                    <Quote className="absolute right-4 top-4 h-10 w-10 text-terracotta/10 group-hover:text-terracotta/20 transition-colors" />

                    {/* Stars */}
                    <div className="mb-5 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                            i < review.rating
                              ? 'fill-gold text-gold'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="mb-6 text-clay-brown/80 leading-relaxed text-sm sm:text-base">
                      "{review.review}"
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 pt-4 border-t border-clay-brown/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-orange-600 text-white font-bold text-lg shadow-lg">
                        {customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-clay-brown group-hover:text-terracotta transition-colors">
                          {customerName}
                        </p>
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gold/30 group-hover:bg-gold/50 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 sm:mt-16 text-center"
          >
            <div className="inline-flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-6 w-6 ${
                    i < Math.round(avgRating)
                      ? 'fill-gold text-gold'
                      : 'fill-white/20 text-white/20'
                  }`} />
                ))}
              </div>
              <p className="text-white text-xl sm:text-2xl font-bold">
                {avgRating.toFixed(1)} out of 5
              </p>
              <p className="text-white/70 text-sm">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
