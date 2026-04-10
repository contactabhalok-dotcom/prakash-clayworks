'use client';

import { useCallback, useEffect, useState } from 'react';

interface PayUResponse {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  status: string;
  hash: string;
  mihpayid?: string;
  mode?: string;
  error_Message?: string;
}

interface PaymentOptions {
  amount: number; // In rupees
  orderId: string; // Your Firestore order ID
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productInfo: string;
  onSuccess: (response: PayUResponse & { orderId: string }) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
}

export function usePayU() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load PayU Bolt script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.bolt) {
      const script = document.createElement('script');
      script.src = 'https://checkout-static.citruspay.com/bolt/run/bolt.min.js';
      script.async = true;
      script.setAttribute('bolt-color', 'BD6F34');
      script.onload = () => setIsLoaded(true);
      script.onerror = () => console.error('Failed to load PayU SDK');
      document.body.appendChild(script);
    } else if (window.bolt) {
      setIsLoaded(true);
    }
  }, []);

  const initiatePayment = useCallback(
    async (options: PaymentOptions): Promise<void> => {
      if (!isLoaded) {
        options.onError(new Error('PayU SDK not loaded'));
        return;
      }

      setIsProcessing(true);

      try {
        // Generate transaction ID
        const txnid = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

        // Step 1: Generate hash from backend
        const hashResponse = await fetch('/api/payu/generate-hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txnid,
            amount: options.amount.toFixed(2),
            productinfo: options.productInfo,
            firstname: options.customerName,
            email: options.customerEmail,
            phone: options.customerPhone,
            udf1: options.orderId, // Store orderId in udf1
          }),
        });

        const hashData = await hashResponse.json();

        if (!hashData.success) {
          throw new Error(hashData.error || 'Failed to generate payment hash');
        }

        // Step 2: Initialize PayU Bolt
        const payuConfig = {
          key: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY!,
          txnid,
          amount: options.amount.toFixed(2),
          productinfo: options.productInfo,
          firstname: options.customerName,
          email: options.customerEmail,
          phone: options.customerPhone,
          surl: `${window.location.origin}/api/payu/callback`,
          furl: `${window.location.origin}/api/payu/callback`,
          hash: hashData.hash,
          udf1: options.orderId,
        };

        window.bolt?.launch(payuConfig, {
          responseHandler: (response: PayUResponse) => {
            if (response.status === 'success') {
              setIsProcessing(false);
              options.onSuccess({
                ...response,
                orderId: options.orderId,
              });
            } else if (response.status === 'failure') {
              setIsProcessing(false);
              options.onError(new Error(response.error_Message || 'Payment failed'));
            } else {
              setIsProcessing(false);
              options.onCancel?.();
            }
          },
          catchException: (error: Error) => {
            setIsProcessing(false);
            options.onError(new Error(error?.message || 'Payment failed'));
          },
        });
      } catch (error) {
        setIsProcessing(false);
        options.onError(error as Error);
      }
    },
    [isLoaded]
  );

  return {
    isLoaded,
    isProcessing,
    initiatePayment,
  };
}
