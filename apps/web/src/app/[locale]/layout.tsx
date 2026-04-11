import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ChatBot } from '@/components/ui/ChatBot';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsSync } from '@/components/providers/SettingsSync';
import { Toaster } from 'sonner';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <AuthProvider>
      <NextIntlClientProvider messages={messages}>
        <SettingsSync />
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 pb-20 md:pb-0 pt-14 sm:pt-16">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileNav />
          <ChatBot />
        </div>
        <Toaster position="top-right" theme="light" richColors />
      </NextIntlClientProvider>
    </AuthProvider>
  );
}
