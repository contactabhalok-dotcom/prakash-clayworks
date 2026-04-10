'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getUserProfile,
  getOrCreateUserProfile,
  updateUserProfile,
  getUserOrderStats,
  getUserWallet,
  getOrCreateWallet,
  uploadImage,
  validateImageFile,
} from '@prakash/firebase';
import type { UserProfile, OrderStats, UserWallet, Gender, UserProfileFormData } from '@prakash/types';
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  ShoppingBag,
  ChevronRight,
  Edit2,
  Save,
  X,
  MapPin,
  Wallet,
  Clock,
  Bell,
  CreditCard,
  HelpCircle,
  Shield,
  Phone,
  Camera,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeftRight,
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@prakash/firebase';

type ProfileTab = 'overview' | 'personal' | 'addresses' | 'wallet' | 'saved';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    gender: '' as Gender | '',
    dateOfBirth: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/profile`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.uid && user?.email) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.uid || !user?.email) return;

    setLoading(true);
    try {
      const [profileData, stats, walletData] = await Promise.all([
        getOrCreateUserProfile(user.uid, user.email, user.displayName || undefined),
        getUserOrderStats(user.email),
        getOrCreateWallet(user.uid),
      ]);

      setProfile(profileData);
      setOrderStats(stats);
      setWallet(walletData);

      // Pre-fill form
      setProfileForm({
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    setSavingName(true);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
        await updateUserProfile(user.uid, { displayName: newName.trim() });
        setEditingName(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.uid) return;

    setSavingProfile(true);
    try {
      const updateData: Partial<UserProfileFormData> = {};

      // Always include phone, even if empty (to allow clearing)
      if ('phone' in profileForm) {
        updateData.phone = profileForm.phone;
      }

      // Always include gender, even if empty (to allow clearing)
      if ('gender' in profileForm) {
        updateData.gender = profileForm.gender || undefined;
      }

      // Always include dateOfBirth, even if empty (to allow clearing)
      if ('dateOfBirth' in profileForm) {
        updateData.dateOfBirth = profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth) : undefined;
      }

      console.log('Submitting profile update with data:', updateData);
      await updateUserProfile(user.uid, updateData);
      await loadProfileData();
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update profile: ${errorMessage}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validation = validateImageFile(file, 2); // 2MB max for profile photos
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingPhoto(true);
    try {
      // Upload to Supabase Storage via API
      const result = await uploadImage(file, `users/${user.uid}/profile`);

      if (!result.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      // Update Firebase Auth profile
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: result.url });
      }

      // Update user profile in Firestore
      await updateUserProfile(user.uid, { photoURL: result.url });

      // Reload to show new photo
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      alert(`Upload failed: ${errorMessage}. Please try again.`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', icon: User, label: t('overview') || 'Overview' },
    { id: 'personal', icon: Edit2, label: t('personalInfo') || 'Personal Info' },
    { id: 'addresses', icon: MapPin, label: t('addresses') || 'Addresses' },
    { id: 'wallet', icon: Wallet, label: t('wallet') || 'Wallet' },
    { id: 'saved', icon: Heart, label: t('savedItems') || 'Saved Items' },
  ];

  const quickLinks = [
    { href: '/orders', icon: Package, label: t('myOrders') || 'My Orders', color: 'text-blue-600 bg-blue-50' },
    { href: '/returns', icon: ArrowLeftRight, label: 'My Returns', color: 'text-orange-600 bg-orange-50' },
    { href: '/wishlist', icon: Heart, label: t('wishlist') || 'Wishlist', color: 'text-pink-600 bg-pink-50' },
    { href: '/notifications', icon: Bell, label: t('notifications') || 'Notifications', color: 'text-yellow-600 bg-yellow-50' },
    { href: '/payments', icon: CreditCard, label: t('payments') || 'Payments', color: 'text-green-600 bg-green-50' },
    { href: '/settings', icon: Settings, label: t('settings') || 'Settings', color: 'text-purple-600 bg-purple-50' },
    { href: '/help', icon: HelpCircle, label: t('helpCenter') || 'Help Center', color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome') || 'Back to Home'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-terracotta flex items-center justify-center mb-4">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {(user.displayName || user.email)?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-3 right-0 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-slate-600 hover:text-terracotta disabled:opacity-50"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </div>

                  {editingName ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t('enterName') || 'Enter your name'}
                        className="text-center"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleUpdateName}
                        disabled={savingName}
                      >
                        {savingName ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingName(false)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-clay-brown">
                        {user.displayName || t('addName') || 'Add your name'}
                      </h2>
                      <button
                        onClick={() => {
                          setNewName(user.displayName || '');
                          setEditingName(true);
                        }}
                        className="text-slate-400 hover:text-terracotta"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}

                  {user.metadata?.creationTime && (
                    <div className="flex items-center gap-2 text-slate-400 mt-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">
                        {t('memberSince') || 'Member since'}{' '}
                        {new Date(user.metadata.creationTime).toLocaleDateString(
                          locale === 'hi' ? 'hi-IN' : 'en-IN',
                          { month: 'long', year: 'numeric' }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as ProfileTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-terracotta text-white'
                          : 'text-clay-brown hover:bg-warm-beige'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}

                  <div className="border-t border-slate-200 my-2" />

                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    {tAuth('logout') || 'Logout'}
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    {/* Account Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5 text-terracotta" />
                          {t('accountSummary') || 'Account Summary'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">
                              {orderStats?.totalOrders || 0}
                            </p>
                            <p className="text-xs text-slate-600">
                              {t('totalOrders') || 'Total Orders'}
                            </p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <Truck className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-600">
                              {orderStats?.pendingOrders || 0}
                            </p>
                            <p className="text-xs text-slate-600">
                              {t('pendingOrders') || 'Pending'}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-600">
                              {orderStats?.deliveredOrders || 0}
                            </p>
                            <p className="text-xs text-slate-600">
                              {t('delivered') || 'Delivered'}
                            </p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-600">
                              {orderStats?.cancelledOrders || 0}
                            </p>
                            <p className="text-xs text-slate-600">
                              {t('cancelled') || 'Cancelled'}
                            </p>
                          </div>
                        </div>

                        {orderStats && orderStats.totalSpent > 0 && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-terracotta/10 to-warm-beige rounded-lg">
                            <p className="text-sm text-slate-600">
                              {t('totalSpent') || 'Total Amount Spent'}
                            </p>
                            <p className="text-2xl font-bold text-terracotta">
                              {formatPrice(orderStats.totalSpent)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Wallet Card */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-terracotta" />
                          {t('walletBalance') || 'Wallet Balance'}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('wallet')}
                        >
                          {t('viewHistory') || 'View History'}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold text-clay-brown">
                              {formatPrice(wallet?.balance || 0)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {t('availableBalance') || 'Available Balance'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('quickLinks') || 'Quick Links'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <div className={`flex items-center gap-3 p-4 rounded-lg ${link.color} hover:opacity-80 transition-opacity cursor-pointer`}>
                                <link.icon className="h-5 w-5" />
                                <span className="font-medium text-sm">{link.label}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-terracotta" />
                        {t('personalInformation') || 'Personal Information'}
                      </CardTitle>
                      {!editingProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProfile(true)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t('edit') || 'Edit'}
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {editingProfile ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-clay-brown mb-1">
                              {t('fullName') || 'Full Name'}
                            </label>
                            <Input
                              value={user.displayName || ''}
                              disabled
                              className="bg-slate-50"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              {t('nameChangeHint') || 'Click the edit icon next to your name in the sidebar to change it'}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-clay-brown mb-1">
                              {t('email') || 'Email'}
                            </label>
                            <Input value={user.email || ''} disabled className="bg-slate-50" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-clay-brown mb-1">
                              {t('phone') || 'Phone Number'}
                            </label>
                            <Input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, phone: e.target.value })
                              }
                              placeholder="+91 98765 43210"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-clay-brown mb-1">
                              {t('gender') || 'Gender'}
                            </label>
                            <select
                              value={profileForm.gender}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  gender: e.target.value as Gender,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
                            >
                              <option value="">{t('selectGender') || 'Select Gender'}</option>
                              <option value="male">{t('male') || 'Male'}</option>
                              <option value="female">{t('female') || 'Female'}</option>
                              <option value="other">{t('other') || 'Other'}</option>
                              <option value="prefer_not_to_say">
                                {t('preferNotToSay') || 'Prefer not to say'}
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-clay-brown mb-1">
                              {t('dateOfBirth') || 'Date of Birth'}
                            </label>
                            <Input
                              type="date"
                              value={profileForm.dateOfBirth}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, dateOfBirth: e.target.value })
                              }
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateProfile} disabled={savingProfile}>
                              {savingProfile && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              {t('saveChanges') || 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingProfile(false)}
                            >
                              {t('cancel') || 'Cancel'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-slate-500">{t('fullName') || 'Full Name'}</span>
                            <span className="font-medium text-clay-brown">
                              {user.displayName || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-slate-500">{t('email') || 'Email'}</span>
                            <span className="font-medium text-clay-brown">{user.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-slate-500">{t('phone') || 'Phone'}</span>
                            <span className="font-medium text-clay-brown">
                              {profile?.phone || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-slate-500">{t('gender') || 'Gender'}</span>
                            <span className="font-medium text-clay-brown capitalize">
                              {profile?.gender?.replace('_', ' ') || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-slate-500">
                              {t('dateOfBirth') || 'Date of Birth'}
                            </span>
                            <span className="font-medium text-clay-brown">
                              {profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '-'}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-terracotta" />
                        {t('savedAddresses') || 'Saved Addresses'}
                      </CardTitle>
                      <Link href="/addresses/new">
                        <Button size="sm">
                          {t('addNewAddress') || 'Add New Address'}
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {profile?.addresses && profile.addresses.length > 0 ? (
                        <div className="space-y-4">
                          {profile.addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`p-4 rounded-lg border-2 ${
                                address.isDefault
                                  ? 'border-terracotta bg-terracotta/5'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={address.isDefault ? 'default' : 'secondary'}>
                                      {address.label}
                                    </Badge>
                                    {address.isDefault && (
                                      <Badge className="bg-green-100 text-green-700">
                                        {t('default') || 'Default'}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-clay-brown">{address.name}</p>
                                  <p className="text-sm text-slate-600">{address.phone}</p>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {address.address}
                                    {address.landmark && `, ${address.landmark}`}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {address.city}, {address.state} - {address.pincode}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Link href={`/addresses/${address.id}/edit`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 mb-4">
                            {t('noAddresses') || 'No addresses saved yet'}
                          </p>
                          <Link href="/addresses/new">
                            <Button>{t('addFirstAddress') || 'Add Your First Address'}</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-terracotta" />
                          {t('myWallet') || 'My Wallet'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gradient-to-r from-terracotta to-clay-brown rounded-xl p-6 text-white">
                          <p className="text-sm opacity-80">
                            {t('availableBalance') || 'Available Balance'}
                          </p>
                          <p className="text-4xl font-bold mt-1">
                            {formatPrice(wallet?.balance || 0)}
                          </p>
                          <div className="flex gap-4 mt-4 text-sm">
                            <div>
                              <p className="opacity-80">{t('totalCredited') || 'Total Credited'}</p>
                              <p className="font-semibold">
                                {formatPrice(wallet?.totalCredited || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="opacity-80">{t('totalDebited') || 'Total Used'}</p>
                              <p className="font-semibold">
                                {formatPrice(wallet?.totalDebited || 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="font-medium text-clay-brown mb-4">
                            {t('transactionHistory') || 'Transaction History'}
                          </h3>
                          <div className="text-center py-8 text-slate-500">
                            <Clock className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                            <p>{t('noTransactions') || 'No transactions yet'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Saved Items Tab */}
                {activeTab === 'saved' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-terracotta" />
                          {t('wishlist') || 'Wishlist'}
                        </CardTitle>
                        <Link href="/wishlist">
                          <Button variant="outline" size="sm">
                            {t('viewAll') || 'View All'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-500 text-center py-8">
                          {t('viewWishlistPage') || 'View your wishlist items on the dedicated page'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-terracotta" />
                          {t('recentlyViewed') || 'Recently Viewed'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-500 text-center py-8">
                          {t('continueWhereYouLeft') || 'Continue browsing where you left off'}
                        </p>
                        <div className="text-center">
                          <Link href="/shop">
                            <Button variant="outline">
                              {t('browseProducts') || 'Browse Products'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
