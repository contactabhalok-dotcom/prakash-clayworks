'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProfile, updateUserAddress, deleteUserAddress, setDefaultAddress } from '@prakash/firebase';
import type { UserAddress, UserAddressFormData } from '@prakash/types';
import {
  MapPin,
  ArrowLeft,
  Loader2,
  Home,
  Building,
  MapPinned,
  Trash2,
} from 'lucide-react';
import { use } from 'react';

const addressLabels = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'office', label: 'Office', icon: Building },
  { id: 'other', label: 'Other', icon: MapPinned },
];

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditAddressPage({ params }: Props) {
  const { id: addressId } = use(params);
  const t = useTranslations('addresses');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState<UserAddressFormData>({
    label: 'home',
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user?.uid) {
      loadAddress();
    }
  }, [user, addressId]);

  const loadAddress = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        const foundAddress = profile.addresses.find((a) => a.id === addressId);
        if (foundAddress) {
          setAddress(foundAddress);
          setFormData({
            label: foundAddress.label,
            name: foundAddress.name,
            phone: foundAddress.phone,
            address: foundAddress.address,
            landmark: foundAddress.landmark || '',
            city: foundAddress.city,
            state: foundAddress.state,
            pincode: foundAddress.pincode,
            isDefault: foundAddress.isDefault,
          });
        } else {
          setError('Address not found');
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
      setError('Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter recipient name');
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter address');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please enter city');
      return false;
    }
    if (!formData.state.trim()) {
      setError('Please enter state');
      return false;
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user?.uid) {
      setError('Please login to update address');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateUserAddress(user.uid, addressId, formData);
      router.push('/profile');
    } catch (error) {
      console.error('Error updating address:', error);
      setError('Failed to update address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm('Are you sure you want to delete this address?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteUserAddress(user.uid, addressId);
      router.push('/profile');
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await setDefaultAddress(user.uid, addressId);
      setFormData((prev) => ({ ...prev, isDefault: true }));
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set as default. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Auto-detect city/state from pincode
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode }));

    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: postOffice.District || prev.city,
            state: postOffice.State || prev.state,
          }));
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login?redirect=/profile');
    return null;
  }

  if (!address && !loading) {
    return (
      <div className="min-h-screen bg-warm-beige/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-clay-brown mb-4">Address Not Found</h1>
          <Link href="/profile">
            <Button>Back to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToProfile') || 'Back to Profile'}
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-terracotta" />
              {t('editAddress') || 'Edit Address'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Address Label */}
              <div>
                <label className="block text-sm font-medium text-clay-brown mb-2">
                  {t('addressType') || 'Address Type'}
                </label>
                <div className="flex gap-3">
                  {addressLabels.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, label: item.id }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.label === item.id
                          ? 'border-terracotta bg-terracotta/10 text-terracotta'
                          : 'border-slate-200 hover:border-terracotta/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-clay-brown mb-1">
                    {t('recipientName') || 'Recipient Name'} *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-clay-brown mb-1">
                    {t('phone') || 'Phone Number'} *
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-clay-brown mb-1">
                  {t('streetAddress') || 'Street Address'} *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House/Flat No., Building, Street"
                  required
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-clay-brown mb-1">
                  {t('landmark') || 'Landmark'} ({t('optional') || 'Optional'})
                </label>
                <Input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark"
                />
              </div>

              {/* Pincode, City, State */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-clay-brown mb-1">
                    {t('pincode') || 'PIN Code'} *
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-clay-brown mb-1">
                    {t('city') || 'City'} *
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-clay-brown mb-1">
                    {t('state') || 'State'} *
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              {/* Default Address */}
              {!formData.isDefault && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetDefault}
                  disabled={saving}
                  className="w-full"
                >
                  {t('setAsDefault') || 'Set as Default Address'}
                </Button>
              )}

              {formData.isDefault && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                  This is your default address
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving') || 'Saving...'}
                    </>
                  ) : (
                    t('updateAddress') || 'Update Address'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  {t('cancel') || 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
