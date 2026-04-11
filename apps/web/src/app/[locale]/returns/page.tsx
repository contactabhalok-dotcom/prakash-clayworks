'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getReturnRequestsByEmail } from '@prakash/firebase';
import { useAuth } from '@/context/AuthContext';
import type { ReturnRequest } from '@prakash/types';
import {
  ArrowLeft,
  ArrowLeftRight,
  Loader2,
  Package,
  Calendar,
  IndianRupee,
} from 'lucide-react';

const returnStatusLabels: Record<string, { label: string; color: string }> = {
  requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-100 text-blue-700' },
  refund_processing: { label: 'Refund Processing', color: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'Refunded', color: 'bg-green-100 text-green-700' },
  exchange_ordered: { label: 'Exchange Ordered', color: 'bg-purple-100 text-purple-700' },
  exchange_delivered: { label: 'Exchange Delivered', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-600' },
};

export default function ReturnsPage() {
  const t = useTranslations('orders');
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/returns');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email) {
      getReturnRequestsByEmail(user.email)
        .then(setReturns)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp objects
    let jsDate: Date;
    if (date.toDate) {
      // Firestore Timestamp
      jsDate = date.toDate();
    } else if (date.seconds) {
      // Firestore timestamp object (from serverTimestamp)
      jsDate = new Date(date.seconds * 1000);
    } else {
      jsDate = new Date(date);
    }
    
    if (isNaN(jsDate.getTime())) return 'N/A';
    
    return jsDate.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      damaged: 'Damaged / Defective',
      wrong: 'Wrong Product',
      quality: 'Quality Issue',
      broken: 'Broken Pieces',
      different: 'Different from Description',
      missing: 'Missing Parts',
      other: 'Other',
    };
    return reasons[reason] || reason;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-clay-brown mb-6 flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-terracotta" />
          My Returns & Exchanges
        </h1>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            </CardContent>
          </Card>
        ) : returns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ArrowLeftRight className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No return requests yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Go to your order details to initiate a return or exchange
              </p>
              <Link href="/orders">
                <Button className="mt-4">View My Orders</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => {
              const statusInfo = returnStatusLabels[ret.status] || returnStatusLabels.requested;

              return (
                <Card key={ret.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-terracotta" />
                        <div>
                          <p className="font-bold text-clay-brown">
                            {ret.itemTitle?.en || ret.itemId}
                          </p>
                          <p className="text-xs text-slate-500">
                            Order: {ret.orderNumber}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Action</p>
                        <p className="font-semibold text-clay-brown capitalize">
                          {ret.action}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reason</p>
                        <p className="font-semibold text-clay-brown">
                          {getReasonLabel(ret.reason)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Requested On</p>
                        <p className="font-semibold text-clay-brown flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(ret.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Refund Amount</p>
                        <p className="font-semibold text-terracotta flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {ret.itemPrice * ret.itemQuantity}
                        </p>
                      </div>
                    </div>
                    {ret.adminNotes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                        <p className="text-slate-500 mb-1">Admin Note:</p>
                        <p className="text-clay-brown">{ret.adminNotes}</p>
                      </div>
                    )}
                    {ret.refundProcessedAt && (
                      <p className="mt-3 text-sm text-green-600 font-medium">
                        ✓ Refund processed on {formatDate(ret.refundProcessedAt)}
                      </p>
                    )}
                    {ret.exchangeOrderNumber && (
                      <p className="mt-3 text-sm text-purple-600 font-medium">
                        Exchange Order: {ret.exchangeOrderNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
