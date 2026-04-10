'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatPrice, getLocalizedText } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShipping,
    getTotal,
  } = useCartStore();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-clay-brown/10 px-4 py-4">
                <h2 className="text-base sm:text-lg font-semibold text-clay-brown">
                  {t('title')} ({items.length})
                </h2>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={closeCart}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="mb-4 h-16 w-16 text-clay-brown/30" />
                    <p className="mb-4 text-gray-500">{t('empty')}</p>
                    <Button onClick={closeCart} asChild>
                      <Link href="/shop">{t('continueShopping')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-4 rounded-lg border border-clay-brown/10 p-3"
                      >
                        {/* Image */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-warm-beige">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={getLocalizedText(item.title, locale)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-clay-brown/30" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col">
                          <h3 className="text-sm font-medium text-clay-brown">
                            {getLocalizedText(item.title, locale)}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-terracotta">
                            {formatPrice(item.salePrice || item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-clay-brown/10 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('subtotal')}</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('shipping')}</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-clay-brown/10 pt-2 text-base">
                      <span className="font-semibold text-clay-brown">{t('total')}</span>
                      <span className="font-bold text-terracotta">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      {t('freeShippingNote')}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <Button className="w-full min-h-[48px]" size="lg" asChild onClick={closeCart}>
                      <Link href="/checkout">{t('checkout')}</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full min-h-[48px]"
                      onClick={closeCart}
                      asChild
                    >
                      <Link href="/shop">{t('continueShopping')}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
