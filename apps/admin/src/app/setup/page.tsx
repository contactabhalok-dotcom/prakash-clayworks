'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth, createAdmin } from '@prakash/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Shield, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function SetupPage() {
  const [email, setEmail] = useState('admin@prakashclayworks.com');
  const [displayName, setDisplayName] = useState('Super Admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatedPassword = password || 'Admin@123456';

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getFirebaseAuth();

      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        generatedPassword
      );

      // Step 2: Create admin document in Firestore
      await createAdmin(
        userCredential.user.uid,
        email,
        displayName,
        'super_admin'
      );

      setSuccess(true);
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in with existing credentials.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(error.message || 'Failed to create admin account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `Email: ${email}\nPassword: ${generatedPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-green-200">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">Admin Account Created!</h1>
            <p className="text-slate-600 mb-6">Use these credentials to login:</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left relative">
              <button
                onClick={copyCredentials}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
              </button>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-mono font-bold text-clay-brown mb-3">{email}</p>
              <p className="text-sm text-slate-500 mb-1">Password</p>
              <p className="font-mono font-bold text-terracotta">{generatedPassword}</p>
            </div>

            <div className="space-y-3">
              <a href="/login">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Login Page
                </Button>
              </a>
              <p className="text-xs text-slate-400">
                After logging in, delete this setup page file for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-br from-terracotta via-terracotta to-terracotta-dark p-8 text-center">
            <Shield className="h-12 w-12 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
            <p className="text-white/80 text-sm mt-2">
              Create your first admin account
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSetup} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="mt-1 text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Super Admin"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="admin@prakashclayworks.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin@123456 (auto-generated if empty)"
                  disabled={loading}
                />
                <p className="text-xs text-slate-400">
                  {password ? 'Your custom password' : `Using auto-generated: ${generatedPassword}`}
                </p>
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
                    Creating Admin Account...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 text-center leading-relaxed">
                <strong>Note:</strong> This will create both a Firebase Auth user and an admin document in Firestore.
                <br />
                After setup, you can login at <a href="/login" className="underline font-medium">/login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
