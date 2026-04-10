import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { getCategoryBySlug, getProductsByCategory } from '@prakash/firebase';
import type { Product } from '@prakash/types';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ price?: string; sort?: string; search?: string }>;
};

// Enable dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('common');

  // Fetch category from Firebase to validate it exists
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Fetch products for this specific category using proper function
  let products: Product[] = [];

  try {
    // Use the proper getProductsByCategory function that filters by category slug
    products = await getProductsByCategory(category.slug, 100);

    console.log(`[Category Filter] Category: ${category.slug}, Found: ${products.length} products`);

    // Log first few for debugging
    if (products.length > 0) {
      products.slice(0, 3).forEach(p => {
        console.log(`[Product] ID: ${p.id}, Title: ${p.title.en}, Category: ${p.category}`);
      });
    } else {
      console.log(`[Category Filter] No products found for category: ${category.slug}`);
      console.log('[Category Filter] Make sure products have category field matching this slug');
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

  // Get category title based on locale
  const categoryTitle = locale === 'hi' ? category.name.hi : category.name.en;

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-clay-brown md:text-4xl">
            {filters.search ? `Search: "${filters.search}"` : categoryTitle}
          </h1>
          <p className="mt-2 text-clay-brown/60">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
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
