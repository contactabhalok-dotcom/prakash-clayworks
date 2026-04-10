'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCategoryById } from '@prakash/firebase';
import type { Category } from '@prakash/types';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const data = await getCategoryById(id);
      if (data) {
        setCategory(data);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading category...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error || 'Category not found'}</p>
        <Link href="/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    );
  }

  return <CategoryForm category={category} />;
}
