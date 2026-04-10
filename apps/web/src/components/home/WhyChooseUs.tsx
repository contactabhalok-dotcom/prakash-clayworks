'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Leaf,
  Award,
  Users,
  Truck,
  Shield,
  HeartHandshake,
  Sparkles,
  BadgeCheck
} from 'lucide-react';

export function WhyChooseUs() {
  const t = useTranslations('home');

  const reasons = [
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: '100% natural clay products that are biodegradable and sustainable',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Each piece is crafted with precision and undergoes quality checks',
      gradient: 'from-gold to-amber-600',
    },
    {
      icon: Users,
      title: 'Artisan Made',
      description: 'Supporting local artisans and preserving traditional craftsmanship',
      gradient: 'from-terracotta to-orange-600',
    },
    {
      icon: Truck,
      title: 'Pan India Delivery',
      description: 'Free shipping on orders above ₹500 across India',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing for peace of mind',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: HeartHandshake,
      title: 'Customer Support',
      description: 'Dedicated support team ready to assist you',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: Sparkles,
      title: 'Unique Designs',
      description: 'Exclusive designs you won\'t find anywhere else',
      gradient: 'from-cyan-500 to-teal-600',
    },
    {
      icon: BadgeCheck,
      title: 'Satisfaction Guaranteed',
      description: 'Easy returns and replacements within 7 days',
      gradient: 'from-slate-600 to-gray-700',
    },
  ];

  return (
    <section id="why-choose-us" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-warm-beige/30 to-white relative overflow-hidden scroll-mt-16">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-terracotta/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-gold/5 blur-3xl" />

      <div className="container mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] sm:text-sm font-medium mb-2 sm:mb-4">
              Why Choose Prakash Clayworks
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-clay-brown mb-2 sm:mb-4">
              Crafted with Care, Delivered with Love
            </h2>
            <p className="text-sm sm:text-base text-clay-brown/70 max-w-3xl mx-auto">
              Experience the perfect blend of tradition and quality with our handcrafted terracotta products
            </p>
          </motion.div>
        </div>

        {/* Reasons Grid - 2 per row on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 h-full border border-clay-brown/10 hover:border-clay-brown/20 transition-all duration-300 hover:shadow-xl">
                  {/* Icon with gradient background */}
                  <div className="mb-2 sm:mb-4">
                    <div className={`inline-flex p-2 sm:p-3.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${reason.gradient} shadow-md sm:shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-[11px] sm:text-lg font-bold text-clay-brown mb-0.5 sm:mb-2 group-hover:text-terracotta transition-colors leading-tight">
                    {reason.title}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-clay-brown/70 leading-snug sm:leading-relaxed">
                    {reason.description}
                  </p>

                  {/* Decorative corner */}
                  <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terracotta/20 group-hover:bg-terracotta/40 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
