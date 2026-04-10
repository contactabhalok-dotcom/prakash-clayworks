'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  ArrowLeft,
  Globe,
  Bell,
  Lock,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Mail,
  Moon,
  Sun,
  Monitor,
  Type,
  FileText,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { localeNames, type Locale } from '@/i18n/config';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { getFirebaseAuth, getOrCreateUserSettings, updateUserSettings } from '@prakash/firebase';
import type { UserSettings } from '@prakash/types';

type SettingsTab = 'language' | 'password' | 'notifications' | 'appearance' | 'privacy' | 'policies';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('language');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Notification preferences (stored in localStorage for demo)
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/settings');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.uid) {
      loadSettings();
    }
  }, [user]);

  useEffect(() => {
    // Load notification preferences from localStorage
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const loadSettings = async () => {
    if (!user?.uid) return;

    setLoadingSettings(true);
    try {
      const userSettings = await getOrCreateUserSettings(user.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace('/settings', { locale: newLocale });
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!user?.uid) return;

    // Update local state
    setSettings((prev) => (prev ? { ...prev, theme } : null));

    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Save to Firebase
    try {
      await updateUserSettings(user.uid, { theme });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleTextSizeChange = async (textSize: 'small' | 'medium' | 'large') => {
    if (!user?.uid) return;

    setSettings((prev) => (prev ? { ...prev, textSize } : null));

    // Apply text size
    document.documentElement.style.fontSize =
      textSize === 'small' ? '14px' : textSize === 'large' ? '18px' : '16px';

    try {
      await updateUserSettings(user.uid, { textSize });
    } catch (error) {
      console.error('Error saving text size:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error('User not found');
      }

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      if (errorMessage.includes('wrong-password')) {
        setPasswordError(t('wrongPassword') || 'Current password is incorrect');
      } else {
        setPasswordError(t('passwordChangeFailed') || 'Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;

    setPasswordLoading(true);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, user.email);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setPasswordError(t('resetEmailFailed') || 'Failed to send reset email');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notification-preferences', JSON.stringify(updated));
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error('User not found');
      }

      // Re-authenticate before deletion
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user
      await deleteUser(currentUser);

      // Sign out and redirect
      await signOut();
      router.push('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      if (errorMessage.includes('wrong-password')) {
        alert('Incorrect password');
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-beige/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const menuItems = [
    { id: 'language', icon: Globe, label: t('language') || 'Language' },
    { id: 'appearance', icon: Moon, label: t('appearance') || 'Appearance' },
    { id: 'notifications', icon: Bell, label: t('notifications') || 'Notifications' },
    { id: 'password', icon: Lock, label: t('password') || 'Password' },
    { id: 'privacy', icon: Shield, label: t('privacy') || 'Privacy' },
    { id: 'policies', icon: FileText, label: t('policies') || 'Policies' },
  ];

  return (
    <div className="min-h-screen bg-warm-beige/20 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-clay-brown hover:text-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToProfile') || 'Back to Profile'}
        </Link>

        <h1 className="text-2xl font-bold text-clay-brown mb-6 flex items-center gap-2">
          <Settings className="h-6 w-6 text-terracotta" />
          {t('title') || 'Settings'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
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
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Language Settings */}
            {activeTab === 'language' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-terracotta" />
                    {t('languageSettings') || 'Language Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 mb-4">
                    {t('languageDescription') || 'Choose your preferred language for the website'}
                  </p>
                  <div className="space-y-3">
                    {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                          locale === code
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <span className="font-medium text-clay-brown">{name}</span>
                        {locale === code && (
                          <Check className="h-5 w-5 text-terracotta" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-terracotta" />
                    {t('appearanceSettings') || 'Appearance Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="font-medium text-clay-brown mb-3">
                      {t('theme') || 'Theme'}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.theme === 'light'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <Sun className="h-6 w-6" />
                        <span className="text-sm">{t('light') || 'Light'}</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.theme === 'dark'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <Moon className="h-6 w-6" />
                        <span className="text-sm">{t('dark') || 'Dark'}</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.theme === 'system'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm">{t('system') || 'System'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Size */}
                  <div>
                    <h3 className="font-medium text-clay-brown mb-3 flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      {t('textSize') || 'Text Size'}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleTextSizeChange('small')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.textSize === 'small'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <span className="text-xs">Aa</span>
                        <span className="text-sm">{t('small') || 'Small'}</span>
                      </button>
                      <button
                        onClick={() => handleTextSizeChange('medium')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.textSize === 'medium'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <span className="text-base">Aa</span>
                        <span className="text-sm">{t('medium') || 'Medium'}</span>
                      </button>
                      <button
                        onClick={() => handleTextSizeChange('large')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          settings?.textSize === 'large'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-slate-200 hover:border-terracotta/50'
                        }`}
                      >
                        <span className="text-lg">Aa</span>
                        <span className="text-sm">{t('large') || 'Large'}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-terracotta" />
                    {t('notificationSettings') || 'Notification Preferences'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 mb-6">
                    {t('notificationDescription') ||
                      'Choose what notifications you want to receive'}
                  </p>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('orderUpdates') || 'Order Updates'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('orderUpdatesDesc') ||
                            'Get notified about your order status changes'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdates}
                        onChange={() => handleNotificationChange('orderUpdates')}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('promotions') || 'Promotions & Offers'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('promotionsDesc') ||
                            'Receive updates about sales and special offers'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('newArrivals') || 'New Arrivals'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('newArrivalsDesc') ||
                            'Get notified when new products are added'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.newArrivals}
                        onChange={() => handleNotificationChange('newArrivals')}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>
                  </div>

                  <div className="mt-6">
                    <Link href="/notifications">
                      <Button variant="outline" className="w-full">
                        <Bell className="h-4 w-4 mr-2" />
                        {t('viewAllPreferences') || 'View All Notification Preferences'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-terracotta" />
                    {t('changePassword') || 'Change Password'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {passwordSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      {t('passwordChanged') || 'Password changed successfully!'}
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-clay-brown mb-1">
                        {t('currentPassword') || 'Current Password'}
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clay-brown mb-1">
                        {t('newPassword') || 'New Password'}
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clay-brown mb-1">
                        {t('confirmPassword') || 'Confirm New Password'}
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {t('updatePassword') || 'Update Password'}
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-slate-500 mb-3">
                      {t('forgotPassword') || 'Forgot your current password?'}
                    </p>
                    {resetEmailSent ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">
                          {t('resetEmailSent') || 'Reset link sent to your email!'}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleSendResetEmail}
                        disabled={passwordLoading}
                      >
                        {t('sendResetEmail') || 'Send Reset Email'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-terracotta" />
                      {t('privacySettings') || 'Privacy Settings'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-clay-brown">
                            {t('downloadData') || 'Download Your Data'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t('downloadDataDesc') || 'Get a copy of your personal data'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {t('request') || 'Request'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      {t('dangerZone') || 'Danger Zone'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        <div className="flex-1">
                          <p className="font-medium text-red-700">
                            {t('deleteAccount') || 'Delete Account'}
                          </p>
                          <p className="text-sm text-red-600">
                            {t('deleteAccountDesc') ||
                              'Permanently delete your account and all data'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          {t('delete') || 'Delete'}
                        </Button>
                      </div>
                    </div>

                    {showDeleteConfirm && (
                      <div className="mt-4 p-4 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 mb-4">
                          This action cannot be undone. Please enter your password to confirm.
                        </p>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="mb-4"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteAccount}
                            disabled={deleting || !deletePassword}
                          >
                            {deleting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete My Account
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Policies */}
            {activeTab === 'policies' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-terracotta" />
                    {t('legalPolicies') || 'Legal & Policies'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="/terms"
                    target="_blank"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-clay-brown">
                        {t('termsAndConditions') || 'Terms & Conditions'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t('termsDesc') || 'Read our terms of service'}
                      </p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
                  </a>

                  <a
                    href="/privacy"
                    target="_blank"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-clay-brown">
                        {t('privacyPolicy') || 'Privacy Policy'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t('privacyPolicyDesc') || 'How we handle your data'}
                      </p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
                  </a>

                  <a
                    href="/refund-policy"
                    target="_blank"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-clay-brown">
                        {t('refundPolicy') || 'Refund & Return Policy'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t('refundPolicyDesc') || 'Our return and refund guidelines'}
                      </p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
                  </a>

                  <a
                    href="/shipping-policy"
                    target="_blank"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-clay-brown">
                        {t('shippingPolicy') || 'Shipping Policy'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t('shippingPolicyDesc') || 'Delivery times and charges'}
                      </p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
                  </a>

                  <div className="mt-6 p-4 bg-slate-100 rounded-lg text-center">
                    <p className="text-sm text-slate-500">
                      App Version: 1.0.0
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
