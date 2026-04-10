'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { getProductById } from '@prakash/firebase';
import type { Product } from '@prakash/types';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (params.id) {
        const data = await getProductById(params.id as string);
        setProduct(data);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Product not found</p>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
