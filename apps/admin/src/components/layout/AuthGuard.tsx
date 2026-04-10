'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, admin, loading, error, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not logged in at all - redirect to login
      if (!user && pathname !== '/login') {
        router.push('/login');
      }
      // Logged in but on login page - redirect to dashboard
      else if (user && admin && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, admin, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Loading timed out (no user, no error, not redirected) - show helpful message
  if (!user && !error && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h1>
          <p className="text-slate-600 mb-4">
            Unable to connect to Firebase. Please check your <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">.env.local</code> file.
          </p>
          <div className="text-left bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-500">
            <p>Make sure these variables are set:</p>
            <ul className="mt-1 space-y-0.5 font-mono text-xs">
              <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user && pathname !== '/login') {
    return null;
  }

  // Logged in but not an admin (and not on login page)
  if (user && !admin && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            {error || 'You do not have admin access to this panel. Please contact the administrator if you believe this is an error.'}
          </p>
          <button
            onClick={() => {
              signOut().then(() => router.push('/login'));
            }}
            className="px-6 py-2.5 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
