'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, IndianRupee, AlertCircle, Upload, ChevronRight, Package, Building } from 'lucide-react';
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
    refundAccountType?: 'upi' | 'bank';
    refundUpiId?: string;
    refundBankDetails?: {
      accountName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
  }) => Promise<void>;
  refundAccounts: { id: string; type: string; accountName: string; upiId?: string; accountNumber?: string; bankName?: string; ifscCode?: string; isDefault?: boolean }[];
}

export function ReturnRequestModal({ order, onClose, onSubmit, refundAccounts }: Props) {
  const [step, setStep] = useState<'item' | 'action' | 'reason' | 'details' | 'exchange' | 'confirm' | 'refund-method'>('item');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [selectedAction, setSelectedAction] = useState<ReturnAction>('refund');
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedExchangeProduct, setSelectedExchangeProduct] = useState<string>('');
  const [selectedRefundAccount, setSelectedRefundAccount] = useState('');
  const [refundMethod, setRefundMethod] = useState<'upi' | 'bank'>('upi');
  const [manualUpiId, setManualUpiId] = useState('');
  const [bankForm, setBankForm] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });
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
    if (step === 'refund-method') {
      if (refundMethod === 'upi') {
        return manualUpiId.trim().includes('@');
      }
      return bankForm.accountName && bankForm.accountNumber && bankForm.ifscCode && bankForm.bankName;
    }
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step === 'item') {
      setStep('action');
    } else if (step === 'action') {
      if (selectedAction === 'exchange') {
        setStep('exchange');
      } else {
        // If refund, go to refund method selection
        if (selectedAction === 'refund') {
          // Auto-select if there's a default UPI account
          const defaultUpi = refundAccounts.find(a => a.type === 'upi' && a.isDefault);
          if (defaultUpi) {
            setSelectedRefundAccount(defaultUpi.id);
            setRefundMethod('upi');
            setManualUpiId(defaultUpi.upiId || '');
            setStep('reason');
          } else {
            setStep('refund-method');
          }
        } else {
          setStep('reason');
        }
      }
    } else if (step === 'exchange') {
      setStep('reason');
    } else if (step === 'refund-method') {
      setStep('reason');
    } else if (step === 'reason') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'action') setStep('item');
    else if (step === 'exchange') setStep('action');
    else if (step === 'refund-method') setStep('action');
    else if (step === 'reason') {
      if (selectedAction === 'exchange') setStep('exchange');
      else if (selectedAction === 'refund') setStep('refund-method');
      else setStep('action');
    }
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
        refundAccountType: selectedAction === 'refund' ? refundMethod : undefined,
        refundUpiId: selectedAction === 'refund' && refundMethod === 'upi' ? manualUpiId.trim() : undefined,
        refundBankDetails: selectedAction === 'refund' && refundMethod === 'bank' ? bankForm : undefined,
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
          <div className="flex items-center gap-1 text-xs text-slate-400 flex-wrap">
            <span className={step === 'item' ? 'text-terracotta font-medium' : ''}>Item</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === 'action' || step === 'exchange' ? 'text-terracotta font-medium' : ''}>Action</span>
            <ChevronRight className="h-3 w-3" />
            {selectedAction === 'refund' && (
              <>
                <span className={step === 'refund-method' ? 'text-terracotta font-medium' : ''}>Refund</span>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
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

          {/* Step: Select Refund Method */}
          {step === 'refund-method' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">How would you like to receive your refund?</p>

              {/* Method Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    refundMethod === 'upi' ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                  }`}
                  onClick={() => setRefundMethod('upi')}
                >
                  <CardContent className="p-5 text-center">
                    <svg className="h-10 w-10 mx-auto mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill={refundMethod === 'upi' ? '#BD6F34' : '#cbd5e1'}/>
                      <path d="M9 12l2 2 4-4" stroke={refundMethod === 'upi' ? '#BD6F34' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="font-bold text-clay-brown">UPI ID</p>
                    <p className="text-xs text-slate-500 mt-1">Instant refund to UPI</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    refundMethod === 'bank' ? 'border-terracotta bg-terracotta/5' : 'border-slate-100 hover:border-terracotta/50'
                  }`}
                  onClick={() => setRefundMethod('bank')}
                >
                  <CardContent className="p-5 text-center">
                    <Building className={`h-10 w-10 mx-auto mb-2 ${refundMethod === 'bank' ? 'text-terracotta' : 'text-slate-300'}`} />
                    <p className="font-bold text-clay-brown">Bank Account</p>
                    <p className="text-xs text-slate-500 mt-1">NEFT/IMPS to bank</p>
                  </CardContent>
                </Card>
              </div>

              {/* UPI Form */}
              {refundMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Tip:</strong> Enter your UPI ID (e.g., yourname@paytm, mobile@upi, email@paytm)
                    </p>
                  </div>
                  <Input
                    placeholder="Enter UPI ID (e.g., yourname@upi)"
                    value={manualUpiId}
                    onChange={(e) => setManualUpiId(e.target.value)}
                    className="text-sm"
                  />
                  {manualUpiId && !manualUpiId.includes('@') && (
                    <p className="text-xs text-red-500">UPI ID must contain @ symbol (e.g., 9876543210@paytm)</p>
                  )}

                  {/* Saved UPI Accounts */}
                  {refundAccounts.filter(a => a.type === 'upi').length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-slate-500">Or select a saved UPI account:</p>
                      {refundAccounts.filter(a => a.type === 'upi').map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setSelectedRefundAccount(acc.id);
                            setManualUpiId(acc.upiId || '');
                          }}
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                            selectedRefundAccount === acc.id
                              ? 'border-terracotta bg-terracotta/5'
                              : 'border-slate-200 hover:border-terracotta/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-clay-brown">{acc.accountName}</p>
                              <p className="text-xs text-slate-500">{acc.upiId}</p>
                            </div>
                            {acc.isDefault && (
                              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Default</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bank Account Form */}
              {refundMethod === 'bank' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Please provide accurate bank details for NEFT/IMPS transfer
                    </p>
                  </div>
                  <Input
                    placeholder="Account Holder Name"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Bank Name (e.g., State Bank of India)"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Account Number"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="IFSC Code (e.g., SBIN0001234)"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    maxLength={11}
                    className="text-sm"
                  />

                  {/* Saved Bank Accounts */}
                  {refundAccounts.filter(a => a.type === 'bank').length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-slate-500">Or select a saved bank account:</p>
                      {refundAccounts.filter(a => a.type === 'bank').map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setSelectedRefundAccount(acc.id);
                            setBankForm({
                              accountName: acc.accountName,
                              accountNumber: acc.accountNumber || '',
                              ifscCode: acc.ifscCode || '',
                              bankName: acc.bankName || '',
                            });
                          }}
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                            selectedRefundAccount === acc.id
                              ? 'border-terracotta bg-terracotta/5'
                              : 'border-slate-200 hover:border-terracotta/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-clay-brown">{acc.accountName}</p>
                              <p className="text-xs text-slate-500">{acc.bankName} - ****{acc.accountNumber?.slice(-4)}</p>
                            </div>
                            {acc.isDefault && (
                              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Default</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                    {selectedAction === 'refund' && (
                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-slate-500 text-xs">Refund Method:</span>
                        {refundMethod === 'upi' ? (
                          <div className="p-2 rounded-lg border border-terracotta/30 bg-terracotta/5">
                            <p className="font-medium text-clay-brown text-sm">UPI ID</p>
                            <p className="text-xs text-slate-600 font-mono">{manualUpiId || 'Not provided'}</p>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg border border-terracotta/30 bg-terracotta/5">
                            <p className="font-medium text-clay-brown text-sm">Bank Account</p>
                            <p className="text-xs text-slate-600">{bankForm.accountName}</p>
                            <p className="text-xs text-slate-600">{bankForm.bankName}</p>
                            <p className="text-xs text-slate-600 font-mono">A/C: ****{bankForm.accountNumber?.slice(-4)}</p>
                            <p className="text-xs text-slate-600 font-mono">IFSC: {bankForm.ifscCode}</p>
                          </div>
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
