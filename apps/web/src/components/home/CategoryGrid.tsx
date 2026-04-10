'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { getCategories, getProductsByCategory } from '@prakash/firebase';
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

        // Fetch product count for each category in parallel
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
    <section className="py-14 sm:py-18 md:py-24 bg-gradient-to-b from-warm-beige/10 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-3 tracking-wide">
              COLLECTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-clay-brown">
              {locale === 'hi' ? 'हमारी श्रेणियाँ' : 'Shop by Category'}
            </h2>
            <div className="mt-3 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-terracotta to-gold" />
          </motion.div>
        </div>

        {/* Category Grid - all items shown, no carousel */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Link
                href={`/category/${category.slug}`}
                className="group relative block aspect-square overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                {category.image ? (
                  <img
                    src={category.image}
                    alt={locale === 'hi' ? category.name.hi : category.name.en}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-warm-beige flex items-center justify-center">
                    <span className="text-clay-brown/50 text-sm">No image</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-clay-brown/90 via-clay-brown/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1">
                    {locale === 'hi' ? category.name.hi : category.name.en}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 sm:border-4 border-transparent transition-colors group-hover:border-terracotta rounded-xl sm:rounded-2xl" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Link */}
        <div className="text-center mt-10 sm:mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-terracotta to-terracotta/90 text-white rounded-full hover:from-terracotta/90 hover:to-terracotta transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              {locale === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

