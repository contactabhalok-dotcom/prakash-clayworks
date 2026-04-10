'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Package, TrendingUp, Star, ShoppingCart } from 'lucide-react';

export function ProductsOverview() {
  const t = useTranslations('home');

  const features = [
    {
      icon: Package,
      title: '100+ Unique Products',
      description: 'Handcrafted terracotta items for every occasion',
      color: 'bg-terracotta/10 text-terracotta',
    },
    {
      icon: TrendingUp,
      title: 'Best Sellers',
      description: 'Discover our most loved products',
      color: 'bg-gold/10 text-gold',
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Authentic clay with perfect finish',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Shopping',
      description: 'Simple checkout & fast delivery',
      color: 'bg-blue-500/10 text-blue-600',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-4">
              Our Products
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-clay-brown mb-4">
              Explore Our Collection
            </h2>
            <p className="text-base sm:text-lg text-clay-brown/70 max-w-2xl mx-auto">
              From traditional diyas to modern planters, discover handcrafted terracotta products
              that blend heritage with contemporary design
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-warm-beige/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-clay-brown/5"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-clay-brown mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-clay-brown/70">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button size="lg" asChild className="min-h-[48px]">
            <Link href="/shop">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
