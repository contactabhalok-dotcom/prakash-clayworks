'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, IndianRupee, AlertCircle, Upload, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProducts } from '@prakash/firebase';
import type { Product, Order, ReturnAction } from '@prakash/types';

const returnReasons = [
  { code: 'damaged', label: 'Product is damaged or defective' },
  { code: 'wrong', label: 'Received wrong product' },
  { code: 'quality', label: 'Quality not as expected' },
  { code: 'broken', label: 'Product arrived broken/broken pieces' },
  { code: 'different', label: 'Product different from description' },
  { code: 'missing', label: 'Parts or pieces missing' },
  { code: 'other', label: 'Other reason' },
];

interface Props {
  order: Order;
  onClose: () => void;
  onSubmit: (data: {
    itemIndex: number;
    action: ReturnAction;
    reason: string;
    reasonDetail: string;
    exchangeProductId?: string;
    refundAccountId?: string;
  }) => Promise<void>;
  refundAccounts: { id: string; type: string; accountName: string; upiId?: string }[];
}

export function ReturnRequestModal({ order, onClose, onSubmit, refundAccounts }: Props) {
  const [step, setStep] = useState<'item' | 'action' | 'reason' | 'details' | 'exchange' | 'confirm'>('item');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [selectedAction, setSelectedAction] = useState<ReturnAction>('refund');
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<string>('');
  const [selectedRefundAccount, setSelectedRefundAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when exchange step
  useEffect(() => {
    if (step === 'exchange') {
      setLoadingProducts(true);
      getProducts({}, 50).then((result) => {
        setProducts(result.items);
        setLoadingProducts(false);
      }).catch(() => setLoadingProducts(false));
    }
  }, [step]);

  const canProceed = () => {
    if (step === 'item') return selectedItemIndex >= 0;
    if (step === 'action') return true;
    if (step === 'reason') return !!selectedReason;
    if (step === 'details') return true;
    if (step === 'exchange') return !!selectedExchangeProduct;
    if (step === 'confirm') return true;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step === 'item') {
      // If action is exchange, go to exchange step after action
      setStep('action');
    } else if (step === 'action') {
      if (selectedAction === 'exchange') {
        setStep('exchange');
      } else {
        setStep('reason');
      }
    } else if (step === 'exchange') {
      setStep('reason');
    } else if (step === 'reason') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'action') setStep('item');
    else if (step === 'exchange') setStep('action');
    else if (step === 'reason') setStep(selectedAction === 'exchange' ? 'exchange' : 'action');
    else if (step === 'confirm') setStep('reason');
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        itemIndex: selectedItemIndex,
        action: selectedAction,
        reason: selectedReason,
        reasonDetail,
        exchangeProductId: selectedExchangeProduct || undefined,
        refundAccountId: selectedRefundAccount || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const selectedItem = selectedItemIndex >= 0 ? order.items[selectedItemIndex] : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-6 w-6 text-terracotta" />
            <h2 className="text-xl font-bold text-clay-brown">Return / Exchange</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className={step === 'item' ? 'text-terracotta font-medium' : ''}>Select Item</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === 'action' || step === 'exchange' ? 'text-terracotta font-medium' : ''}>Action</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === 'reason' || step === 'confirm' ? 'text-terracotta font-medium' : ''}>Reason</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === 'confirm' ? 'text-terracotta font-medium' : ''}>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Item */}
          {step === 'item' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4">Select which item you want to return/exchange:</p>
              {order.items.map((item, idx) => (
                <Card
                  key={idx}
                  className={`cursor-pointer border-2 transition-all ${
                    selectedItemIndex === idx ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                  }`}
                  onClick={() => setSelectedItemIndex(idx)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-clay-brown">{item.title.en}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-terracotta">{formatPrice(item.price * item.quantity)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: Select Action */}
          {step === 'action' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">What would you like to do?</p>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    selectedAction === 'refund' ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                  }`}
                  onClick={() => setSelectedAction('refund')}
                >
                  <CardContent className="p-6 text-center">
                    <IndianRupee className={`h-10 w-10 mx-auto mb-3 ${selectedAction === 'refund' ? 'text-terracotta' : 'text-slate-300'}`} />
                    <p className="font-bold text-clay-brown">Refund</p>
                    <p className="text-xs text-slate-500 mt-1">Get money back to your UPI/Bank</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    selectedAction === 'exchange' ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                  }`}
                  onClick={() => setSelectedAction('exchange')}
                >
                  <CardContent className="p-6 text-center">
                    <ArrowLeftRight className={`h-10 w-10 mx-auto mb-3 ${selectedAction === 'exchange' ? 'text-terracotta' : 'text-slate-300'}`} />
                    <p className="font-bold text-clay-brown">Exchange</p>
                    <p className="text-xs text-slate-500 mt-1">Get a different product instead</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Select Exchange Product */}
          {step === 'exchange' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Choose a product to exchange for:</p>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              {loadingProducts ? (
                <div className="text-center py-8 text-slate-400">Loading products...</div>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {products
                    .filter((p) => p.title.en.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 10)
                    .map((product) => (
                      <Card
                        key={product.id}
                        className={`cursor-pointer border-2 transition-all ${
                          selectedExchangeProduct === product.id ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                        }`}
                        onClick={() => setSelectedExchangeProduct(product.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <img
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-clay-brown truncate">{product.title.en}</p>
                            <p className="text-xs text-terracotta font-semibold">
                              {formatPrice(product.salePrice || product.price)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Select Reason */}
          {step === 'reason' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Why are you returning?</p>
              <div className="grid gap-2">
                {returnReasons.map((reason) => (
                  <Card
                    key={reason.code}
                    className={`cursor-pointer border-2 transition-all ${
                      selectedReason === reason.code ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                    }`}
                    onClick={() => setSelectedReason(reason.code)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <AlertCircle className={`h-5 w-5 flex-shrink-0 ${selectedReason === reason.code ? 'text-terracotta' : 'text-slate-300'}`} />
                      <p className="text-sm text-clay-brown">{reason.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Input
                placeholder="Additional details (optional)"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-clay-brown">Return Summary</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item:</span>
                      <span className="font-medium text-clay-brown">{selectedItem?.title.en}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Action:</span>
                      <Badge variant={selectedAction === 'refund' ? 'success' : 'default'}>
                        {selectedAction === 'refund' ? 'Refund' : 'Exchange'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reason:</span>
                      <span className="font-medium text-clay-brown">
                        {returnReasons.find((r) => r.code === selectedReason)?.label}
                      </span>
                    </div>
                    {selectedAction === 'exchange' && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Exchange for:</span>
                        <span className="font-medium text-clay-brown">
                          {products.find((p) => p.id === selectedExchangeProduct)?.title.en || 'Loading...'}
                        </span>
                      </div>
                    )}
                    {refundAccounts.length > 0 && selectedAction === 'refund' && (
                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-slate-500 text-xs">Select refund account:</span>
                        <div className="grid gap-1">
                          {refundAccounts.map((acc) => (
                            <button
                              key={acc.id}
                              onClick={() => setSelectedRefundAccount(acc.id)}
                              className={`text-left p-2 rounded-lg border text-sm ${
                                selectedRefundAccount === acc.id
                                  ? 'border-terracotta bg-terracotta/5'
                                  : 'border-slate-200'
                              }`}
                            >
                              <p className="font-medium">{acc.accountName}</p>
                              <p className="text-xs text-slate-500">{acc.type === 'upi' ? acc.upiId : 'Bank Account'}</p>
                            </button>
                          ))}
                        </div>
                        {!selectedRefundAccount && (
                          <p className="text-xs text-amber-600">No account selected - admin will contact you for details</p>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-slate-500">Refund Amount:</span>
                      <span className="font-bold text-terracotta">
                        {formatPrice((selectedItem?.price || 0) * (selectedItem?.quantity || 1))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-slate-50 rounded-b-2xl">
          <Button variant="ghost" onClick={step === 'item' ? onClose : handleBack}>
            {step === 'item' ? 'Cancel' : 'Back'}
          </Button>
          {step === 'confirm' ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
