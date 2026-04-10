'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirebaseAuth, verifyAdmin, updateAdminLastLogin, hasPermission as checkPermission } from '@prakash/firebase';
import type { AdminUser, AdminPermission, AdminRole, ROLE_PERMISSIONS } from '@prakash/types';

// Role permissions mapping (duplicated here for client-side use)
const ROLE_PERMISSIONS_MAP: Record<AdminRole, AdminPermission[] | '*'> = {
  super_admin: '*',
  admin: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'categories:read', 'categories:write', 'categories:delete',
    'customers:read',
    'banners:read', 'banners:write', 'banners:delete',
    'reviews:read', 'reviews:write', 'reviews:delete',
    'support:read', 'support:write',
    'enquiries:read', 'enquiries:write', 'enquiries:delete',
  ],
  moderator: [
    'products:read',
    'orders:read', 'orders:write',
    'categories:read',
    'customers:read',
    'reviews:read', 'reviews:write',
    'support:read', 'support:write',
    'enquiries:read', 'enquiries:write',
  ],
};

interface AuthContextType {
  user: User | null;
  admin: AdminUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();

    // Safety timeout: if onAuthStateChanged doesn't fire within 10s, stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);

      if (firebaseUser) {
        // Verify user is an admin
        try {
          const adminUser = await verifyAdmin(firebaseUser.uid);
          if (adminUser) {
            setAdmin(adminUser);
            setError(null);
          } else {
            setAdmin(null);
            setError('You do not have admin access');
          }
        } catch (err) {
          console.error('Error verifying admin:', err);
          setAdmin(null);
          setError('Error verifying admin access');
        }
      } else {
        setAdmin(null);
        setError(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const auth = getFirebaseAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Verify the user is an admin
      const adminUser = await verifyAdmin(userCredential.user.uid);

      if (!adminUser) {
        // Sign out if not an admin
        await firebaseSignOut(auth);
        throw new Error('NOT_ADMIN');
      }

      if (!adminUser.isActive) {
        await firebaseSignOut(auth);
        throw new Error('ADMIN_DEACTIVATED');
      }

      // Update last login
      await updateAdminLastLogin(userCredential.user.uid);

      setAdmin(adminUser);
    } catch (err: unknown) {
      const error = err as Error & { code?: string };

      if (error.message === 'NOT_ADMIN') {
        setError('You do not have admin access. Please contact the administrator.');
        throw error;
      }

      if (error.message === 'ADMIN_DEACTIVATED') {
        setError('Your admin account has been deactivated. Please contact the administrator.');
        throw error;
      }

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
        throw error;
      }

      if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
        throw error;
      }

      setError('An error occurred during sign in. Please try again.');
      throw error;
    }
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    setAdmin(null);
    setError(null);
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!admin) return false;
    return checkPermission(admin, permission, ROLE_PERMISSIONS_MAP);
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, error, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
