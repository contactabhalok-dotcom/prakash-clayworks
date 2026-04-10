import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Leaf, Users, Award } from 'lucide-react';
import { ArtisanCarousel } from '@/components/about/ArtisanCarousel';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tc = await getTranslations('common');

  // Family Artisans - Replace with your family member details
  const artisans = [
    {
      name: 'Prakash Kumar',
      role: 'Master Potter & Founder',
      description: 'With over 30 years of experience in terracotta craftsmanship, Prakash leads our family tradition with unmatched skill and dedication. He has mastered the ancient art of clay molding and continues to innovate while preserving traditional techniques.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      name: 'Sita Devi',
      role: 'Design Artist & Quality Expert',
      description: 'Bringing artistic excellence to every piece, Sita specializes in traditional painting and finishing work. Her keen eye for detail ensures that each product meets the highest standards of quality and aesthetic beauty.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
      name: 'Rohan Kumar',
      role: 'Innovation Lead & Business Development',
      description: 'Combining traditional craftsmanship with modern business practices, Rohan brings fresh perspectives to the family business. He focuses on product innovation, digital presence, and expanding our reach to new markets.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
    {
      name: 'Amit Kumar',
      role: 'Production Manager & Clay Specialist',
      description: 'Expert in clay selection and preparation, Amit ensures that only the finest natural clay is used in our products. He manages the production process and maintains the consistency and quality of our terracotta items.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-clay-brown py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Preserving the ancient art of terracotta craftsmanship
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-clay-brown">
                {t('mission.title')}
              </h2>
              <p className="mb-6 text-lg text-clay-brown/70">
                {t('mission.content')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10">
                    <Heart className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">Passion</h3>
                    <p className="text-sm text-gray-600">Crafted with love</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10">
                    <Leaf className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">Eco-Friendly</h3>
                    <p className="text-sm text-gray-600">100% natural clay</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10">
                    <Users className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">Community</h3>
                    <p className="text-sm text-gray-600">Supporting artisans</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10">
                    <Award className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-clay-brown">Quality</h3>
                    <p className="text-sm text-gray-600">Premium products</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80"
                alt="Artisan at work"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="bg-warm-beige/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
                alt="Clay heritage"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="mb-4 text-3xl font-bold text-clay-brown">
                {t('heritage.title')}
              </h2>
              <p className="mb-6 text-lg text-clay-brown/70">
                {t('heritage.content')}
              </p>
              <p className="text-clay-brown/70">
                From the ancient Indus Valley civilization to modern homes, clay
                products have always held a special place in Indian culture. Our
                products carry this rich heritage forward, bringing traditional
                craftsmanship into contemporary spaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Family Artisans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-clay-brown md:text-4xl">
              {t('familyArtisans.title')}
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-clay-brown/70">
              {t('familyArtisans.subtitle')}
            </p>
          </div>

          <ArtisanCarousel artisans={artisans} />

          <div className="mt-12 rounded-2xl bg-warm-beige/50 p-6 text-center md:p-8">
            <p className="text-clay-brown/80">
              <span className="font-semibold text-terracotta">{t('familyArtisans.tradition')}</span>{' '}
              {t('familyArtisans.traditionText')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-terracotta py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to explore our collection?
          </h2>
          <p className="mb-8 text-white/80">
            Discover authentic handcrafted terracotta products
          </p>
          <Button size="lg" variant="gold" asChild>
            <Link href="/shop">
              {tc('shop')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
