'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, AlertCircle, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const router = useRouter();

  const error = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'NOT_ADMIN') {
        setLocalError('You do not have admin access. Please contact the administrator.');
      } else if (error.message === 'ADMIN_DEACTIVATED') {
        setLocalError('Your admin account has been deactivated. Please contact the administrator.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    if (error?.includes('admin access') || error?.includes('deactivated')) {
      return <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23bd6f34' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-br from-terracotta via-terracotta to-terracotta-dark p-8 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />

            <div className="relative">
              <div className="mx-auto mb-4 flex justify-center">
                <Logo size="lg" variant="icon" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-white/80 text-sm mt-2">
                Sign in to access the admin panel
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3">
                  {getErrorIcon()}
                  <div>
                    <p className="font-semibold">Authentication Failed</p>
                    <p className="mt-1 text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@prakashclayworks.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all duration-200 hover:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all duration-200 hover:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Help text */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Only authorized administrators can access this panel.
                <br />
                Contact your system administrator if you need access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Prakash Clayworks Admin Panel
        </p>
      </div>
    </div>
  );
}
