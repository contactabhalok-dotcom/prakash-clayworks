import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { getProducts } from '@prakash/firebase';
import type { Product, ProductFilters as ProductFiltersType } from '@prakash/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; price?: string; sort?: string; search?: string }>;
};

// Force dynamic rendering to ensure filters work
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('common');

  // Fetch products from Firebase
  let products: Product[] = [];

  try {
    // Build filters for Firebase query
    const dbFilters: ProductFiltersType = {};

    if (filters.category) {
      dbFilters.category = filters.category;
    }

    if (filters.sort) {
      dbFilters.sortBy = filters.sort as ProductFiltersType['sortBy'];
    }

    // Debug logging
    console.log('[Shop Page] Filters:', JSON.stringify(dbFilters));
    console.log('[Shop Page] URL category param:', filters.category);

    // Get products from Firebase
    const result = await getProducts(dbFilters, 100);
    products = result.items;

    console.log('[Shop Page] Products fetched:', products.length);
    if (products.length > 0) {
      console.log('[Shop Page] Sample product categories:', products.slice(0, 5).map(p => ({ id: p.id.slice(0,8), title: p.title.en, category: p.category })));
    }
  } catch (error) {
    console.error('Error fetching products from Firebase:', error);
    products = [];
  }

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter((p) => {
      const titleEn = p.title.en?.toLowerCase() || '';
      const titleHi = p.title.hi?.toLowerCase() || '';
      const descEn = p.description.en?.toLowerCase() || '';
      const descHi = p.description.hi?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      return (
        titleEn.includes(searchTerm) ||
        titleHi.includes(searchTerm) ||
        descEn.includes(searchTerm) ||
        descHi.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    });
  }

  // Apply price filter in memory (Firebase doesn't support range queries on different fields)
  if (filters.price) {
    const [min, max] = filters.price.split('-');
    products = products.filter((p) => {
      const price = p.salePrice || p.price;
      if (max === '+' || !max) {
        return price >= parseInt(min);
      }
      return price >= parseInt(min) && price <= parseInt(max);
    });
  }

  // Apply additional sorting if needed (in case Firebase didn't sort)
  switch (filters.sort) {
    case 'price_asc':
      products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      break;
    case 'price_desc':
      products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      break;
    case 'oldest':
      products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'newest':
    default:
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-clay-brown md:text-4xl">
            {filters.search ? `Search: "${filters.search}"` : t('allProducts')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-clay-brown/60">
            {products.length} products found
          </p>
        </div>

        {/* Filters */}
        <ProductFilters />

        {/* Products Grid */}
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
