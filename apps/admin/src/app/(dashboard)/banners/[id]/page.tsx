'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBannerById } from '@prakash/firebase';
import type { Banner } from '@prakash/types';
import { BannerForm } from '@/components/banners/BannerForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditBannerPage() {
  const params = useParams();
  const id = params.id as string;

  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      const data = await getBannerById(id);
      if (data) {
        setBanner(data);
      } else {
        setError('Banner not found');
      }
    } catch (err) {
      console.error('Error fetching banner:', err);
      setError('Failed to load banner');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading banner...</p>
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error || 'Banner not found'}</p>
        <Link href="/banners">
          <Button variant="outline">Back to Banners</Button>
        </Link>
      </div>
    );
  }

  return <BannerForm banner={banner} />;
}
