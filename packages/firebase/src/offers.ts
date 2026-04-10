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
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Offer } from '@prakash/types';

// Get active offers (for display on website)
export async function getActiveOffers(): Promise<Offer[]> {
  const db = getFirestoreDb();
  // Simple query - filter and sort in JavaScript to avoid composite index
  const q = query(
    collection(db, COLLECTIONS.OFFERS),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  const offers = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        validFrom: data.validFrom?.toDate(),
        validUntil: data.validUntil?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Offer;
    })
    .filter((offer) => {
      const validFrom = offer.validFrom?.getTime() || 0;
      const validUntil = offer.validUntil?.getTime() || Date.now();
      const currentTime = Date.now();
      return validFrom <= currentTime && validUntil >= currentTime;
    });
  // Sort by order in JavaScript
  return offers.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Get active announcements (for banner display)
export async function getActiveAnnouncements(): Promise<Offer[]> {
  const db = getFirestoreDb();
  // Simple query - filter in JavaScript to avoid composite index requirement
  const q = query(
    collection(db, COLLECTIONS.OFFERS),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  const offers = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        validFrom: data.validFrom?.toDate(),
        validUntil: data.validUntil?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Offer;
    })
    .filter((offer) => {
      // Filter for announcements and valid date range
      if (!offer.showAsAnnouncement) return false;
      const validFrom = offer.validFrom?.getTime() || 0;
      const validUntil = offer.validUntil?.getTime() || Date.now();
      const currentTime = Date.now();
      return validFrom <= currentTime && validUntil >= currentTime;
    });
  // Sort by order in JavaScript
  return offers.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Admin: Get all offers
export async function getAllOffers(): Promise<Offer[]> {
  const db = getFirestoreDb();
  // Simple query without composite index requirement - sort in JavaScript
  const snapshot = await getDocs(collection(db, COLLECTIONS.OFFERS));
  const offers = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      validFrom: data.validFrom?.toDate(),
      validUntil: data.validUntil?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Offer;
  });
  // Sort by order in JavaScript to avoid index requirement
  return offers.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Admin: Get offer by ID
export async function getOfferById(id: string): Promise<Offer | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.OFFERS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    validFrom: docSnap.data().validFrom?.toDate(),
    validUntil: docSnap.data().validUntil?.toDate(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Offer;
}

// Admin: Create offer
export async function createOffer(data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirestoreDb();
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.OFFERS), {
    ...data,
    validFrom: Timestamp.fromDate(data.validFrom),
    validUntil: Timestamp.fromDate(data.validUntil),
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

// Admin: Update offer
export async function updateOffer(id: string, data: Partial<Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.OFFERS, id);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.validFrom) {
    updateData.validFrom = Timestamp.fromDate(data.validFrom);
  }
  if (data.validUntil) {
    updateData.validUntil = Timestamp.fromDate(data.validUntil);
  }

  await updateDoc(docRef, updateData);
}

// Admin: Delete offer
export async function deleteOffer(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.OFFERS, id);
  await deleteDoc(docRef);
}

// Admin: Toggle offer active status
export async function toggleOfferStatus(id: string, isActive: boolean): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.OFFERS, id);
  await updateDoc(docRef, {
    isActive,
    updatedAt: Timestamp.now(),
  });
}
