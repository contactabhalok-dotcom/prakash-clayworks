'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getActiveAnnouncements } from '@prakash/firebase';
import type { Offer } from '@prakash/types';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // JS-based single-item marquee
  useEffect(() => {
    if (!trackRef.current || !itemRef.current || !wrapRef.current) return;

    const itemW = itemRef.current.offsetWidth;
    const wrapW = wrapRef.current.offsetWidth;

    if (itemW <= 0 || wrapW <= 0) return;

    const speed = 50; // px per second
    let lastTime = performance.now();
    let running = true;
    let pos = wrapW; // start off-screen right

    const animate = (now: number) => {
      if (!running) return;
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      pos -= speed * delta;

      // When fully off left, reset to right
      if (pos <= -itemW) {
        pos = wrapW;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${pos}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [announcements, currentIndex]);

  if (dismissed || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];
  const title = locale === 'hi' && currentAnnouncement.title.hi
    ? currentAnnouncement.title.hi
    : currentAnnouncement.title.en;
  const description = locale === 'hi' && currentAnnouncement.description.hi
    ? currentAnnouncement.description.hi
    : currentAnnouncement.description.en;

  const ItemContent = () => (
    <>
      <Sparkles className="a-icon flex-shrink-0" />
      <span className="a-txt">{title}</span>
      {description && (
        <>
          <span className="a-dot" />
          <span className="a-txt">{description}</span>
        </>
      )}
    </>
  );

  return (
    <div className="bg-gradient-to-r from-terracotta via-terracotta-dark to-terracotta text-white overflow-hidden relative shadow-lg shadow-terracotta/20">
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1.5 hover:bg-white/30 rounded-full transition-colors bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-white" />
      </button>

      {/* Shop Now */}
      {currentAnnouncement.link && (
        <Link
          href={currentAnnouncement.link}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 inline-flex items-center gap-1 px-2.5 py-1 bg-white text-terracotta rounded-full text-[10px] font-bold hover:bg-white/90 transition-colors shadow-md"
        >
          Shop <ChevronRight className="h-3 w-3" />
        </Link>
      )}

      {/* Marquee */}
      <div ref={wrapRef} className="py-2.5 pr-16 relative overflow-hidden">
        {/* Invisible measurement */}
        <span ref={itemRef} className="a-item a-measure" aria-hidden="true">
          <ItemContent />
        </span>

        {/* Single animated item */}
        <div ref={trackRef} className="a-track">
          <span className="a-item">
            <ItemContent />
          </span>
        </div>
      </div>

      {/* Dots */}
      {announcements.length > 1 && (
        <div className="absolute bottom-0.5 left-2 flex gap-1 z-20">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-3' : 'bg-white/40 w-1.5'
              }`}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        .a-track {
          position: absolute;
          top: 0;
          left: 0;
          width: max-content;
          will-change: transform;
        }
        .a-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-shrink: 0;
          white-space: nowrap;
          gap: clamp(6px, 1.5vw, 10px);
          padding-right: 24px;
        }
        .a-measure {
          position: absolute;
          visibility: hidden;
          pointer-events: none;
        }
        .a-icon {
          width: clamp(12px, 3vw, 16px);
          height: clamp(12px, 3vw, 16px);
          color: #FCD34D;
          flex-shrink: 0;
        }
        .a-txt {
          font-size: clamp(10px, 2.5vw, 14px);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .a-dot {
          width: clamp(3px, 0.8vw, 5px);
          height: clamp(3px, 0.8vw, 5px);
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
