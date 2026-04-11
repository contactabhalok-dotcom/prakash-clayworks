'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getOrCreateUserSettings,
  updateNotificationPreferences,
} from '@prakash/firebase';
import type { Notification, NotificationPreferences } from '@prakash/types';
import {
  Bell,
  ArrowLeft,
  Loader2,
  Package,
  Tag,
  TrendingDown,
  Sparkles,
  Info,
  CheckCheck,
  Settings,
} from 'lucide-react';

const notificationIcons: Record<string, typeof Bell> = {
  order_update: Package,
  promotion: Tag,
  price_drop: TrendingDown,
  new_arrival: Sparkles,
  system: Info,
};

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/notifications');
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
    setIndexError(false);
    try {
      const [notifs, settings] = await Promise.all([
        getUserNotifications(user.uid),
        getOrCreateUserSettings(user.uid),
      ]);
      setNotifications(notifs);
      setPreferences(settings.notificationPreferences);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('index')) {
        setIndexError(true);
        setNotifications([]);
      } else {
        console.error('Error loading notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user?.uid || !preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    setSaving(true);
    try {
      await updateNotificationPreferences(user.uid, { [key]: value });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-clay-brown flex items-center gap-2">
            <Bell className="h-6 w-6 text-terracotta" />
            {t('title') || 'Notifications'}
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-sm bg-terracotta text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            <Bell className="h-4 w-4 mr-2" />
            {t('allNotifications') || 'All Notifications'}
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('preferences') || 'Preferences'}
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            </CardContent>
          </Card>
        ) : activeTab === 'all' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('recentNotifications') || 'Recent Notifications'}</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  {t('markAllRead') || 'Mark all as read'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {indexError ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-terracotta mx-auto mb-4 animate-spin" />
                  <p className="text-clay-brown font-medium mb-2">
                    Setting up notifications...
                  </p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Our notification system is being configured. Please refresh the page in a few minutes.
                  </p>
                  <Button onClick={() => loadData()} className="mt-4" variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {t('noNotifications') || 'No notifications yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          notification.isRead
                            ? 'bg-slate-50'
                            : 'bg-terracotta/5 border-l-4 border-terracotta'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              notification.isRead ? 'bg-slate-200' : 'bg-terracotta/20'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                notification.isRead ? 'text-slate-500' : 'text-terracotta'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                notification.isRead ? 'text-slate-600' : 'text-clay-brown'
                              }`}
                            >
                              {notification.title[locale as 'en' | 'hi'] || notification.title.en}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {notification.message[locale as 'en' | 'hi'] || notification.message.en}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-terracotta rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings') || 'Notification Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && (
                <>
                  <div className="space-y-4">
                    <h3 className="font-medium text-clay-brown">
                      {t('notificationTypes') || 'Notification Types'}
                    </h3>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-clay-brown">
                            {t('orderUpdates') || 'Order Updates'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t('orderUpdatesDesc') || 'Get notified about your order status'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.orderUpdates}
                        onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-clay-brown">
                            {t('promotions') || 'Promotions & Offers'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t('promotionsDesc') || 'Sales, discounts, and special offers'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.promotions}
                        onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-clay-brown">
                            {t('priceDrops') || 'Price Drop Alerts'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t('priceDropsDesc') || 'When items in your wishlist drop in price'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.priceDropAlerts}
                        onChange={(e) => handlePreferenceChange('priceDropAlerts', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-clay-brown">
                            {t('newArrivals') || 'New Arrivals'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t('newArrivalsDesc') || 'When new products are added'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.newArrivals}
                        onChange={(e) => handlePreferenceChange('newArrivals', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>
                  </div>

                  <div className="border-t pt-4 mt-6 space-y-4">
                    <h3 className="font-medium text-clay-brown">
                      {t('communicationChannels') || 'Communication Channels'}
                    </h3>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('emailNotifications') || 'Email Notifications'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('emailNotificationsDesc') || 'Receive updates via email'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('smsNotifications') || 'SMS Notifications'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('smsNotificationsDesc') || 'Receive updates via SMS'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.smsNotifications}
                        onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <div>
                        <p className="font-medium text-clay-brown">
                          {t('whatsappNotifications') || 'WhatsApp Notifications'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t('whatsappNotificationsDesc') || 'Receive updates via WhatsApp'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.whatsappNotifications}
                        onChange={(e) => handlePreferenceChange('whatsappNotifications', e.target.checked)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
