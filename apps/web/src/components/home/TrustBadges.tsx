'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Truck, Award, RefreshCw, HeadphonesIcon, BadgeCheck, Star } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Orders above ₹500',
    },
    {
      icon: Award,
      title: 'Quality Certified',
      description: 'Premium handmade',
    },
    {
      icon: BadgeCheck,
      title: 'Authentic Products',
      description: '100% genuine terracotta',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '7 days return',
    },
    {
      icon: Star,
      title: '500+ Reviews',
      description: '4.9/5 rating',
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-clay-brown via-clay-brown/95 to-clay-brown text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,160,23,0.08),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(189,111,52,0.08),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/15 text-gold text-xs sm:text-sm font-semibold mb-3 tracking-wide">
              WHY TRUST US
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Promise to You
            </h2>
          </motion.div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl group-hover:bg-gold/40 transition-all duration-300" />
                  <motion.div 
                    className="relative bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-sm p-4 sm:p-5 rounded-full group-hover:from-gold/20 group-hover:to-gold/10 transition-all duration-300 border border-white/10"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-gold group-hover:scale-110 transition-transform duration-300" />
                  </motion.div>
                </div>
                <h3 className="text-sm sm:text-base font-bold mb-1.5 text-white group-hover:text-gold transition-colors duration-300">
                  {badge.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70">
                  {badge.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
