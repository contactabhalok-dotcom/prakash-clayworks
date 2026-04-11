'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllReturnRequests, updateReturnRequestStatus } from '@prakash/firebase';
import type { ReturnRequest, ReturnStatus } from '@prakash/types';
import {
  ArrowLeftRight,
  Loader2,
  Eye,
  Package,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  picked_up: 'bg-blue-100 text-blue-700',
  refund_processing: 'bg-blue-100 text-blue-700',
  refunded: 'bg-green-100 text-green-700',
  exchange_ordered: 'bg-purple-100 text-purple-700',
  exchange_delivered: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function ReturnRequestsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const data = await getAllReturnRequests();
      setReturns(data);
    } catch (error) {
      console.error('Error loading return requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ReturnStatus) => {
    setProcessing(id);
    try {
      await updateReturnRequestStatus(id, status);
      // Reload all return requests to get fresh data
      await loadReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = (id: string) => handleStatusChange(id, 'approved');
  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
      await handleStatusChange(id, 'rejected');
    }
  };
  const handleRefundProcessed = (id: string) => handleStatusChange(id, 'refund_processing');
  const handleRefunded = (id: string) => handleStatusChange(id, 'refunded');
  const handleExchangeOrdered = (id: string) => handleStatusChange(id, 'exchange_ordered');
  const handleExchangeDelivered = (id: string) => handleStatusChange(id, 'exchange_delivered');
  const handlePickedUp = (id: string) => handleStatusChange(id, 'picked_up');

  const filteredReturns =
    filter === 'all'
      ? returns
      : returns.filter((r) => r.status === filter);

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
    
    return jsDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      damaged: 'Damaged',
      wrong: 'Wrong Product',
      quality: 'Quality Issue',
      broken: 'Broken',
      different: 'Different from Description',
      missing: 'Missing Parts',
      other: 'Other',
    };
    return reasons[reason] || reason;
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-terracotta" />
            Return Requests
          </h1>
          <p className="text-slate-500">Manage customer returns and exchanges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{returns.length}</p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-terracotta" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {returns.filter((r) => r.status === 'requested').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {returns.filter((r) => r.status === 'approved' || r.status === 'picked_up').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Refunded</p>
                <p className="text-2xl font-bold text-blue-600">
                  {returns.filter((r) => r.status === 'refunded').length}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'requested', 'approved', 'rejected', 'refunded', 'exchange_ordered'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Return Requests List */}
      {filteredReturns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <ArrowLeftRight className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No return requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReturns.map((ret) => (
            <Card key={ret.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {ret.itemTitle?.en || ret.itemId}
                      </h3>
                      <Badge className={statusColors[ret.status] || statusColors.requested}>
                        {ret.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={ret.action === 'refund' ? 'success' : 'default'}>
                        {ret.action}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-slate-500">Order</p>
                        <Link
                          href={`/orders/${ret.orderNumber}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {ret.orderNumber}
                        </Link>
                      </div>
                      <div>
                        <p className="text-slate-500">Customer</p>
                        <p className="font-semibold text-slate-900">{ret.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reason</p>
                        <p className="font-semibold text-slate-900">{getReasonLabel(ret.reason)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Amount</p>
                        <p className="font-semibold text-terracotta">
                          ₹{ret.itemPrice * ret.itemQuantity}
                        </p>
                      </div>
                    </div>
                    {ret.reasonDetail && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="text-slate-500">Details:</span> {ret.reasonDetail}
                      </p>
                    )}
                    {ret.adminNotes && (
                      <p className="text-sm text-slate-600">
                        <span className="text-slate-500">Admin Note:</span> {ret.adminNotes}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDate(ret.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/returns/${ret.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {ret.status === 'requested' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(ret.id)}
                          disabled={processing === ret.id}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(ret.id)}
                          disabled={processing === ret.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {ret.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePickedUp(ret.id)}
                        disabled={processing === ret.id}
                      >
                        Mark Picked Up
                      </Button>
                    )}
                    {ret.status === 'picked_up' && ret.action === 'refund' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefunded(ret.id)}
                        disabled={processing === ret.id}
                        className="text-green-600 border-green-300"
                      >
                        <IndianRupee className="h-3.5 w-3.5 mr-1" />
                        Process Refund
                      </Button>
                    )}
                    {ret.status === 'approved' && ret.action === 'exchange' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExchangeOrdered(ret.id)}
                        disabled={processing === ret.id}
                      >
                        Mark Exchange Ordered
                      </Button>
                    )}
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
