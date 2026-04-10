'use client';

import { use, useEffect, useState } from 'react';
import { getCouponById } from '@prakash/firebase';
import type { Coupon } from '@prakash/types';
import { CouponForm } from '@/components/coupons/CouponForm';
import { Loader2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCouponPage({ params }: Props) {
  const { id } = use(params);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const data = await getCouponById(id);
        setCoupon(data);
      } catch (error) {
        console.error('Error loading coupon:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCoupon();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Coupon not found</p>
      </div>
    );
  }

  return <CouponForm coupon={coupon} />;
}
