'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ChevronDown, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getActiveBanners } from '@prakash/firebase';
import type { Banner } from '@prakash/types';

export function HeroBanner() {
  const t = useTranslations('hero');
  const { scrollY } = useScroll();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Fetch active banners from Firestore
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const activeBanners = await getActiveBanners();
        if (activeBanners.length > 0) {
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const yBackground = useTransform(scrollY, [0, 500], [0, -150]);

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-warm-beige via-white to-warm-beige/50">
      {/* ===== PREMIUM ANIMATED BACKGROUND ===== */}
      <motion.div style={{ y: yBackground }} className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3], x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-gradient-to-br from-terracotta/20 via-gold/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.45, 0.2], x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-40 -left-40 h-[400px] w-[400px] sm:h-[700px] sm:w-[700px] rounded-full bg-gradient-to-tr from-gold/20 via-terracotta/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], x: [0, 60, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 h-[500px] w-[500px] sm:h-[800px] sm:w-[800px] rounded-full bg-gradient-to-r from-clay-brown/10 via-terracotta/10 to-gold/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-0 bg-[linear-gradient(rgba(189,111,52,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(189,111,52,0.04)_1px,transparent_1px)] bg-[size:80px_80px]"
        />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -40, 0], x: [0, i % 2 === 0 ? 30 : -30, 0], opacity: [0.1, 0.5, 0.1], scale: [0.6, 1.3, 0.6], rotate: [0, 180, 360] }}
            transition={{ duration: 8 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            className="absolute w-2 h-2 bg-gradient-to-br from-terracotta/40 to-gold/40 rounded-full blur-sm"
            style={{ left: `${10 + i * 9}%`, top: `${15 + (i % 4) * 20}%` }}
          />
        ))}
      </motion.div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center py-10 sm:py-14 lg:py-20">
          <div className="grid gap-8 sm:gap-10 lg:gap-14 grid-cols-1 lg:grid-cols-2 w-full items-center max-w-7xl mx-auto">

            {/* ===== LEFT CONTENT ===== */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-start justify-center space-y-4 sm:space-y-5 lg:space-y-7 py-4 lg:py-0"
            >
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
                className="flex flex-wrap justify-center gap-2 sm:gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-terracotta/15 to-gold/15 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-terracotta border border-terracotta/30 shadow-xl backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="tracking-wide">{t('handmadeWithLove')}</span>
                  <div className="flex -space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold/15 to-amber-500/15 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-gold border border-gold/30 shadow-xl backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="tracking-wide">Premium Quality</span>
                </motion.div>
              </motion.div>

              {/* Main Heading - Dynamic from Firestore or default */}
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-center lg:text-left">
                  <span className="bg-gradient-to-r from-clay-brown via-terracotta to-gold bg-clip-text text-transparent drop-shadow-sm">
                    {currentBanner?.title?.en || t('title')}
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle - Dynamic from Firestore or default */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="max-w-xl text-base sm:text-lg text-clay-brown/75 leading-relaxed font-medium text-center lg:text-left"
              >
                {currentBanner?.subtitle?.en || t('subtitle')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-3 sm:gap-4 w-full justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-terracotta to-gold opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
                  <Button size="lg" className="relative min-h-[50px] sm:min-h-[56px] px-6 sm:px-8 text-sm sm:text-base font-bold shadow-xl bg-gradient-to-r from-terracotta to-terracotta hover:from-terracotta hover:to-gold transition-all duration-300 rounded-xl text-white" asChild>
                    <Link href={currentBanner?.buttonLink || '/shop'} className="flex items-center gap-2">
                      {currentBanner?.buttonText?.en || t('shopNow')}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-h-[50px] sm:min-h-[56px] px-6 sm:px-8 text-sm sm:text-base font-bold border-2 border-clay-brown/40 text-clay-brown hover:bg-terracotta/10 hover:border-terracotta hover:text-terracotta transition-all duration-300 rounded-xl"
                    asChild
                  >
                    <Link href="/shop" className="flex items-center gap-2">
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('exploreCollection')}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Banner Indicators (if multiple banners) */}
              {banners.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex gap-2 mt-4"
                >
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentBannerIndex
                          ? 'w-8 bg-gradient-to-r from-terracotta to-gold'
                          : 'w-2 bg-clay-brown/30 hover:bg-clay-brown/50'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* ===== RIGHT - HERO IMAGE ===== */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="relative flex items-center justify-center py-8 lg:py-0"
            >
              {/* Main image container - Clean premium design */}
              <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-xl">

                {/* Layer 1: Soft ambient glow behind image */}
                <motion.div
                  animate={{ opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 sm:-inset-12 rounded-2xl bg-gradient-to-br from-terracotta/25 via-gold/15 to-transparent blur-2xl"
                />

                {/* Layer 2: Main image with elegant shadow */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(74,44,26,0.3)]"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Main hero image */}
                  <img
                    src="/hero.png"
                    alt="Handcrafted Terracotta Products"
                    className="w-full h-auto object-contain"
                    style={{ objectPosition: 'center center' }}
                    loading="eager"
                  />
                  
                  {/* Subtle top gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-clay-brown/10 pointer-events-none" />
                </motion.div>

                {/* Layer 3: Elegant corner accents */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -top-3 -left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-terracotta/40 bg-gradient-to-br from-terracotta/10 to-transparent"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -bottom-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gold/40 bg-gradient-to-tl from-gold/10 to-transparent"
                />

                {/* Layer 4: Small floating badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.7, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 flex items-center gap-1.5 sm:gap-2 bg-white rounded-xl shadow-lg px-3 sm:px-4 py-2 sm:py-2.5 border border-clay-brown/10"
                >
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-clay-brown">Premium Quality</span>
                </motion.div>

                {/* Layer 5: Top-right sparkle */}
                <motion.div
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                  className="absolute -top-2 -right-2 text-gold"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-md">
                    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                  </svg>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer">
          <span className="text-xs sm:text-sm font-semibold text-clay-brown/70 tracking-wide">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-terracotta" />
        </motion.div>
      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
