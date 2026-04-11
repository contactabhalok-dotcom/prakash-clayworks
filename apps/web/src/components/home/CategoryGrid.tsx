'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { getCategories, getProductsByCategory } from '@prakash/firebase';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Category } from '@prakash/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface CategoryWithCount extends Category {
  productCount: number;
}

export function CategoryGrid() {
  const locale = useLocale();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();

        const categoriesWithCounts = await Promise.all(
          data.map(async (category) => {
            try {
              const products = await getProductsByCategory(category.slug, 100);
              return {
                ...category,
                productCount: products.length
              };
            } catch (error) {
              console.error(`Error fetching products for category ${category.slug}:`, error);
              return {
                ...category,
                productCount: 0
              };
            }
          })
        );

        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="h-10 w-48 bg-slate-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="mx-auto h-1 w-20 rounded-full bg-slate-200" />
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-warm-beige/20 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-gold/10 to-terracotta/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-3 tracking-wide border border-terracotta/20">
              <Sparkles className="h-4 w-4" />
              COLLECTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-clay-brown">
              {locale === 'hi' ? 'हमारी श्रेणियाँ' : 'Shop by Category'}
            </h2>
            <div className="mt-4 mx-auto h-1.5 w-28 rounded-full bg-gradient-to-r from-terracotta via-gold to-terracotta" />
          </motion.div>
        </div>

        {/* Category Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Link
                href={`/category/${category.slug}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                {category.image ? (
                  <img
                    src={category.image}
                    alt={locale === 'hi' ? category.name.hi : category.name.en}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-warm-beige to-warm-beige/80 flex items-center justify-center">
                    <span className="text-clay-brown/50 text-sm">No image</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-clay-brown/95 via-clay-brown/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                    {locale === 'hi' ? category.name.hi : category.name.en}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm border border-white/30">
                    <span>{category.productCount}</span>
                    <span className="text-white/80">{category.productCount === 1 ? 'product' : 'products'}</span>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-4 border-transparent transition-all duration-500 group-hover:border-gold/60 rounded-2xl" />
                
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-transparent transition-all duration-700" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Link */}
        <div className="text-center mt-12 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-terracotta to-gold text-white rounded-full hover:from-terracotta/90 hover:to-gold/90 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {locale === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
