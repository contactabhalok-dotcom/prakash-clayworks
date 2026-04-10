import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prakash Clayworks - Handcrafted Terracotta Products',
  description:
    'Discover authentic handmade terracotta diyas, murtis, planters, and home decor. Crafted with love by skilled artisans. Pan India delivery available.',
  keywords: [
    'terracotta',
    'diya',
    'murti',
    'clay products',
    'handmade',
    'eco-friendly',
    'home decor',
    'Indian crafts',
  ],
  authors: [{ name: 'Prakash Clayworks' }],
  icons: {
    icon: '/new.png',
    apple: '/new.png',
  },
  openGraph: {
    title: 'Prakash Clayworks - Handcrafted Terracotta Products',
    description:
      'Discover authentic handmade terracotta diyas, murtis, planters, and home decor.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Prakash Clayworks',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
