'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Artisan {
  name: string;
  role: string;
  description: string;
  image: string;
}

interface ArtisanCarouselProps {
  artisans: Artisan[];
}

export function ArtisanCarousel({ artisans }: ArtisanCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artisans.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artisans.length) % artisans.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warm-beige/30 to-terracotta/5 px-4 py-12 md:px-8 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-8 md:flex-row md:gap-12"
          >
            {/* Image */}
            <div className="relative w-full max-w-xs md:w-1/3">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={artisans[currentIndex].image}
                  alt={artisans[currentIndex].name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Decorative border */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-terracotta/20"></div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-2 text-3xl font-bold text-clay-brown md:text-4xl"
              >
                {artisans[currentIndex].name}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-lg font-semibold text-terracotta md:text-xl"
              >
                {artisans[currentIndex].role}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base leading-relaxed text-clay-brown/70 md:text-lg"
              >
                {artisans[currentIndex].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-terracotta hover:text-white focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 md:left-4 md:p-3"
          aria-label="Previous artisan"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-terracotta hover:text-white focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 md:right-4 md:p-3"
          aria-label="Next artisan"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="mt-6 flex justify-center gap-2">
        {artisans.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 ${
              index === currentIndex
                ? 'w-8 bg-terracotta'
                : 'w-2.5 bg-clay-brown/30 hover:bg-clay-brown/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="mt-4 text-center text-sm text-clay-brown/60">
        {currentIndex + 1} / {artisans.length}
      </div>
    </div>
  );
}
