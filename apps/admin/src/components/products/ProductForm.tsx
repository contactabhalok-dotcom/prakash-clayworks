'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { BilingualInput } from '@/components/ui/bilingual-input';
import { BilingualTextarea } from '@/components/ui/bilingual-textarea';
import { createProduct, updateProduct, getCategories } from '@prakash/firebase';
import type { Product, ProductFormData, Category } from '@prakash/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    title: product?.title || { en: '', hi: '' },
    description: product?.description || { en: '', hi: '' },
    price: product?.price || 0,
    salePrice: product?.salePrice,
    images: product?.images || [],
    category: product?.category || '',
    stock: product?.stock || 0,
    dimensions: product?.dimensions || '',
    weight: product?.weight || '',
    material: product?.material || '',
    isFeatured: product?.isFeatured || false,
    isNewArrival: product?.isNewArrival || false,
    isBestseller: product?.isBestseller || false,
    codAvailable: product?.codAvailable ?? true,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
        console.log('Categories loaded:', cats);
      } catch (error) {
        console.error('Error loading categories:', error);
        alert('Failed to load categories. Please refresh the page.');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert('Please add at least one product image');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    setLoading(true);

    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      router.push('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images: urls,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-500">
            {product ? 'Update product details' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BilingualInput
                label="Title"
                enValue={formData.title.en}
                hiValue={formData.title.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, hi: value },
                  }))
                }
                required
              />
              <BilingualTextarea
                label="Description"
                enValue={formData.description.en}
                hiValue={formData.description.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, hi: value },
                  }))
                }
                required
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Price (INR)"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  required
                />
                <Input
                  label="Sale Price (INR)"
                  type="number"
                  min="0"
                  value={formData.salePrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salePrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Optional"
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Dimensions"
                  value={formData.dimensions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dimensions: e.target.value,
                    }))
                  }
                  placeholder="e.g., 10cm x 15cm"
                />
                <Input
                  label="Weight"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                  placeholder="e.g., 500g"
                />
                <Input
                  label="Material"
                  value={formData.material}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      material: e.target.value,
                    }))
                  }
                  placeholder="e.g., Clay"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.images}
                onChange={handleImagesChange}
                path={`products/${product?.id || 'new'}`}
                maxFiles={10}
                maxSizeMB={5}
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>
                Category <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="flex items-center justify-center py-4 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500 mb-2">No categories found</p>
                  <Link href="/categories/new">
                    <Button type="button" size="sm" variant="outline">
                      Create Category First
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    required
                  >
                    <SelectTrigger className={!formData.category ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Select category *" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.category && (
                    <p className="text-xs text-red-500 mt-1">Category is required</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-sm text-slate-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isNewArrival: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-sm text-slate-700">New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isBestseller: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-sm text-slate-700">Bestseller</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.codAvailable}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      codAvailable: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-sm text-slate-700">COD Available</span>
              </label>
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
                ) : product ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </Button>
              <Link href="/products" className="block">
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
