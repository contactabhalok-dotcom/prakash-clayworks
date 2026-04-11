'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hand, Leaf, Package, Truck, Sparkles } from 'lucide-react';

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
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function USPSection() {
  const t = useTranslations('usp');

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-warm-beige/10 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-[300px] h-[300px] bg-gradient-to-br from-terracotta/10 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-[300px] h-[300px] bg-gradient-to-tr from-gold/10 to-transparent rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-14 sm:mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clay-brown/10 text-clay-brown text-sm font-semibold mb-3 tracking-wide border border-clay-brown/20">
              <Sparkles className="h-4 w-4" />
              {t('title')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-clay-brown">
              {t('title')}
            </h2>
            <div className="mt-4 mx-auto h-1.5 w-28 rounded-full bg-gradient-to-r from-clay-brown via-terracotta to-clay-brown" />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              variants={item}
              className="group text-center relative"
            >
              {/* Icon */}
              <div className="mx-auto mb-5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 to-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                <motion.div 
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-terracotta/10 to-gold/10 mx-auto transition-all duration-300 group-hover:from-terracotta group-hover:to-gold border-2 border-terracotta/20 group-hover:border-transparent"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className="h-9 w-9 text-terracotta transition-all duration-300 group-hover:text-white" />
                </motion.div>
              </div>
              
              {/* Content */}
              <h3 className="mb-2 text-xl font-bold text-clay-brown group-hover:text-terracotta transition-colors">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-sm text-clay-brown/60 leading-relaxed">
                {t(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
