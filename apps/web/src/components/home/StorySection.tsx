'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function StorySection() {
  const t = useTranslations('story');
  const tc = useTranslations('common');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"
                alt="Artisan crafting clay products"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-4 shadow-xl md:p-6">
              <p className="text-4xl font-bold text-terracotta">15+</p>
              <p className="text-sm text-clay-brown/60">Years of Heritage</p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-terracotta">
              {t('subtitle')}
            </h2>
            <h3 className="mb-6 text-3xl font-bold text-clay-brown md:text-4xl">
              {t('title')}
            </h3>
            <p className="mb-8 text-lg leading-relaxed text-clay-brown/70">
              {t('content')}
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-warm-beige p-4">
                <p className="text-2xl font-bold text-terracotta">50+</p>
                <p className="text-sm text-clay-brown/60">Skilled Artisans</p>
              </div>
              <div className="rounded-xl bg-warm-beige p-4">
                <p className="text-2xl font-bold text-terracotta">10,000+</p>
                <p className="text-sm text-clay-brown/60">Products Crafted</p>
              </div>
            </div>

            <Button size="lg" asChild>
              <Link href="/about">
                {tc('about')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
