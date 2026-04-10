'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SlidersHorizontal, X } from 'lucide-react';
import { getCategories } from '@prakash/firebase';
import type { Category } from '@prakash/types';

const priceRanges = [
  { value: '', label: 'All Prices' },
  { value: '0-299', label: 'Under ₹299' },
  { value: '300-499', label: '₹300 - ₹499' },
  { value: '500-999', label: '₹500 - ₹999' },
  { value: '1000+', label: '₹1000+' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'oldest', label: 'Oldest First' },
];

export function ProductFilters() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: '', label: locale === 'hi' ? 'सभी श्रेणियाँ' : 'All Categories' },
  ]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        const categoryOptions = [
          { value: '', label: locale === 'hi' ? 'सभी श्रेणियाँ' : 'All Categories' },
          ...data.map((cat: Category) => ({
            value: cat.slug,
            label: locale === 'hi' ? cat.name.hi : cat.name.en,
          })),
        ];
        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, [locale]);

  const currentCategory = searchParams.get('category') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Get current path including locale
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
    const newUrl = `${currentPath}?${params.toString()}`;

    // Use window.location for full page reload to ensure filters work on all devices
    if (typeof window !== 'undefined') {
      window.location.href = newUrl;
    }
  };

  const clearFilters = () => {
    // Use window.location for full page reload - preserve locale
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname; // e.g., /en/shop or /shop
      window.location.href = currentPath;
    }
  };

  const hasFilters = currentCategory || currentPrice;

  return (
    <div className="mb-6 sm:mb-8 rounded-xl border border-clay-brown/10 bg-white p-3 sm:p-4">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-clay-brown">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">{t('filters')}</span>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
              <X className="mr-1 h-3 w-3" />
              {t('clearFilters')}
            </Button>
          )}
        </div>

        {/* Filter Controls - Full Width on Mobile */}
        <div className="grid grid-cols-2 gap-2">
          <Select
            options={categories}
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full text-sm"
          />
          <Select
            options={priceRanges}
            value={currentPrice}
            onChange={(e) => updateFilter('price', e.target.value)}
            className="w-full text-sm"
          />
        </div>

        {/* Sort - Full Width */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{t('sortBy')}:</span>
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-clay-brown">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-medium">{t('filters')}</span>
        </div>

        {/* Category Filter */}
        <Select
          options={categories}
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-40"
        />

        {/* Price Filter */}
        <Select
          options={priceRanges}
          value={currentPrice}
          onChange={(e) => updateFilter('price', e.target.value)}
          className="w-40"
        />

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('sortBy')}:</span>
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-44"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            {t('clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
