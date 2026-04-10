import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Note: Storage is handled by Supabase Storage via API routes
// See apps/*/src/app/api/upload/route.ts for upload functionality

// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ENQUIRIES: 'enquiries',
  BANNERS: 'banners',
  REVIEWS: 'reviews',
  USERS: 'users',
  WALLETS: 'wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  NOTIFICATIONS: 'notifications',
  SAVED_PAYMENTS: 'saved_payments',
  REFUND_ACCOUNTS: 'refund_accounts',
  SUPPORT_TICKETS: 'support_tickets',
  USER_SETTINGS: 'user_settings',
  ADMINS: 'admins',
  COUPONS: 'coupons',
  OFFERS: 'offers',
  RETURN_REQUESTS: 'return_requests',
} as const;
