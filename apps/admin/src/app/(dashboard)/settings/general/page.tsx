'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSiteSettings, saveSiteSettings, type SiteSettings } from '@prakash/firebase';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Truck,
  IndianRupee,
  Save,
  Loader2,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Omit<SiteSettings, 'updatedAt'>>({
    businessName: 'Prakash Clayworks',
    phone: '+916290351365',
    whatsapp: '916290351365',
    email: 'hello@prakashclayworks.com',
    supportEmail: 'support@prakashclayworks.com',
    address: '34/3/5 old mullajor road jagatdal kolkata 743125 west bengal india',
    businessHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    instagram: 'https://instagram.com/prakashclayworks',
    facebook: 'https://facebook.com/prakashclayworks',
    youtube: 'https://youtube.com/@prakashclayworks',
    freeShippingThreshold: 500,
    shippingCost: 50,
    gstNumber: '',
    taxRate: 18,
    aboutUs: 'Prakash Clayworks is a traditional pottery business dedicated to preserving the art of handmade clay products. Our skilled artisans create beautiful, eco-friendly products using techniques passed down through generations.',
  });

  // Load settings from Firestore on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteSettings();
      setSettings({
        businessName: data.businessName,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        supportEmail: data.supportEmail,
        address: data.address,
        businessHours: data.businessHours,
        instagram: data.instagram,
        facebook: data.facebook,
        youtube: data.youtube,
        freeShippingThreshold: data.freeShippingThreshold,
        shippingCost: data.shippingCost,
        gstNumber: data.gstNumber,
        taxRate: data.taxRate,
        aboutUs: data.aboutUs,
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await saveSiteSettings(settings);
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">General Settings</h1>
          <p className="text-slate-500 mt-1">Configure store information and preferences</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta/10 rounded-lg">
              <Store className="h-5 w-5 text-terracotta" />
            </div>
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic details about your business</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Name
            </label>
            <Input
              value={settings.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="Your business name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                WhatsApp Number
              </label>
              <Input
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="919876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="hello@yourstore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Support Email
              </label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                placeholder="support@yourstore.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Business Address
            </label>
            <Textarea
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Your business address"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Hours
            </label>
            <Input
              value={settings.businessHours}
              onChange={(e) => handleChange('businessHours', e.target.value)}
              placeholder="Mon-Sat: 9:00 AM - 6:00 PM"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Instagram className="inline h-4 w-4 mr-1" />
              Instagram URL
            </label>
            <Input
              value={settings.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourstore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Facebook className="inline h-4 w-4 mr-1" />
              Facebook URL
            </label>
            <Input
              value={settings.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourstore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Youtube className="inline h-4 w-4 mr-1" />
              YouTube URL
            </label>
            <Input
              value={settings.youtube}
              onChange={(e) => handleChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@yourstore"
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Shipping & Pricing</CardTitle>
              <CardDescription>Configure shipping costs and thresholds</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <IndianRupee className="inline h-4 w-4 mr-1" />
                Shipping Cost (₹)
              </label>
              <Input
                type="number"
                value={settings.shippingCost}
                onChange={(e) => handleChange('shippingCost', parseInt(e.target.value) || 0)}
                placeholder="50"
              />
              <p className="text-xs text-slate-500 mt-1">Flat shipping rate for all orders</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <IndianRupee className="inline h-4 w-4 mr-1" />
                Free Shipping Threshold (₹)
              </label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', parseInt(e.target.value) || 0)}
                placeholder="500"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum order value for free shipping</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & GST */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <IndianRupee className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Tax & GST</CardTitle>
              <CardDescription>Tax configuration and GST details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                GST Number
              </label>
              <Input
                value={settings.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="GSTIN123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tax Rate (%)
              </label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleChange('taxRate', parseInt(e.target.value) || 0)}
                placeholder="18"
              />
              <p className="text-xs text-slate-500 mt-1">Default tax rate for products</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Business */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Store className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>About Your Business</CardTitle>
              <CardDescription>Tell customers about your story</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.aboutUs}
            onChange={(e) => handleChange('aboutUs', e.target.value)}
            placeholder="Tell your story..."
            rows={6}
          />
          <p className="text-xs text-slate-500 mt-2">
            This will be displayed on your About Us page
          </p>
        </CardContent>
      </Card>

      {/* Save Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg lg:left-72">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Changes are saved to database and persist across sessions
          </p>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-terracotta hover:bg-terracotta-dark"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
