'use client';

import { useState } from 'react';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { Loader2, Languages } from 'lucide-react';

interface BilingualInputProps {
  label: string;
  enValue: string;
  hiValue: string;
  onEnChange: (value: string) => void;
  onHiChange: (value: string) => void;
  enPlaceholder?: string;
  hiPlaceholder?: string;
  required?: boolean;
  hint?: string;
}

export function BilingualInput({
  label,
  enValue,
  hiValue,
  onEnChange,
  onHiChange,
  enPlaceholder,
  hiPlaceholder,
  required,
  hint,
}: BilingualInputProps) {
  const { translate, translating } = useAutoTranslate(1000);
  const [autoTranslated, setAutoTranslated] = useState(false);

  const triggerTranslate = (englishText: string) => {
    if (!englishText.trim()) return;
    setAutoTranslated(false);
    translate(englishText, (hindi) => {
      onHiChange(hindi);
      setAutoTranslated(true);
    });
  };

  return (
    <div className="space-y-3">
      {/* English */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} (English) {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={enValue}
          onChange={(e) => onEnChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent pr-24"
          placeholder={enPlaceholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => triggerTranslate(enValue)}
          disabled={translating || !enValue.trim()}
          className="absolute right-2 top-[30px] inline-flex items-center gap-1 text-xs bg-terracotta text-white px-2.5 py-1.5 rounded hover:bg-terracotta-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {translating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          Translate
        </button>
      </div>

      {/* Hindi */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
          {label} (Hindi)
          {autoTranslated && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Languages className="h-3 w-3" />
              Auto-translated
            </span>
          )}
        </label>
        <input
          type="text"
          value={hiValue}
          onChange={(e) => {
            setAutoTranslated(false);
            onHiChange(e.target.value);
          }}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
          placeholder={hiPlaceholder}
        />
      </div>

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
