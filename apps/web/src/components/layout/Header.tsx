'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ShoppingBag, Search, Globe, User, LogOut, Heart, Package, Settings, HelpCircle, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { localeNames, type Locale } from '@/i18n/config';
import { getProducts, getCategories } from '@prakash/firebase';
import type { Product, Category } from '@prakash/types';

export function Header() {
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const tProfile = useTranslations('profile');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{ type: 'product' | 'category', data: Product | Category }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { openCart, getItemCount, _hasHydrated } = useCartStore();
  const { user, loading, signOut } = useAuth();
  const itemCount = getItemCount();

  // Scroll detection for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.lang-menu-container')) {
        setIsLangOpen(false);
      }
      if (!target.closest('.search-suggestions-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Search suggestions debounce and fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const searchTerm = searchQuery.toLowerCase().trim();

        // Fetch products and categories in parallel
        const [productsResult, categoriesResult] = await Promise.all([
          getProducts({}, 20),
          getCategories()
        ]);

        const products = productsResult.items;
        const categories = categoriesResult;

        // Filter products
        const matchingProducts = products.filter((p: Product) => {
          const titleEn = p.title.en?.toLowerCase() || '';
          const titleHi = p.title.hi?.toLowerCase() || '';
          const descEn = p.description.en?.toLowerCase() || '';
          const descHi = p.description.hi?.toLowerCase() || '';
          return titleEn.includes(searchTerm) || titleHi.includes(searchTerm) ||
                 descEn.includes(searchTerm) || descHi.includes(searchTerm);
        }).slice(0, 5);

        // Filter categories
        const matchingCategories = categories.filter((c: Category) => {
          const nameEn = c.name.en?.toLowerCase() || '';
          const nameHi = c.name.hi?.toLowerCase() || '';
          return nameEn.includes(searchTerm) || nameHi.includes(searchTerm);
        }).slice(0, 3);

        const suggestions = [
          ...matchingCategories.map((c: Category) => ({ type: 'category' as const, data: c })),
          ...matchingProducts.map((p: Product) => ({ type: 'product' as const, data: p }))
        ];

        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: { type: 'product' | 'category', data: Product | Category }) => {
    if (suggestion.type === 'category') {
      const category = suggestion.data as Category;
      router.push(`/category/${category.slug}`);
    } else {
      const product = suggestion.data as Product;
      router.push(`/product/${product.id}`);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/shop', label: t('shop') },
    { href: '/#why-choose-us', label: 'Why Us' },
    { href: '/#testimonials', label: 'Reviews' },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300",
        isScrolled 
          ? "border-clay-brown/15 bg-white/98 backdrop-blur-xl supports-[backdrop-filter]:bg-white/95 shadow-lg shadow-clay-brown/10" 
          : "border-clay-brown/10 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-md shadow-clay-brown/5"
      )}
    >
      <div className="mx-auto px-3 sm:px-4 lg:px-8 w-full">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo - Responsive */}
          <Link href="/" className="flex items-center flex-shrink-0 min-w-0 transition-transform duration-300 hover:scale-105">
            <Logo size="md" variant="full" theme="light" className="hidden sm:flex" />
            <Logo size="sm" variant="full" theme="light" className="flex sm:hidden" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-5 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs lg:text-sm font-bold transition-colors hover:text-terracotta whitespace-nowrap',
                  pathname === link.href ? 'text-terracotta' : 'text-clay-brown'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Language Switcher - Always visible */}
            <div className="relative lang-menu-container">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLangOpen(!isLangOpen);
                  setIsUserMenuOpen(false);
                }}
                aria-label={t('language')}
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[120px] rounded-lg border border-clay-brown/10 bg-white py-1 shadow-lg z-50">
                  {(Object.entries(localeNames) as [Locale, string][]).map(
                    ([code, name]) => (
                      <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        className={cn(
                          'block w-full px-4 py-2 text-left text-sm hover:bg-warm-beige',
                          locale === code
                            ? 'bg-warm-beige text-terracotta'
                            : 'text-clay-brown'
                        )}
                      >
                        {name}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              aria-label={t('search')}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* User Account */}
            {!loading && (
              <div className="relative user-menu-container">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-8 w-8 sm:h-9 sm:w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserMenuOpen(!isUserMenuOpen);
                        setIsLangOpen(false);
                      }}
                      aria-label={tAuth('myAccount')}
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 min-w-[200px] rounded-lg border border-clay-brown/10 bg-white py-2 shadow-lg z-50">
                        <div className="border-b border-clay-brown/10 px-4 pb-2 mb-2">
                          <p className="text-sm font-medium text-clay-brown truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-brown hover:bg-warm-beige"
                        >
                          <User className="h-4 w-4" />
                          {tProfile('myProfile') || 'My Profile'}
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-brown hover:bg-warm-beige"
                        >
                          <Package className="h-4 w-4" />
                          {tProfile('myOrders') || 'My Orders'}
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-brown hover:bg-warm-beige"
                        >
                          <Heart className="h-4 w-4" />
                          {tProfile('wishlist') || 'Wishlist'}
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-brown hover:bg-warm-beige"
                        >
                          <Settings className="h-4 w-4" />
                          {tProfile('settings') || 'Settings'}
                        </Link>
                        <Link
                          href="/help"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-clay-brown hover:bg-warm-beige"
                        >
                          <HelpCircle className="h-4 w-4" />
                          Help
                        </Link>
                        <div className="border-t border-clay-brown/10 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            {tAuth('logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" aria-label={tAuth('login')}>
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-9 sm:w-9"
              onClick={openCart}
              aria-label={t('cart')}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {_hasHydrated && itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Button>

          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setIsSearchOpen(false)}>
          <div
            className="fixed top-0 left-0 right-0 bg-white p-3 sm:p-4 shadow-lg search-suggestions-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto px-2">
              <form onSubmit={handleSearch} className="flex items-center gap-2 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('search') + '...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-base sm:text-lg w-full"
                  />

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-clay-brown/10 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
                    >
                      {searchSuggestions.map((suggestion, index) => {
                        if (suggestion.type === 'category') {
                          const category = suggestion.data as Category;
                          return (
                            <button
                              key={`category-${category.id}`}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-warm-beige/50 border-b border-clay-brown/5 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-beige flex-shrink-0">
                                {category.image && (
                                  <img src={category.image} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-terracotta bg-terracotta/10 px-2 py-0.5 rounded">
                                    Category
                                  </span>
                                  <p className="text-sm font-medium text-clay-brown truncate">
                                    {locale === 'hi' ? category.name.hi : category.name.en}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        } else {
                          const product = suggestion.data as Product;
                          const price = product.salePrice || product.price;
                          return (
                            <button
                              key={`product-${product.id}`}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-warm-beige/50 border-b border-clay-brown/5 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-beige flex-shrink-0">
                                {product.images && product.images[0] && (
                                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-clay-brown truncate">
                                  {locale === 'hi' ? product.title.hi : product.title.en}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-sm font-semibold text-terracotta">₹{price}</p>
                                  {product.salePrice && (
                                    <p className="text-xs text-gray-400 line-through">₹{product.price}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        }
                      })}

                      {/* View All Results Link */}
                      <button
                        type="submit"
                        className="w-full px-4 py-3 text-center text-sm font-medium text-terracotta hover:bg-terracotta/5 flex items-center justify-center gap-2"
                      >
                        <TrendingUp className="h-4 w-4" />
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
                <Button type="submit" className="px-4 sm:px-6 text-sm sm:text-base">
                  {t('search')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
