'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { getProductById } from '@prakash/firebase';
import type { Product } from '@prakash/types';
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShoppingCart,
  Loader2,
} from 'lucide-react';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { items, removeItem, _hasHydrated } = useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (productId: string) => {
    setLoadingProduct(productId);
    try {
      const product = await getProductById(productId);
      if (product) {
        addToCart(product);
        openCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoadingProduct(null);
    }
  };

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      try {
        const product = await getProductById(item.productId);
        if (product && product.stock > 0) {
          addToCart(product);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
    openCart();
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome') || 'Back to Home'}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-clay-brown flex items-center gap-2">
            <Heart className="h-6 w-6 text-terracotta" />
            {t('title') || 'My Wishlist'}
            {items.length > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <Button onClick={handleMoveAllToCart} variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('moveAllToCart') || 'Move All to Cart'}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-clay-brown mb-2">
                {t('emptyTitle') || 'Your wishlist is empty'}
              </h2>
              <p className="text-slate-500 mb-6">
                {t('emptyMessage') || 'Save items you love by clicking the heart icon'}
              </p>
              <Link href="/shop">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('continueShopping') || 'Continue Shopping'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.productId} className="overflow-hidden group">
                <div className="relative">
                  <Link href={`/product/${item.productId}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title[locale as 'en' | 'hi']}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    aria-label={t('remove') || 'Remove from wishlist'}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                  {item.salePrice && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-terracotta text-white text-xs font-medium rounded">
                      {Math.round(((item.price - item.salePrice) / item.price) * 100)}%{' '}
                      {tCommon('off')}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-medium text-clay-brown mb-2 line-clamp-2 hover:text-terracotta">
                      {item.title[locale as 'en' | 'hi']}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    {item.salePrice ? (
                      <>
                        <span className="font-bold text-terracotta">
                          {formatPrice(item.salePrice)}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-clay-brown">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddToCart(item.productId)}
                    disabled={loadingProduct === item.productId}
                    className="w-full"
                  >
                    {loadingProduct === item.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {tCommon('addToCart') || 'Add to Cart'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
