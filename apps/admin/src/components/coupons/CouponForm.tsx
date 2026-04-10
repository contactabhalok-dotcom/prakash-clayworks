'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCoupon, updateCoupon, getCategories } from '@prakash/firebase';
import type { Coupon, CouponFormData, Category } from '@prakash/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CouponFormProps {
  coupon?: Coupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<CouponFormData>({
    code: coupon?.code || '',
    description: coupon?.description || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || 0,
    minOrderValue: coupon?.minOrderValue || 0,
    maxDiscount: coupon?.maxDiscount,
    usageLimit: coupon?.usageLimit || 0,
    perUserLimit: coupon?.perUserLimit || 0,
    validFrom: coupon?.validFrom || new Date(),
    validUntil: coupon?.validUntil || new Date(),
    isActive: coupon?.isActive ?? true,
    applicableCategories: coupon?.applicableCategories || [],
    excludedCategories: coupon?.excludedCategories || [],
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    if (formData.value <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    setLoading(true);

    try {
      if (coupon) {
        await updateCoupon(coupon.id, formData);
      } else {
        await createCoupon(formData);
      }
      router.push('/coupons');
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      alert(error.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/coupons">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {coupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
          <p className="text-slate-500">
            {coupon ? 'Update coupon details' : 'Create a new discount coupon'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Coupon Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., DIWALI25"
                required
                maxLength={20}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this coupon offers"
                required
              />
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Discount Type
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  label={formData.type === 'percentage' ? 'Percentage' : 'Amount (₹)'}
                  type="number"
                  min="0"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      value: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Minimum Order Value (₹)"
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderValue: Number(e.target.value),
                    }))
                  }
                  required
                />
                {formData.type === 'percentage' && (
                  <Input
                    label="Maximum Discount (₹)"
                    type="number"
                    min="0"
                    value={formData.maxDiscount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="Optional"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Valid From
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(formData.validFrom)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validFrom: new Date(e.target.value),
                      }))
                    }
                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(formData.validUntil)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validUntil: new Date(e.target.value),
                      }))
                    }
                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Total Usage Limit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: Number(e.target.value),
                    }))
                  }
                  placeholder="0 = unlimited"
                />
                <Input
                  label="Per User Limit"
                  type="number"
                  min="0"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      perUserLimit: Number(e.target.value),
                    }))
                  }
                  placeholder="0 = unlimited"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                />
                <span className="text-sm text-slate-700">Active</span>
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
                ) : coupon ? (
                  'Update Coupon'
                ) : (
                  'Create Coupon'
                )}
              </Button>
              <Link href="/coupons" className="block">
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
