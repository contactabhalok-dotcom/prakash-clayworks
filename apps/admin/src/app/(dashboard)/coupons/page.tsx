'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllCoupons, deleteCoupon } from '@prakash/firebase';
import type { Coupon } from '@prakash/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      console.log('Coupons loaded:', data);
      setCoupons(data);
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      console.error('Error details:', error.message);
      alert(`Failed to load coupons: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const isExpired = now > coupon.validUntil;
    const isNotStarted = now < coupon.validFrom;
    const isLimitReached =
      coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isExpired) {
      return <Badge variant="danger">Expired</Badge>;
    }
    if (isNotStarted) {
      return <Badge variant="warning">Scheduled</Badge>;
    }
    if (isLimitReached) {
      return <Badge variant="danger">Limit Reached</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <p className="text-slate-500">Manage discount coupons</p>
        </div>
        <Link href="/coupons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Coupons</p>
                <p className="text-2xl font-bold text-slate-900">{coupons.length}</p>
              </div>
              <Tag className="h-8 w-8 text-terracotta" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    coupons.filter(
                      (c) =>
                        c.isActive &&
                        new Date() >= c.validFrom &&
                        new Date() <= c.validUntil
                    ).length
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Uses</p>
                <p className="text-2xl font-bold text-slate-900">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {coupons.filter((c) => new Date() > c.validUntil).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No coupons yet
            </h3>
            <p className="text-slate-500 mb-4">
              Create your first coupon to offer discounts to customers
            </p>
            <Link href="/coupons/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {coupon.code}
                      </h3>
                      {getStatusBadge(coupon)}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {coupon.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Discount</p>
                        <p className="font-semibold text-slate-900">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                          {coupon.maxDiscount && (
                            <span className="text-slate-500 ml-1">
                              (max ₹{coupon.maxDiscount})
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Min Order</p>
                        <p className="font-semibold text-slate-900">
                          ₹{coupon.minOrderValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Valid Period</p>
                        <p className="font-semibold text-slate-900">
                          {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Usage</p>
                        <p className="font-semibold text-slate-900">
                          {coupon.usedCount}
                          {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/coupons/${coupon.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      disabled={deleting === coupon.id}
                    >
                      {deleting === coupon.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
