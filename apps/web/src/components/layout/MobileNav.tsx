'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

export function MobileNav() {
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const pathname = usePathname();
  const { user } = useAuth();

  const { openCart, getItemCount, _hasHydrated: cartHydrated } = useCartStore();
  const { getItemCount: getWishlistCount, _hasHydrated: wishlistHydrated } = useWishlistStore();

  const cartCount = cartHydrated ? getItemCount() : 0;
  const wishlistCount = wishlistHydrated ? getWishlistCount() : 0;

  // Always visible - no hiding on scroll
  const isVisible = true;

  const navItems: NavItem[] = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/shop', label: t('shop'), icon: Search },
    { href: '#cart', label: t('cart'), icon: ShoppingBag, badge: cartCount },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { href: user ? '/profile' : '/auth/login', label: user ? tAuth('myAccount') : tAuth('login'), icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '#cart') return false;
    return pathname.startsWith(href);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '#cart') {
      e.preventDefault();
      openCart();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          {/* Gradient overlay for seamless blend */}
          <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

          {/* Main nav bar */}
          <div className="bg-white border-t border-clay-brown/10 shadow-lg shadow-clay-brown/10">
            <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href === '#cart' ? '/' : item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="relative flex flex-col items-center justify-center py-0.5 px-2 min-w-[48px]"
                  >
                    <motion.div
                      className="relative"
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {/* Active indicator background */}
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute -inset-1.5 bg-terracotta/10 rounded-lg"
                          />
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <motion.div
                        animate={{
                          y: active ? -1 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="relative"
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 transition-colors duration-200',
                            active ? 'text-terracotta' : 'text-clay-brown/60'
                          )}
                          strokeWidth={active ? 2.5 : 2}
                        />

                        {/* Badge */}
                        {item.badge !== undefined && item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white"
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </motion.span>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      animate={{
                        scale: active ? 1 : 0.95,
                        opacity: active ? 1 : 0.7,
                      }}
                      className={cn(
                        'mt-0.5 text-[9px] font-medium transition-colors duration-200',
                        active ? 'text-terracotta' : 'text-clay-brown/60'
                      )}
                    >
                      {item.label}
                    </motion.span>

                    {/* Active dot indicator */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, y: 5 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: 5 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute -bottom-1 w-1 h-1 bg-terracotta rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
