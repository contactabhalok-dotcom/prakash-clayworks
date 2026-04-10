'use client';

import { motion } from 'framer-motion';
import { Shield, CreditCard, Smartphone } from 'lucide-react';

export function PaymentSecurity() {
  return (
    <section className="py-8 sm:py-12 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <CreditCard className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="font-bold text-clay-brown">Multiple Payment Options</h3>
              </div>
              <p className="text-sm text-clay-brown/70">
                Credit Card, Debit Card, UPI, Net Banking & COD
              </p>
            </motion.div>

            {/* Payment Logos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {/* Visa */}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <span className="text-blue-800 font-bold text-xl">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                  <div className="w-6 h-6 rounded-full bg-orange-500 opacity-80 -ml-3"></div>
                </div>
              </div>
              {/* RuPay */}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <span className="text-green-700 font-bold text-lg">RuPay</span>
              </div>
              {/* UPI */}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-purple-600">UPI</span>
              </div>
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center md:text-right"
            >
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-green-500">
                <Shield className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-green-600">100% SECURE</p>
                  <p className="text-xs text-gray-600">SSL Encrypted</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
