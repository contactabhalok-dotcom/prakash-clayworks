'use client';

import { useTranslations } from 'next-intl';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';
import type { Product } from '@prakash/types';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations('common');

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-clay-brown/30" />
        <p className="text-lg text-gray-500">{t('noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
