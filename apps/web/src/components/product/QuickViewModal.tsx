'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import type { Product } from '@prakash/types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  // Reset quantity and selected image when modal opens, and lock body scroll
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImage(0);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when modal opens/closes
  if (!isOpen) {
    return null;
  }

  if (!product) return null;

  const title = locale === 'hi' ? product.title.hi : product.title.en;
  const description = locale === 'hi' ? product.description.hi : product.description.en;
  const images = product.images || [];

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleItem(product);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="relative z-[10000] w-full h-full flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-clay-brown" />
              </button>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 max-h-[85vh] overflow-y-auto">
                {/* Left: Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-warm-beige/30">
                    <img
                      src={images[selectedImage] || '/placeholder.jpg'}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    {product.salePrice && (
                      <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-terracotta text-white text-xs sm:text-sm">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === idx
                              ? 'border-terracotta ring-2 ring-terracotta/20'
                              : 'border-clay-brown/10 hover:border-clay-brown/30'
                          }`}
                        >
                          <img src={img} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col">
                  <div className="flex-1">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-clay-brown mb-2 sm:mb-3 pr-8">
                      {title}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {product.salePrice ? (
                        <>
                          <span className="text-2xl sm:text-3xl font-bold text-terracotta">
                            ₹{product.salePrice}
                          </span>
                          <span className="text-lg sm:text-xl text-gray-400 line-through">
                            ₹{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold text-clay-brown">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4 sm:mb-6">
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                          In Stock ({product.stock} available)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-sm font-semibold text-clay-brown mb-2">Description</h3>
                      <p className="text-clay-brown/70 text-sm leading-relaxed line-clamp-4">
                        {description}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    {product.stock > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-sm font-semibold text-clay-brown mb-2">Quantity</h3>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            className="h-10 w-10 sm:h-11 sm:w-11"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold text-clay-brown w-12 text-center">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            disabled={quantity >= product.stock}
                            className="h-10 w-10 sm:h-11 sm:w-11"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-clay-brown/10">
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant={isInWishlist(product.id) ? "default" : "outline"}
                      size="icon"
                      onClick={handleToggleWishlist}
                      className="min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
