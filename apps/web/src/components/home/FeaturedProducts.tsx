'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/ProductCard';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFeaturedProducts } from '@prakash/firebase';
import type { Product } from '@prakash/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function FeaturedProducts() {
  const t = useTranslations('featured');
  const tc = useTranslations('common');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const featuredProducts = await getFeaturedProducts(8);
        setProducts(featuredProducts);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-warm-beige/40 via-white to-warm-beige/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-warm-beige/40 via-white to-warm-beige/30 py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-terracotta/8 to-gold/8 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-gold/8 to-terracotta/8 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-3 tracking-wide border border-terracotta/20">
              <Sparkles className="h-4 w-4" />
              {t('title')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-clay-brown">
              {t('title')}
            </h2>
            <p className="text-clay-brown/60 mt-2">{t('subtitle')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button variant="outline" asChild className="border-2 border-clay-brown/30 hover:border-terracotta hover:bg-gradient-to-r hover:from-terracotta hover:to-gold hover:text-white transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-105">
              <Link href="/shop">
                {tc('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
