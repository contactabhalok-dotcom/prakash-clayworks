'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { getAllProducts, deleteProduct, getCategories } from '@prakash/firebase';
import type { Product, Category } from '@prakash/types';
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  Package,
  RefreshCw,
  AlertTriangle,
  Filter,
  MoreVertical,
  Eye,
  Star,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryName = (slug: string) => {
    const category = categories.find((c) => c.slug === slug);
    return category?.name.en || slug;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.title.hi.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { label: `${stock} left`, className: 'bg-orange-100 text-orange-700' };
    return { label: `${stock} in stock`, className: 'bg-green-100 text-green-700' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product catalog ({products.length} products)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta appearance-none bg-white min-w-[180px]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery || categoryFilter !== 'all' ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first product to the catalog'}
          </p>
          {!searchQuery && categoryFilter === 'all' && (
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Product</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Category</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Price</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Stock</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-4">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title.en}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{product.title.en}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{product.title.hi}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {formatPrice(product.salePrice || product.price)}
                          </p>
                          {product.salePrice && (
                            <p className="text-sm text-slate-400 line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${stockStatus.className}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <Star className="h-3 w-3" /> Featured
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <Sparkles className="h-3 w-3" /> New
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <TrendingUp className="h-3 w-3" /> Bestseller
                            </span>
                          )}
                          {!product.isFeatured && !product.isNewArrival && !product.isBestseller && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-2 text-slate-500 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.title.en)}
                            disabled={deleting === product.id}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
