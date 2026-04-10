'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';
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

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 2; // mobile - 2 products
    if (width < 768) return 2; // sm
    if (width < 1024) return 3; // md
    if (width < 1280) return 4; // lg
    return 5; // xl and above
  };

  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    handleResize(); // Set initial value
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

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    const maxIndex = Math.max(0, products.length - itemsPerView);
    if (maxIndex === 0) return; // Don't auto-play if all products are visible

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next > maxIndex ? 0 : next;
      });
    }, 4000); // Auto-advance every 4 seconds

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
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-warm-beige/5 relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 sm:mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-3 tracking-wide">
              NEW ARRIVALS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-clay-brown">
              Latest Products
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-terracotta to-gold" />
          </motion.div>

          {/* Navigation Arrows - Desktop */}
          <div className="hidden sm:flex gap-3">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-3.5 rounded-full border-2 transition-all duration-300 ${
                canGoPrev
                  ? 'border-clay-brown text-clay-brown hover:bg-clay-brown hover:text-white hover:shadow-lg'
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
                  ? 'border-clay-brown text-clay-brown hover:bg-clay-brown hover:text-white hover:shadow-lg'
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-warm-beige/30">
                      <Link href={`/product/${product.id}`}>
                        <img
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>

                      {/* Badges */}
                      {hasDiscount && (
                        <Badge className="absolute top-3 left-3 bg-terracotta text-white shadow-lg">
                          {discount}% OFF
                        </Badge>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-2 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(product);
                            openCart();
                          }}
                        >
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          <span className="hidden md:inline">Add</span>
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`/product/${product.id}`} aria-label="Quick view">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <Link href={`/product/${product.id}`} className="block p-4 flex-1 flex flex-col">
                      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-clay-brown group-hover:text-terracotta transition-colors">
                        {title}
                      </h3>

                      {/* Price */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasDiscount ? (
                            <>
                              <span className="text-lg font-bold text-terracotta">
                                {formatPrice(product.salePrice!)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-terracotta">
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

          {/* Mobile Navigation Arrows */}
          {products.length > 1 && (
            <div className="flex sm:hidden justify-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`p-3 rounded-full border-2 transition-all ${
                  canGoPrev
                    ? 'border-clay-brown text-clay-brown active:bg-clay-brown active:text-white'
                    : 'border-gray-200 text-gray-300'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`p-3 rounded-full border-2 transition-all ${
                  canGoNext
                    ? 'border-clay-brown text-clay-brown active:bg-clay-brown active:text-white'
                    : 'border-gray-200 text-gray-300'
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 sm:mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button size="lg" variant="outline" asChild className="min-h-[52px] px-8 font-semibold border-2 border-clay-brown/30 hover:border-terracotta hover:bg-terracotta hover:text-white transition-all duration-300">
              <Link href="/shop">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
