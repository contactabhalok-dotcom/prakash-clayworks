'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hand, Leaf, Package, Truck } from 'lucide-react';

const features = [
  {
    key: 'handmade',
    icon: Hand,
  },
  {
    key: 'ecoFriendly',
    icon: Leaf,
  },
  {
    key: 'packaging',
    icon: Package,
  },
  {
    key: 'delivery',
    icon: Truck,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function USPSection() {
  const t = useTranslations('usp');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-clay-brown md:text-4xl">
            {t('title')}
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-terracotta" />
        </div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.key}
              variants={item}
              className="group text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/10 transition-colors group-hover:bg-terracotta">
                <feature.icon className="h-10 w-10 text-terracotta transition-colors group-hover:text-white" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clay-brown">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-sm text-clay-brown/60">
                {t(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
