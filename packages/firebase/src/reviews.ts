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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Review } from '@prakash/types';

// Convert Firestore timestamp to Date
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  return result;
}

// Get approved reviews for homepage
export async function getApprovedReviews(): Promise<Review[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where('isApproved', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Review[];
}

// Admin: Get all reviews
export async function getAllReviews(): Promise<Review[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.REVIEWS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Review[];
}

// Admin: Get review by ID
export async function getReviewById(id: string): Promise<Review | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Review;
}

// Admin: Create review
export async function createReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
    ...data,
    createdAt: Timestamp.now(),
  });

  const reviewId = docRef.id;

  // Notify admin of new review (only if not approved - needs review)
  if (!data.isApproved) {
    try {
      const { notifyNewReview } = await import('./admin-notifications');
      await notifyNewReview(data.customerName, data.rating, reviewId);
    } catch (err) {
      console.error('Failed to send admin notification:', err);
    }
  }

  return reviewId;
}

// Admin: Update review
export async function updateReview(id: string, data: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await updateDoc(docRef, data);
}

// Admin: Delete review
export async function deleteReview(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await deleteDoc(docRef);
}

// Admin: Approve/Unapprove review
export async function toggleReviewApproval(id: string, isApproved: boolean): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.REVIEWS, id);
  await updateDoc(docRef, { isApproved });
}

// Customer-facing: Get approved reviews for a specific product
export async function getProductReviews(productId: string): Promise<Review[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where('productId', '==', productId),
    where('isApproved', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Review[];
}

// Customer-facing: Get review stats for a product (average rating, count)
export async function getProductReviewStats(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
}> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where('productId', '==', productId),
    where('isApproved', '==', true)
  );
  const snapshot = await getDocs(q);
  
  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const rating = data.rating as number;
    ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
    totalRating += rating;
  });
  
  const totalReviews = snapshot.docs.length;
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
  
  return { averageRating, totalReviews, ratingBreakdown };
}

// Customer-facing: Submit a product review
export async function submitProductReview(data: {
  productId: string;
  userId?: string;
  customerName: string;
  email?: string;
  rating: number;
  review: string;
  images?: string[];
}): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
    ...data,
    isApproved: false, // Requires admin approval
    isVerifiedPurchase: false,
    createdAt: Timestamp.now(),
  });

  const reviewId = docRef.id;

  // Notify admin of new review
  try {
    const { notifyNewReview } = await import('./admin-notifications');
    await notifyNewReview(data.customerName, data.rating, reviewId);
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }

  return reviewId;
}

// Check if user already reviewed a product
export async function hasUserReviewedProduct(productId: string, userId: string): Promise<boolean> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.REVIEWS),
    where('productId', '==', productId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
