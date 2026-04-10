import { setRequestLocale } from 'next-intl/server';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { OfferCards } from '@/components/home/OfferCards';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { USPSection } from '@/components/home/USPSection';
import { PaymentSecurity } from '@/components/home/PaymentSecurity';
import { ReviewsSection } from '@/components/home/ReviewsSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AnnouncementBanner />
      <HeroBanner />
      <TrustBadges />
      <ProductCarousel />
      <CategoryGrid />
      <FeaturedProducts />
      <OfferCards />
      <WhyChooseUs />
      <USPSection />
      <PaymentSecurity />
      <ReviewsSection />
    </>
  );
}
