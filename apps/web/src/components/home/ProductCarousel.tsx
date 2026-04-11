'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/store/cart';
import { getProducts } from '@prakash/firebase';
import { formatPrice, calculateDiscount, getLocalizedText } from '@/lib/utils';
import type { Product } from '@prakash/types';

export function ProductCarousel() {
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addItem, openCart } = useCartStore();

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  };

  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await getProducts({ sortBy: 'newest' }, 20);
        setProducts(result.items);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    const maxIndex = Math.max(0, products.length - itemsPerView);
    if (maxIndex === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next > maxIndex ? 0 : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length, itemsPerView]);

  if (loading || products.length === 0) return null;

  const maxIndex = Math.max(0, products.length - itemsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  const handlePrev = () => {
    if (canGoPrev) {
      setIsAutoPlaying(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setIsAutoPlaying(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section
      className="py-14 sm:py-18 md:py-24 bg-gradient-to-b from-white via-warm-beige/10 to-white relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Decorations */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-terracotta/5 to-gold/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-gold/5 to-terracotta/5 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 sm:mb-16 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-3 tracking-wide border border-terracotta/20">
              <Sparkles className="h-4 w-4" />
              NEW ARRIVALS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-clay-brown">
              Latest Products
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-terracotta to-gold" />
          </motion.div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-3.5 rounded-full border-2 transition-all duration-300 ${
                canGoPrev
                  ? 'border-clay-brown text-clay-brown hover:bg-gradient-to-br hover:from-terracotta hover:to-gold hover:text-white hover:shadow-lg hover:scale-105'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-3.5 rounded-full border-2 transition-all duration-300 ${
                canGoNext
                  ? 'border-clay-brown text-clay-brown hover:bg-gradient-to-br hover:from-terracotta hover:to-gold hover:text-white hover:shadow-lg hover:scale-105'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <motion.div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {visibleProducts.map((product, index) => {
              const title = getLocalizedText(product.title, locale);
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              const discount = hasDiscount ? calculateDiscount(product.price, product.salePrice!) : 0;

              return (
                <motion.div
                  key={`${product.id}-${currentIndex}-${index}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card className="group overflow-hidden h-full flex flex-col border-0 shadow-md hover:shadow-2xl transition-all duration-500">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-warm-beige/50 to-warm-beige/30">
                      <Link href={`/product/${product.id}`}>
                        <img
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Badges */}
                      {hasDiscount && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-terracotta to-orange-600 text-white shadow-lg border-0 font-bold">
                          {discount}% OFF
                        </Badge>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-terracotta to-gold hover:from-terracotta/90 hover:to-gold/90 shadow-lg border-0"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(product);
                            openCart();
                          }}
                        >
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          <span className="hidden md:inline">Add to Cart</span>
                        </Button>
                        <Button size="sm" variant="secondary" asChild className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
                          <Link href={`/product/${product.id}`} aria-label="Quick view">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-clay-brown/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <Link href={`/product/${product.id}`} className="block p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-warm-beige/10">
                      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-clay-brown group-hover:text-terracotta transition-colors duration-300">
                        {title}
                      </h3>

                      {/* Price */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasDiscount ? (
                            <>
                              <span className="text-lg font-bold bg-gradient-to-r from-terracotta to-orange-600 bg-clip-text text-transparent">
                                {formatPrice(product.salePrice!)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold bg-gradient-to-r from-terracotta to-terracotta/80 bg-clip-text text-transparent">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button size="lg" variant="outline" asChild className="min-h-[56px] px-10 font-semibold border-2 border-clay-brown/30 hover:border-terracotta hover:bg-gradient-to-r hover:from-terracotta hover:to-gold hover:text-white transition-all duration-300 rounded-full shadow-lg hover:shadow-2xl hover:scale-105">
              <Link href="/shop">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
