'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Eye, Heart, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { formatPrice, calculateDiscount, getLocalizedText } from '@/lib/utils';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import type { Product } from '@prakash/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.price, product.salePrice!)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productName = getLocalizedText(product.title, locale);
    const price = product.salePrice ? formatPrice(product.salePrice!) : formatPrice(product.price);
    const message = encodeURIComponent(`Hi! I'm interested in ordering:\n\n🏺 *${productName}*\n💰 Price: ${price}\n\nPlease share more details and availability. Thank you!`);
    window.open(`https://wa.me/916290351365?text=${message}`, '_blank');
  };

  const isProductInWishlist = isInWishlist(product.id);

  return (
    <>
      <Card className="product-card group overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-warm-beige">
          <Link href={`/product/${product.id}`} className="block h-full w-full">
            <img
              src={product.images[0] || '/placeholder.jpg'}
              alt={getLocalizedText(product.title, locale)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>

          {/* Wishlist Heart Icon - Top Right */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 z-30 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
            aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isProductInWishlist
                  ? 'fill-red-500 text-red-500'
                  : 'text-clay-brown hover:text-red-500'
              }`}
            />
          </button>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-40 flex flex-col gap-2 pointer-events-none">
            {product.isNewArrival && (
              <Badge variant="gold">{t('newArrivals')}</Badge>
            )}
            {product.isBestseller && (
              <Badge variant="secondary">{t('bestseller')}</Badge>
            )}
            {hasDiscount && (
              <Badge variant="default">{discount}% {t('off') || 'OFF'}</Badge>
            )}
          </div>

          {/* Quick Actions - Always visible on mobile, hover on desktop */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-0 sm:translate-y-2 opacity-100 sm:opacity-0 transition-all duration-300 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 z-20">
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-terracotta text-white hover:bg-terracotta/90 shadow-md hover:shadow-lg h-9 rounded-md px-3 text-xs min-h-[40px] sm:min-h-[36px]"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">{t('addToCart')}</span>
              <span className="xs:hidden">Add</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-clay-brown text-white hover:bg-clay-brown/90 shadow-md hover:shadow-lg h-9 rounded-md px-3 text-xs min-h-[40px] sm:min-h-[36px]"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg h-9 rounded-md px-3 min-h-[40px] sm:min-h-[36px]"
              onClick={handleWhatsAppOrder}
              aria-label="Order via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <Link href={`/product/${product.id}`} className="block p-3 sm:p-4">
          <h3 className="mb-2 line-clamp-2 text-sm sm:text-base font-medium text-clay-brown group-hover:text-terracotta">
            {getLocalizedText(product.title, locale)}
          </h3>

          {/* Price */}
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

          {/* COD Badge */}
          {product.codAvailable && (
            <p className="mt-2 text-xs text-green-600">{t('codAvailable')}</p>
          )}
        </Link>
      </Card>

      {/* Quick View Modal - Rendered OUTSIDE Card for proper full-screen display */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
