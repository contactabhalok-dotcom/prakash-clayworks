'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const sizes = {
  sm: { icon: 88, text: 'text-base' },
  md: { icon: 96, text: 'text-lg' },
  lg: { icon: 108, text: 'text-xl' },
};

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
          <Image
            src="/images/new.png"
            alt="Prakash Clayworks"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <Image
          src="/images/new.png"
          alt="Prakash Clayworks"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex flex-col justify-center leading-none">
        <span className={cn('font-extrabold text-white tracking-wide leading-none', textSize)}>
          Prakash
        </span>
        <span className="text-terracotta text-xs font-semibold tracking-wider">
          Clayworks Admin
        </span>
      </div>
    </div>
  );
}
