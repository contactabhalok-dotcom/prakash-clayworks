'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook that auto-translates English text to Hindi using the free MyMemory API.
 * Returns a translate function and loading state.
 * Debounces translation requests to avoid rate limits.
 */
export function useAutoTranslate(debounceMs = 1200) {
  const [translating, setTranslating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const translate = useCallback(
    async (text: string, onResult: (hindi: string) => void) => {
      if (!text.trim()) {
        onResult('');
        return;
      }

      // Cancel previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        // Abort any in-flight request
        if (abortRef.current) {
          abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        setTranslating(true);
        try {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
          const response = await fetch(url, {
            signal: abortRef.current.signal,
          });
          const data = await response.json();

          if (data.responseStatus === 200 && data.responseData?.translatedText) {
            onResult(data.responseData.translatedText);
          } else {
            console.warn('Translation API response:', data);
          }
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Translation error:', error);
          }
        } finally {
          setTranslating(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { translate, translating };
}
