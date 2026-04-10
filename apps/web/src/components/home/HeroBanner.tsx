'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Truck, Leaf, Award, ChevronDown, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroBanner() {
  const t = useTranslations('hero');
  const { scrollY } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const progress = Math.min(latest / (window.innerHeight || 800), 1);
    setScrollProgress(progress);
  });

  const yBackground = useTransform(scrollY, [0, 500], [0, -150]);
  const yForeground = useTransform(scrollY, [0, 500], [0, -80]);
  const opacityOverlay = useTransform(scrollY, [0, 300], [0, 0.6]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-warm-beige via-white to-warm-beige/50">
      {/* ===== PREMIUM ANIMATED BACKGROUND ===== */}
      <motion.div style={{ y: yBackground }} className="absolute inset-0 overflow-hidden">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[800px] sm:w-[800px] rounded-full bg-gradient-to-r from-clay-brown/10 via-terracotta/10 to-gold/10 blur-3xl"
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
      <motion.div style={{ y: yForeground }} className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid gap-8 sm:gap-10 lg:gap-14 grid-cols-1 lg:grid-cols-2 w-full items-center max-w-7xl mx-auto">

            {/* ===== LEFT CONTENT ===== */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-start justify-center space-y-4 sm:space-y-5 lg:space-y-7"
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
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="tracking-wide">Premium Quality</span>
                </motion.div>
              </motion.div>

              {/* Main Heading */}
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-center lg:text-left">
                  <span className="bg-gradient-to-r from-clay-brown via-terracotta to-gold bg-clip-text text-transparent drop-shadow-sm">
                    {t('title')}
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="max-w-xl text-base sm:text-lg text-clay-brown/75 leading-relaxed font-medium text-center lg:text-left"
              >
                {t('subtitle')}
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
                    <Link href="/shop" className="flex items-center gap-2">
                      {t('shopNow')}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="min-h-[50px] sm:min-h-[56px] px-6 sm:px-8 text-sm sm:text-base font-bold border-2 border-clay-brown/30 text-clay-brown hover:bg-warm-beige/60 hover:border-terracotta/50 transition-all duration-300 rounded-xl" asChild>
                    <Link href="/shop" className="flex items-center gap-2">
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('exploreCollection')}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ===== RIGHT - HERO IMAGE ===== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-r from-terracotta/30 via-gold/30 to-terracotta/30 blur-2xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 sm:-inset-2.5 rounded-full bg-gradient-to-r from-terracotta via-gold to-terracotta p-[2px] sm:p-[2.5px] shadow-2xl"
                >
                  <div className="h-full w-full rounded-full bg-transparent" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-[240px] w-[240px] sm:h-[340px] sm:w-[340px] md:h-[400px] md:w-[400px] overflow-hidden rounded-full bg-gradient-to-br from-warm-beige to-white shadow-2xl lg:h-[460px] lg:w-[460px]"
                >
                  <img src="/hero.jpeg" alt="Handcrafted Terracotta Products" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(74,44,26,0.15)_100%)]" />
                </motion.div>

                {/* Floating Card 1 */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-2 sm:-left-6 -top-4 sm:-top-6 z-10">
                  <div className="rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-xl p-2.5 sm:p-4 shadow-xl border border-slate-100/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                        <Leaf className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-clay-brown text-xs sm:text-sm">{t('ecoFriendly')}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">{t('naturalClay')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -right-2 sm:-right-6 top-[10%] sm:top-[15%] z-10">
                  <div className="rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-xl p-2.5 sm:p-4 shadow-xl border border-slate-100/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                        <Truck className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-clay-brown text-xs sm:text-sm">{t('panIndia')}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">{t('freeDelivery500')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quality Badge */}
                <motion.div animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-1 sm:-right-2 -top-2 sm:-top-3 z-10">
                  <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold to-amber-500 p-2.5 sm:p-3.5 shadow-2xl">
                    <Award className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== FULL-WIDTH TRUST FEATURES ===== */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-7xl mx-auto">
            {[
              { icon: Leaf, label: t('ecoFriendly'), sublabel: t('naturalClay'), color: 'from-green-500 to-emerald-500' },
              { icon: Truck, label: t('panIndia'), sublabel: t('freeDelivery500'), color: 'from-blue-500 to-indigo-500' },
              { icon: Award, label: 'Premium Quality', sublabel: 'Handcrafted with love', color: 'from-gold to-amber-500' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br border border-clay-brown/10 shadow-lg backdrop-blur-sm cursor-default transition-all duration-300 hover:shadow-xl flex-1 min-w-[160px] sm:min-w-[220px] justify-center"
              >
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg flex-shrink-0`}>
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-clay-brown text-xs sm:text-sm">{feature.label}</p>
                  <p className="text-[10px] sm:text-xs text-clay-brown/65 font-medium hidden sm:block">{feature.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== FULL-WIDTH STATS ===== */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-7xl mx-auto">
            {[
              { value: '500+', label: t('happyCustomers'), gradient: 'from-terracotta to-gold' },
              { value: '100+', label: t('uniqueProducts'), gradient: 'from-gold to-terracotta' },
              { value: '50+', label: t('artisans'), gradient: 'from-clay-brown to-terracotta' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 1 + i * 0.1 }}
                whileHover={{ scale: 1.08, y: -5 }}
                className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br border border-clay-brown/10 shadow-lg backdrop-blur-sm cursor-default flex-1 min-w-[140px] sm:min-w-[180px]"
              >
                <p className={`text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-clay-brown/70 font-semibold mt-1 sm:mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

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
