import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb } from './config';

const SETTINGS_DOC_ID = 'general';
const SETTINGS_COLLECTION = 'site_settings';

export interface SiteSettings {
  // Business Info
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  address: string;
  businessHours: string;

  // Social Media
  instagram: string;
  facebook: string;
  youtube: string;

  // Shipping & Pricing
  freeShippingThreshold: number;
  shippingCost: number;

  // Tax & GST
  gstNumber: string;
  taxRate: number;

  // About
  aboutUs: string;

  // Metadata
  updatedAt: Date;
}

const DEFAULT_SETTINGS: Omit<SiteSettings, 'updatedAt'> = {
  businessName: 'Prakash Clayworks',
  phone: '+916290351365',
  whatsapp: '916290351365',
  email: 'hello@prakashclayworks.com',
  supportEmail: 'support@prakashclayworks.com',
  address: '34/3/5 old mullajor road jagatdal kolkata 743125 west bengal india',
  businessHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
  instagram: 'https://instagram.com/prakashclayworks',
  facebook: 'https://facebook.com/prakashclayworks',
  youtube: 'https://youtube.com/@prakashclayworks',
  freeShippingThreshold: 500,
  shippingCost: 50,
  gstNumber: '',
  taxRate: 18,
  aboutUs: 'Prakash Clayworks is a traditional pottery business dedicated to preserving the art of handmade clay products. Our skilled artisans create beautiful, eco-friendly products using techniques passed down through generations.',
};

// Get site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getFirestoreDb();
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Return defaults if no settings exist
    return {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date(),
    };
  }

  const data = docSnap.data();
  return {
    businessName: data.businessName || DEFAULT_SETTINGS.businessName,
    phone: data.phone || DEFAULT_SETTINGS.phone,
    whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
    email: data.email || DEFAULT_SETTINGS.email,
    supportEmail: data.supportEmail || DEFAULT_SETTINGS.supportEmail,
    address: data.address || DEFAULT_SETTINGS.address,
    businessHours: data.businessHours || DEFAULT_SETTINGS.businessHours,
    instagram: data.instagram || DEFAULT_SETTINGS.instagram,
    facebook: data.facebook || DEFAULT_SETTINGS.facebook,
    youtube: data.youtube || DEFAULT_SETTINGS.youtube,
    freeShippingThreshold: data.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold,
    shippingCost: data.shippingCost ?? DEFAULT_SETTINGS.shippingCost,
    gstNumber: data.gstNumber || DEFAULT_SETTINGS.gstNumber,
    taxRate: data.taxRate ?? DEFAULT_SETTINGS.taxRate,
    aboutUs: data.aboutUs || DEFAULT_SETTINGS.aboutUs,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

// Save site settings
export async function saveSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

  await setDoc(docRef, {
    ...settings,
    updatedAt: Timestamp.now(),
  });
}

// Update specific settings
export async function updateSiteSettings(settings: Partial<Omit<SiteSettings, 'updatedAt'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

  // Get existing settings first
  const existing = await getSiteSettings();

  await setDoc(docRef, {
    ...existing,
    ...settings,
    updatedAt: Timestamp.now(),
  });
}
