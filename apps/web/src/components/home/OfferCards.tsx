'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getActiveOffers } from '@prakash/firebase';
import type { Offer } from '@prakash/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Tag,
  Percent,
  Gift,
  Megaphone,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  discount: <Percent className="h-5 w-5" />,
  deal: <Tag className="h-5 w-5" />,
  promotion: <Gift className="h-5 w-5" />,
  announcement: <Megaphone className="h-5 w-5" />,
};

const typeColors: Record<string, { bg: string; gradient: string; glow: string }> = {
  discount: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    gradient: 'from-red-500 to-rose-600',
    glow: 'shadow-red-500/30',
  },
  deal: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
  promotion: {
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
  announcement: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
};

const badgeBg: Record<string, string> = {
  discount: 'bg-red-100 text-red-700',
  deal: 'bg-amber-100 text-amber-700',
  promotion: 'bg-violet-100 text-violet-700',
  announcement: 'bg-blue-100 text-blue-700',
};

function getTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day left';
  if (days <= 7) return `${days} days left`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} left`;
}

export function OfferCards() {
  const locale = useLocale();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const data = await getActiveOffers();
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const offersPerView = typeof window !== 'undefined' 
    ? window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1
    : 3;
  
  const maxIndex = Math.max(0, offers.length - offersPerView);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!isPaused) {
        setDirection(1);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, 4000);
  }, [isPaused, maxIndex]);

  useEffect(() => {
    if (offers.length > 0) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [offers.length, startAutoPlay]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="h-9 w-48 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-1 w-24 bg-slate-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 h-80 bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-terracotta/5 via-transparent to-transparent" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-gold/10 to-terracotta/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 justify-center mb-4 px-6 py-2.5 bg-gradient-to-r from-terracotta/10 to-gold/10 rounded-full text-terracotta font-semibold text-sm border border-terracotta/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>{locale === 'hi' ? 'सीमित समय के ऑफ़र्स' : 'Limited Time Offers'}</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-clay-brown mb-3">
            <span className="bg-gradient-to-r from-clay-brown via-terracotta to-clay-brown bg-clip-text text-transparent">
              {locale === 'hi' ? '🔥 खास ऑफ़र्स' : '🔥 Special Offers'}
            </span>
          </h2>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-terracotta via-gold to-terracotta" />
        </motion.div>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          {offers.length > offersPerView && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden lg:flex items-center justify-center w-14 h-14 bg-white shadow-xl rounded-full hover:bg-gradient-to-br hover:from-terracotta hover:to-terracotta-dark hover:text-white transition-all duration-300 group border border-slate-100"
                aria-label="Previous offers"
              >
                <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden lg:flex items-center justify-center w-14 h-14 bg-white shadow-xl rounded-full hover:bg-gradient-to-br hover:from-terracotta hover:to-terracotta-dark hover:text-white transition-all duration-300 group border border-slate-100"
                aria-label="Next offers"
              >
                <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Carousel Track */}
          <div className="overflow-hidden rounded-3xl">
            <motion.div
              className="flex gap-6"
              animate={{
                x: `-${currentIndex * (100 / offersPerView)}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <AnimatePresence initial={false}>
                {offers.map((offer, index) => {
                  const title =
                    locale === 'hi' && offer.title.hi
                      ? offer.title.hi
                      : offer.title.en;
                  const description =
                    locale === 'hi' && offer.description.hi
                      ? offer.description.hi
                      : offer.description.en;
                  const colors = typeColors[offer.type] || typeColors.promotion;
                  const badgeClass = badgeBg[offer.type] || badgeBg.promotion;
                  const timeLeft = getTimeRemaining(offer.validUntil);

                  return (
                    <motion.div
                      key={offer.id}
                      className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        href={offer.link || '/shop'}
                        className="group block h-full rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 overflow-hidden relative"
                      >
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        {/* Premium Gradient Banner with Optional Image */}
                        <div className={`relative bg-gradient-to-br ${colors.gradient} px-6 py-10 sm:py-12 text-white overflow-hidden`}>
                          {/* Offer Image Background */}
                          {offer.image && (
                            <>
                              <img
                                src={offer.image}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              {/* Gradient overlay for text readability */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-60`} />
                            </>
                          )}

                          {/* Animated Decorative Elements (only when no image) */}
                          {!offer.image && (
                            <>
                              <motion.div
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"
                              />
                              <motion.div
                                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -right-4 -bottom-12 w-40 h-40 bg-white/5 rounded-full"
                              />
                              <motion.div
                                animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 rounded-full"
                              />
                            </>
                          )}
                          
                          {/* Sparkle Effects */}
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            className="absolute right-8 top-8"
                          >
                            <Sparkles className="h-5 w-5 text-white/40" />
                          </motion.div>

                          {/* Discount Badge */}
                          {offer.discount ? (
                            <div className="relative z-10">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border-2 border-white/30 shadow-lg"
                              >
                                <span className="text-2xl sm:text-3xl font-black">
                                  {offer.discount}%
                                </span>
                              </motion.div>
                              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                                {title}
                              </h3>
                            </div>
                          ) : (
                            <div className="relative z-10 flex items-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg"
                              >
                                {typeIcons[offer.type]}
                              </motion.div>
                              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                                {title}
                              </h3>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5 space-y-4 relative z-10">
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {description}
                          </p>

                          {/* Meta Row */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}>
                                {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {timeLeft}
                              </span>
                            </div>

                            {/* Shop Now Arrow */}
                            <motion.span
                              className="text-terracotta"
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="h-6 w-6" />
                            </motion.span>
                          </div>
                        </div>

                        {/* Bottom Gradient Line */}
                        <div className={`h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Pagination Dots */}
          {offers.length > offersPerView && (
            <div className="flex justify-center items-center gap-3 mt-10">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative overflow-hidden rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-gradient-to-r from-terracotta to-gold'
                      : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Mobile Navigation Arrows */}
          {offers.length > offersPerView && (
            <div className="flex justify-center gap-4 mt-6 lg:hidden">
              <button
                onClick={goPrev}
                className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-full hover:bg-terracotta hover:text-white transition-all duration-300 border border-slate-200"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goNext}
                className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-full hover:bg-terracotta hover:text-white transition-all duration-300 border border-slate-200"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
