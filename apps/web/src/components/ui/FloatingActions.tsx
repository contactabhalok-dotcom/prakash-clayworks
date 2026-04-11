'use client';

import { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Contact details - Update these with actual contact info
  const whatsappNumber = '+916290351365'; // WhatsApp number
  const phoneNumber = '+916290351365'; // Phone number

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi! I am interested in your terracotta products.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <>
      {/* Floating Action Buttons - Always visible but more prominent on mobile */}
      <div className="fixed bottom-20 right-4 z-[60] flex flex-col gap-3 sm:bottom-6">
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Call Button */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={handleCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                aria-label="Call us"
              >
                <Phone className="h-6 w-6" />
              </motion.button>

              {/* WhatsApp Button */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.05 }}
                onClick={handleWhatsApp}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BA5A] active:scale-95 transition-all"
                aria-label="WhatsApp us"
              >
                <MessageCircle className="h-6 w-6" fill="currentColor" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all ${
            isExpanded
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-terracotta hover:bg-terracotta/90'
          }`}
          aria-label={isExpanded ? 'Close' : 'Contact us'}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-7 w-7 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="message"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-7 w-7 text-white" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulsing ring animation */}
        {!isExpanded && (
          <motion.div
            className="absolute bottom-0 right-0 h-16 w-16 rounded-full bg-terracotta"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </>
  );
}
