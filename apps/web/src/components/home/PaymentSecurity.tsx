'use client';

import { motion } from 'framer-motion';
import { Shield, CreditCard, Smartphone, Lock, BadgeCheck } from 'lucide-react';

export function PaymentSecurity() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-green-50/80 via-blue-50/60 to-purple-50/80 relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-green-200/40 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-blue-200/40 to-transparent rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-lg shadow-md border border-terracotta/20">
                  <CreditCard className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="font-bold text-clay-brown text-lg">Multiple Payment Options</h3>
              </div>
              <p className="text-sm text-clay-brown/70">
                Credit Card, Debit Card, UPI, Net Banking & COD
              </p>
            </motion.div>

            {/* Payment Logos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {/* Visa */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white px-5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <span className="text-blue-800 font-bold text-xl">VISA</span>
              </motion.div>
              {/* Mastercard */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white px-5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-red-500 opacity-80"></div>
                  <div className="w-7 h-7 rounded-full bg-orange-500 opacity-80 -ml-3"></div>
                </div>
              </motion.div>
              {/* RuPay */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white px-5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <span className="text-green-700 font-bold text-lg">RuPay</span>
              </motion.div>
              {/* UPI */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white px-5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-purple-600">UPI</span>
              </motion.div>
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-right"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 px-6 py-3.5 rounded-full shadow-xl border-2 border-green-400"
              >
                <Shield className="h-6 w-6 text-white" />
                <Lock className="h-5 w-5 text-white/80" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">100% SECURE</p>
                  <p className="text-xs text-white/80">SSL Encrypted</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
