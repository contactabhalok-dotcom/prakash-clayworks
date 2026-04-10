'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getOfferById } from '@prakash/firebase';
import type { Offer } from '@prakash/types';
import { OfferForm } from '@/components/offers/OfferForm';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const data = await getOfferById(resolvedParams.id);
        if (!data) {
          setError('Offer not found');
          return;
        }
        setOffer(data);
      } catch (err) {
        console.error('Error fetching offer:', err);
        setError('Failed to load offer');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        <p className="text-slate-500 text-lg">Loading offer...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-slate-700 text-lg">{error || 'Offer not found'}</p>
        <button
          onClick={() => router.push('/offers')}
          className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors"
        >
          Back to Offers
        </button>
      </div>
    );
  }

  return <OfferForm offer={offer} mode="edit" />;
}
