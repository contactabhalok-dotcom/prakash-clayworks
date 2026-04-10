'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SingleImageUpload } from '@/components/ui/single-image-upload';
import { BilingualInput } from '@/components/ui/bilingual-input';
import { createBanner, updateBanner } from '@prakash/firebase';
import type { Banner } from '@prakash/types';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface BannerFormProps {
  banner?: Banner;
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    image: banner?.image || '',
    title: banner?.title || { en: '', hi: '' },
    subtitle: banner?.subtitle || { en: '', hi: '' },
    buttonText: banner?.buttonText || { en: 'Shop Now', hi: 'अभी खरीदें' },
    buttonLink: banner?.buttonLink || '/products',
    order: banner?.order || 0,
    isActive: banner?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert('Please upload a banner image');
      return;
    }

    setLoading(true);

    try {
      if (banner) {
        await updateBanner(banner.id, formData);
      } else {
        await createBanner(formData);
      }
      router.push('/banners');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/banners">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {banner ? 'Edit Banner' : 'Add New Banner'}
          </h1>
          <p className="text-slate-500">
            {banner ? 'Update banner details' : 'Create a new homepage banner'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Image</CardTitle>
            </CardHeader>
            <CardContent>
              <SingleImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                path={`banners/${banner?.id || 'new'}`}
                maxSizeMB={5}
                aspectRatio="banner"
                placeholder="Drop banner image here (recommended: 1920x640)"
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Text Content */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                enPlaceholder="e.g., Handcrafted Clay Products"
                hiPlaceholder="e.g., हस्तनिर्मित मिट्टी के उत्पाद"
              />
              <BilingualInput
                label="Subtitle"
                enValue={formData.subtitle.en}
                hiValue={formData.subtitle.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    subtitle: { ...prev.subtitle, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    subtitle: { ...prev.subtitle, hi: value },
                  }))
                }
                enPlaceholder="e.g., Traditional craftsmanship"
                hiPlaceholder="e.g., पारंपरिक शिल्पकारी"
              />
            </CardContent>
          </Card>

          {/* Button Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Button Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BilingualInput
                label="Button Text"
                enValue={formData.buttonText.en}
                hiValue={formData.buttonText.hi}
                onEnChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    buttonText: { ...prev.buttonText, en: value },
                  }))
                }
                onHiChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    buttonText: { ...prev.buttonText, hi: value },
                  }))
                }
                enPlaceholder="e.g., Shop Now"
                hiPlaceholder="e.g., अभी खरीदें"
              />
              <Input
                label="Button Link"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buttonLink: e.target.value,
                  }))
                }
                placeholder="e.g., /products or /categories/diyas"
                hint="Relative URL path for the button"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Display Order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: Number(e.target.value),
                  }))
                }
                hint="Lower numbers appear first"
              />
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-sm text-slate-700 flex items-center gap-2">
                    {formData.isActive ? (
                      <>
                        <Eye className="h-4 w-4 text-green-500" />
                        Active (Visible on website)
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-slate-400" />
                        Inactive (Hidden)
                      </>
                    )}
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {formData.image ? (
                  <div className="relative aspect-[3/1]">
                    <img
                      src={formData.image}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-4">
                      <h3 className="text-white font-bold text-sm truncate">
                        {formData.title.en || 'Banner Title'}
                      </h3>
                      <p className="text-white/80 text-xs truncate">
                        {formData.subtitle.en || 'Subtitle text'}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-terracotta text-white text-xs rounded">
                          {formData.buttonText.en || 'Shop Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/1] bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No image</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : banner ? (
                  'Update Banner'
                ) : (
                  'Create Banner'
                )}
              </Button>
              <Link href="/banners" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
