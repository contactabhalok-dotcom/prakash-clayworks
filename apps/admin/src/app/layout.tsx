import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Admin | Prakash Clayworks",
  description: "Admin panel for Prakash Clayworks",
  icons: {
    icon: '/new.png',
    apple: '/new.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster position="top-right" theme="light" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
