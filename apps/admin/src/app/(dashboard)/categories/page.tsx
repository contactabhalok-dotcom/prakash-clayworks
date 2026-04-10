'use client';

import { useEffect, useState } from 'react';
import { getCategories, deleteCategory } from '@prakash/firebase';
import type { Category } from '@prakash/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
  GripVertical,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeleting(id);
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error}</p>
        <button
          onClick={fetchCategories}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Manage product categories ({categories.length} categories)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/categories/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-terracotta" />
            All Categories ({categories.length})
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No categories yet</h3>
            <p className="text-slate-500 mb-6">Start by adding your first category</p>
            <Link
              href="/categories/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add First Category
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <GripVertical className="h-5 w-5 text-slate-400 cursor-grab flex-shrink-0 hidden sm:block" />

                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name.en}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{category.name.en}</h3>
                    <p className="text-sm text-slate-500 truncate">{category.name.hi}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        /{category.slug}
                      </span>
                      <span className="text-xs text-slate-400">Order: {category.order}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/categories/${category.id}`}
                      className="p-2 text-slate-500 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id, category.name.en)}
                      disabled={deleting === category.id}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
