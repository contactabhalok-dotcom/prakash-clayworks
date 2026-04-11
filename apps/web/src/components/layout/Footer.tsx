'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('common');

  const quickLinks = [
    { href: '/', label: tc('home') },
    { href: '/shop', label: tc('shop') },
    { href: '/about', label: tc('about') },
    { href: '/contact', label: tc('contact') },
  ];

  const customerLinks = [
    { href: '/track-order', label: 'Track Order' },
    { href: '/privacy', label: t('privacyPolicy') },
    { href: '/terms', label: t('termsConditions') },
    { href: '/returns', label: t('returnPolicy') },
    { href: '/faq', label: t('faq') },
    { href: '/shipping', label: t('shippingInfo') },
  ];

  const socialLinks = [
    { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/prakashclayworks', icon: Instagram, label: 'Instagram' },
    { href: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/prakashclayworks', icon: Facebook, label: 'Facebook' },
    { href: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@prakashclayworks', icon: Youtube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-clay-brown text-white overflow-x-hidden">
      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-12">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="sm" variant="full" theme="dark" />
            </Link>
            <p className="text-xs sm:text-sm text-white/80">{t('description')}</p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 p-2 transition-colors hover:bg-terracotta"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-terracotta"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('customerService')}</h3>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-terracotta"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('newsletter')}</h3>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
              <Button variant="gold" size="default">
                {t('subscribe')}
              </Button>
            </form>

            <div className="space-y-2 pt-4">
              <a
                href="tel:+916290351365"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-terracotta"
              >
                <Phone className="h-4 w-4" />
                +91 6290351365
              </a>
              <a
                href="mailto:ROHANPANDITYY35@GMAIL.COM"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-terracotta"
              >
                <Mail className="h-4 w-4" />
                ROHANPANDITYY35@GMAIL.COM
              </a>
              <div className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{process.env.NEXT_PUBLIC_ADDRESS || '123 Clay Street, Pottery Lane, India 123456'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 text-sm text-white/60 sm:flex-row">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4">
            <span>Made with clay & code in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
