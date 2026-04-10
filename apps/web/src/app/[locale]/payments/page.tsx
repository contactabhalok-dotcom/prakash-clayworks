'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  getRefundAccounts,
  addRefundAccount,
  deleteRefundAccount,
} from '@prakash/firebase';
import type { SavedPaymentMethod, RefundAccount } from '@prakash/types';
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  Smartphone,
  Building,
  Plus,
  Trash2,
  Shield,
  CheckCircle,
} from 'lucide-react';

export default function PaymentsPage() {
  const t = useTranslations('payments');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'methods' | 'refunds'>('methods');
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [refundAccounts, setRefundAccounts] = useState<RefundAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Add refund account form
  const [showAddRefund, setShowAddRefund] = useState(false);
  const [refundForm, setRefundForm] = useState({
    type: 'upi' as 'bank' | 'upi',
    accountName: '',
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/payments');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const [methods, accounts] = await Promise.all([
        getSavedPaymentMethods(user.uid),
        getRefundAccounts(user.uid),
      ]);
      setPaymentMethods(methods);
      setRefundAccounts(accounts);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this payment method?');
    if (!confirmed) return;

    setDeleting(id);
    try {
      await deleteSavedPaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteRefundAccount = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this refund account?');
    if (!confirmed) return;

    setDeleting(id);
    try {
      await deleteRefundAccount(id);
      setRefundAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting refund account:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddRefundAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) return;

    if (!refundForm.accountName) {
      setError('Please enter account holder name');
      return;
    }

    if (refundForm.type === 'upi' && !refundForm.upiId) {
      setError('Please enter UPI ID');
      return;
    }

    if (refundForm.type === 'bank') {
      if (!refundForm.accountNumber || !refundForm.ifscCode || !refundForm.bankName) {
        setError('Please fill all bank details');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const newAccount = await addRefundAccount(user.uid, {
        type: refundForm.type,
        accountName: refundForm.accountName,
        upiId: refundForm.type === 'upi' ? refundForm.upiId : undefined,
        accountNumber: refundForm.type === 'bank' ? refundForm.accountNumber : undefined,
        ifscCode: refundForm.type === 'bank' ? refundForm.ifscCode : undefined,
        bankName: refundForm.type === 'bank' ? refundForm.bankName : undefined,
        isDefault: refundAccounts.length === 0,
      });

      setRefundAccounts((prev) => [newAccount, ...prev]);
      setShowAddRefund(false);
      setRefundForm({
        type: 'upi',
        accountName: '',
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      });
    } catch (error) {
      console.error('Error adding refund account:', error);
      setError('Failed to add account. Please try again.');
    } finally {
      setSaving(false);
    }
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
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToProfile') || 'Back to Profile'}
        </Link>

        <h1 className="text-2xl font-bold text-clay-brown mb-6 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-terracotta" />
          {t('title') || 'Payment Methods'}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'methods' ? 'default' : 'outline'}
            onClick={() => setActiveTab('methods')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {t('savedMethods') || 'Saved Methods'}
          </Button>
          <Button
            variant={activeTab === 'refunds' ? 'default' : 'outline'}
            onClick={() => setActiveTab('refunds')}
          >
            <Building className="h-4 w-4 mr-2" />
            {t('refundAccounts') || 'Refund Accounts'}
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            </CardContent>
          </Card>
        ) : activeTab === 'methods' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('savedPaymentMethods') || 'Saved Payment Methods'}</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">
                    {t('noSavedMethods') || 'No saved payment methods'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t('methodsSavedDuringCheckout') || 'Payment methods are saved during checkout'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {method.type === 'upi' ? (
                          <Smartphone className="h-8 w-8 text-green-600" />
                        ) : (
                          <CreditCard className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <p className="font-medium text-clay-brown">{method.label}</p>
                          <p className="text-sm text-slate-500">
                            {method.type === 'upi'
                              ? method.details.upiId
                              : `**** ${method.details.cardLast4}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-700">Default</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          disabled={deleting === method.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === method.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">{t('securityNote') || 'Secure Payments'}</p>
                  <p>
                    {t('securityNoteDesc') ||
                      'Your payment information is encrypted and securely stored. We never store your full card details.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('refundAccounts') || 'Refund Accounts'}</CardTitle>
              {!showAddRefund && (
                <Button size="sm" onClick={() => setShowAddRefund(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addAccount') || 'Add Account'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showAddRefund && (
                <form onSubmit={handleAddRefundAccount} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
                  <h3 className="font-medium text-clay-brown">
                    {t('addRefundAccount') || 'Add Refund Account'}
                  </h3>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Account Type */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRefundForm({ ...refundForm, type: 'upi' })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        refundForm.type === 'upi'
                          ? 'border-terracotta bg-terracotta/10'
                          : 'border-slate-200 hover:border-terracotta/50'
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundForm({ ...refundForm, type: 'bank' })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        refundForm.type === 'bank'
                          ? 'border-terracotta bg-terracotta/10'
                          : 'border-slate-200 hover:border-terracotta/50'
                      }`}
                    >
                      <Building className="h-5 w-5" />
                      Bank Account
                    </button>
                  </div>

                  <Input
                    placeholder="Account Holder Name"
                    value={refundForm.accountName}
                    onChange={(e) => setRefundForm({ ...refundForm, accountName: e.target.value })}
                    required
                  />

                  {refundForm.type === 'upi' ? (
                    <Input
                      placeholder="UPI ID (e.g., yourname@upi)"
                      value={refundForm.upiId}
                      onChange={(e) => setRefundForm({ ...refundForm, upiId: e.target.value })}
                      required
                    />
                  ) : (
                    <>
                      <Input
                        placeholder="Bank Name"
                        value={refundForm.bankName}
                        onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Account Number"
                        value={refundForm.accountNumber}
                        onChange={(e) => setRefundForm({ ...refundForm, accountNumber: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="IFSC Code"
                        value={refundForm.ifscCode}
                        onChange={(e) => setRefundForm({ ...refundForm, ifscCode: e.target.value.toUpperCase() })}
                        maxLength={11}
                        required
                      />
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Account'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddRefund(false);
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {refundAccounts.length === 0 && !showAddRefund ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">
                    {t('noRefundAccounts') || 'No refund accounts added'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t('addRefundAccountDesc') || 'Add a bank account or UPI ID for refunds'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {refundAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {account.type === 'upi' ? (
                          <Smartphone className="h-8 w-8 text-green-600" />
                        ) : (
                          <Building className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <p className="font-medium text-clay-brown">{account.accountName}</p>
                          <p className="text-sm text-slate-500">
                            {account.type === 'upi'
                              ? account.upiId
                              : `${account.bankName} - ****${account.accountNumber?.slice(-4)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {account.isDefault && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRefundAccount(account.id)}
                          disabled={deleting === account.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
