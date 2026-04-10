'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  theme?: 'light' | 'dark';
}

const sizes = {
  xs: { icon: 64, text: 'text-base tracking-wide' },
  sm: { icon: 88, text: 'text-lg tracking-wide' },
  md: { icon: 104, text: 'text-xl tracking-wide' },
  lg: { icon: 128, text: 'text-2xl tracking-wide' },
  xl: { icon: 152, text: 'text-3xl tracking-wider' },
  '2xl': { icon: 180, text: 'text-4xl tracking-wider' },
};

export function Logo({
  className,
  size = 'lg',
  variant = 'full',
  theme = 'light'
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  const textColor = theme === 'light' ? 'text-clay-brown' : 'text-white';
  const subTextColor = theme === 'light' ? 'text-terracotta' : 'text-gold';

  const LogoIcon = () => (
    <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
      <Image
        src="/images/new.png"
        alt="Prakash Clayworks"
        fill
        className="object-contain"
        priority
      />
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col justify-center leading-none', className)}>
        <span className={cn('font-extrabold tracking-wide', textSize, textColor)}>
          Prakash
        </span>
        <span className={cn('font-semibold tracking-wider', subTextColor, size === 'sm' ? 'text-xs' : 'text-sm')}>
          Clayworks
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <LogoIcon />
      <div className="flex flex-col justify-center leading-none">
        <span className={cn('font-extrabold tracking-wide', textSize, textColor)}>
          Prakash
        </span>
        <span className={cn('font-semibold tracking-wider', subTextColor, size === 'sm' ? 'text-xs' : size === 'xs' ? 'text-[10px]' : 'text-sm')}>
          Clayworks
        </span>
      </div>
    </div>
  );
}

export function LogoMark({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative flex-shrink-0", className)} style={{ width: size, height: size, maxHeight: size, overflow: 'hidden' }}>
      <Image
        src="/images/new.png"
        alt="Prakash Clayworks"
        fill
        className="object-contain"
      />
    </div>
  );
}
