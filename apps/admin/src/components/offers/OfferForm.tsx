'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOffer, updateOffer } from '@prakash/firebase';
import type { Offer, OfferFormData, OfferType } from '@prakash/types';
import { BilingualInput } from '@/components/ui/bilingual-input';
import { BilingualTextarea } from '@/components/ui/bilingual-textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Upload, X, Eye, EyeOff, Tag, Calendar, ImageOff } from 'lucide-react';
import Link from 'next/link';

interface OfferFormProps {
  offer?: Offer;
  mode: 'create' | 'edit';
}

const offerTypeOptions: { value: OfferType; label: string; emoji: string; desc: string }[] = [
  { value: 'discount', label: 'Discount', emoji: '%', desc: 'Percentage off on products' },
  { value: 'deal', label: 'Deal', emoji: '🏷️', desc: 'Special deal or combo' },
  { value: 'promotion', label: 'Promotion', emoji: '🎁', desc: 'Promotional campaign' },
  { value: 'announcement', label: 'Announcement', emoji: '📢', desc: 'Important announcement' },
];

export function OfferForm({ offer, mode }: OfferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(offer?.image || '');

  const [formData, setFormData] = useState<OfferFormData>({
    title: offer?.title || { en: '', hi: '' },
    description: offer?.description || { en: '', hi: '' },
    type: offer?.type || 'promotion',
    image: offer?.image || '',
    discount: offer?.discount,
    link: offer?.link || '',
    validFrom: offer?.validFrom || new Date(),
    validUntil: offer?.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: offer?.isActive ?? true,
    showAsAnnouncement: offer?.showAsAnnouncement ?? true,
    order: offer?.order || 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('path', `offers/${offer?.id || 'new'}`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.en || !formData.description.en) {
      alert('Please fill in all required English fields');
      return;
    }

    if (formData.validFrom >= formData.validUntil) {
      alert('Valid until date must be after valid from date');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await createOffer(formData);
      } else if (offer) {
        await updateOffer(offer.id, formData);
      }
      router.push('/offers');
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/offers">
          <button type="button" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'create' ? 'Create New Offer' : 'Edit Offer'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'create'
              ? 'Add a promotional offer, discount, or announcement'
              : 'Update offer details'}
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50 font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Create Offer' : 'Save Changes'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <BilingualInput
                label="Title"
                enValue={formData.title.en}
                hiValue={formData.title.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, hi: value },
                  }))
                }
                enPlaceholder="e.g., Summer Sale - 20% Off"
                hiPlaceholder="e.g., ग्रीष्मकालीन सेल - 20% छूट"
                required
              />
              <BilingualTextarea
                label="Description"
                enValue={formData.description.en}
                hiValue={formData.description.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, hi: value },
                  }))
                }
                enPlaceholder="Describe the offer details..."
                hiPlaceholder="ऑफर का विवरण बताएं..."
                required
              />
            </CardContent>
          </Card>

          {/* Offer Image */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <ImageOff className="h-5 w-5 text-slate-400" />
                  Banner Image
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Offer preview"
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-10 cursor-pointer hover:border-terracotta/50 hover:bg-orange-50/30 transition-all">
                  {uploading ? (
                    <Loader2 className="h-10 w-10 text-slate-300 animate-spin mb-3" />
                  ) : (
                    <Upload className="h-10 w-10 text-slate-300 mb-3" />
                  )}
                  <span className="text-sm text-slate-600 font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPG or WebP • Max 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Offer Type */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-slate-400" />
                  Offer Type
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {offerTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.type === opt.value
                      ? 'border-terracotta bg-orange-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="offerType"
                    checked={formData.type === opt.value}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, type: opt.value }))
                    }
                    className="sr-only"
                  />
                  <span className="text-lg w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full">
                    {opt.emoji}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Discount */}
          <Card>
            <CardHeader>
              <CardTitle>Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="e.g., 20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Optional — enter discount percentage</p>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  Validity Period
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Valid From
                </label>
                <input
                  type="datetime-local"
                  value={formData.validFrom.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Valid Until
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validUntil: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Link */}
          <Card>
            <CardHeader>
              <CardTitle>Destination Link</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                placeholder="/shop or /categories/diyas"
              />
              <p className="text-xs text-slate-500 mt-2">
                Where users go when they click the offer
              </p>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
              </div>
              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-5 h-5 text-terracotta border-slate-300 rounded focus:ring-terracotta"
                  />
                  <span className="text-sm text-slate-700 flex items-center gap-2">
                    {formData.isActive ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                    Active (visible on website)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAsAnnouncement}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showAsAnnouncement: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-terracotta border-slate-300 rounded focus:ring-terracotta"
                  />
                  <span className="text-sm text-slate-700">
                    Show as announcement banner (top marquee)
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
