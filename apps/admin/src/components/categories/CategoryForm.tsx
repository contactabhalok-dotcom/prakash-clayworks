'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SingleImageUpload } from '@/components/ui/single-image-upload';
import { BilingualInput } from '@/components/ui/bilingual-input';
import { createCategory, updateCategory } from '@prakash/firebase';
import type { Category } from '@prakash/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryFormProps {
  category?: Category;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || { en: '', hi: '' },
    slug: category?.slug || '',
    image: category?.image || '',
    order: category?.order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert('Please upload a category image');
      return;
    }

    if (!formData.slug) {
      alert('Please enter a slug for the category');
      return;
    }

    setLoading(true);

    try {
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }
      router.push('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleNameEnChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: { ...prev.name, en: value },
      // Auto-generate slug from English name if creating new category
      ...(category ? {} : { slug: generateSlug(value) }),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categories">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {category ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-slate-500">
            {category ? 'Update category details' : 'Create a new product category'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BilingualInput
                label="Name"
                enValue={formData.name.en}
                hiValue={formData.name.hi}
                onEnChange={(value) => handleNameEnChange(value)}
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: { ...prev.name, hi: value },
                  }))
                }
                enPlaceholder="e.g., Diyas & Lamps"
                hiPlaceholder="e.g., दीये और दीपक"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  required
                  placeholder="e.g., diyas-lamps"
                  hint="URL-friendly identifier for the category"
                />
                <Input
                  label="Display Order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: Number(e.target.value),
                    }))
                  }
                  hint="Lower numbers appear first"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Image */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent>
              <SingleImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                path={`categories/${category?.id || 'new'}`}
                maxSizeMB={5}
                aspectRatio="square"
                placeholder="Drop category image here or click to upload"
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No image</span>
                  </div>
                )}
                <div className="p-4 bg-white">
                  <h3 className="font-medium text-slate-900">
                    {formData.name.en || 'Category Name'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {formData.name.hi || 'श्रेणी का नाम'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    /{formData.slug || 'category-slug'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : category ? (
                  'Update Category'
                ) : (
                  'Create Category'
                )}
              </Button>
              <Link href="/categories" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
