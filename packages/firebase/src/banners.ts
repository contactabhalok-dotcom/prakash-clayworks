import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Banner } from '@prakash/types';

// Get active banners for homepage
export async function getActiveBanners(): Promise<Banner[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.BANNERS),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Banner[];
}

// Admin: Get all banners
export async function getAllBanners(): Promise<Banner[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.BANNERS), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Banner[];
}

// Admin: Get banner by ID
export async function getBannerById(id: string): Promise<Banner | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.BANNERS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Banner;
}

// Admin: Create banner
export async function createBanner(data: Omit<Banner, 'id'>): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.BANNERS), data);
  return docRef.id;
}

// Admin: Update banner
export async function updateBanner(id: string, data: Partial<Omit<Banner, 'id'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.BANNERS, id);
  await updateDoc(docRef, data);
}

// Admin: Delete banner
export async function deleteBanner(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.BANNERS, id);
  await deleteDoc(docRef);
}

// Admin: Toggle banner active status
export async function toggleBannerStatus(id: string, isActive: boolean): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.BANNERS, id);
  await updateDoc(docRef, { isActive });
}
