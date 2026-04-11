'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculateDiscount, getLocalizedText, getWhatsAppShareUrl } from '@/lib/utils';
import {
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Share2,
  Check,
  Copy,
  MessageCircle,
  Link,
  X,
} from 'lucide-react';
import type { Product } from '@prakash/types';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const t = useTranslations('product');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCartStore();

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.price, product.salePrice!)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    window.location.href = `/${locale}/checkout`;
  };

  const handleWhatsAppOrder = () => {
    const productName = getLocalizedText(product.title, locale);
    const price = product.salePrice ? formatPrice(product.salePrice!) : formatPrice(product.price);
    const message = encodeURIComponent(`Hi! I'm interested in ordering:\n\n🏺 *${productName}*\n💰 Price: ${price}\n📦 Quantity: ${quantity}\n\nPlease share more details and availability. Thank you!`);
    window.open(`https://wa.me/916290351365?text=${message}`, '_blank');
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this ${getLocalizedText(product.title, locale)} from Prakash Clayworks!`;

    // Try native share first (mobile)
    if (navigator.share) {
      navigator.share({
        title: getLocalizedText(product.title, locale),
        text: text,
        url: url,
      }).catch(() => {});
      return;
    }

    // Fallback: show share menu
    setShowShareMenu(!showShareMenu);
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out this ${getLocalizedText(product.title, locale)} from Prakash Clayworks!`;
    window.open(getWhatsAppShareUrl(text, url), '_blank');
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isNewArrival && (
          <Badge variant="gold">{tc('newArrivals')}</Badge>
        )}
        {product.isBestseller && (
          <Badge variant="secondary">{tc('bestseller')}</Badge>
        )}
        {product.stock > 0 ? (
          <Badge variant="success">{tc('inStock')}</Badge>
        ) : (
          <Badge variant="error">{tc('outOfStock')}</Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-clay-brown md:text-3xl leading-tight">
        {getLocalizedText(product.title, locale)}
      </h1>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl sm:text-3xl font-bold text-terracotta">
              {formatPrice(product.salePrice!)}
            </span>
            <span className="text-lg sm:text-xl text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
            <Badge variant="default">{discount}% OFF</Badge>
          </>
        ) : (
          <span className="text-2xl sm:text-3xl font-bold text-terracotta">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-clay-brown/70 leading-relaxed">
        {getLocalizedText(product.description, locale)}
      </p>

      {/* Specifications */}
      <div className="rounded-xl bg-warm-beige/50 p-2.5 sm:p-4">
        <h3 className="mb-1.5 sm:mb-3 text-xs sm:text-base font-semibold text-clay-brown">
          {t('specifications')}
        </h3>
        <div className="grid gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-clay-brown/60">{t('material')}</span>
            <span className="font-medium text-clay-brown text-right">{product.material}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-clay-brown/60">{t('dimensions')}</span>
            <span className="font-medium text-clay-brown text-right">{product.dimensions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-clay-brown/60">{t('weight')}</span>
            <span className="font-medium text-clay-brown text-right">{product.weight}</span>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="text-sm sm:text-base font-medium text-clay-brown">{t('quantity')}:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 sm:w-12 text-center text-base sm:text-lg font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        {/* Row 1: Cart + Buy (mobile), same row */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 min-h-[48px] text-sm font-semibold"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="mr-1.5 h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tc('addToCart')}</span>
            <span className="sm:hidden">Cart</span>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 min-h-[48px] text-sm font-semibold"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            {tc('buyNow')}
          </Button>
        </div>

        {/* Row 2: WhatsApp Order + Share buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleWhatsAppOrder}
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            disabled={product.stock === 0}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Order via WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>
          <div className="relative flex justify-center sm:justify-start">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 border-2 border-clay-brown/20 rounded-xl text-sm font-medium text-clay-brown hover:border-terracotta/50 hover:text-terracotta hover:bg-terracotta/5 transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share Product</span>
            <span className="sm:hidden">Share</span>
          </button>

          {/* Share Menu Popup */}
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
              <div ref={shareMenuRef} className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl border border-clay-brown/10 overflow-hidden min-w-[220px]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-clay-brown/10 bg-warm-beige/20">
                  <span className="text-xs font-semibold text-clay-brown uppercase tracking-wide">Share via</span>
                  <button onClick={() => setShowShareMenu(false)} className="p-1 hover:bg-clay-brown/10 rounded-full transition-colors">
                    <X className="h-3.5 w-3.5 text-clay-brown/60" />
                  </button>
                </div>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-clay-brown hover:bg-green-50/80 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-clay-brown hover:bg-warm-beige/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link className="h-4 w-4 text-terracotta" />}
                  </div>
                  <span className="font-medium">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* COD & Delivery Info */}
      <div className="space-y-1.5 sm:space-y-2 rounded-xl border border-clay-brown/10 p-2.5 sm:p-4">
        {product.codAvailable && (
          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm">
            <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
            <span className="text-clay-brown">{tc('codAvailable')}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm">
          <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-terracotta flex-shrink-0" />
          <span className="text-clay-brown">{t('freeDeliveryAbove')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm">
          <Shield className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-terracotta flex-shrink-0" />
          <span className="text-clay-brown">{t('safePackaging')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm">
          <RefreshCw className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-terracotta flex-shrink-0" />
          <span className="text-clay-brown">{t('easyReturns')}</span>
        </div>
      </div>
    </div>
  );
}
