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
import type { Category } from '@prakash/types';

// Get all categories ordered by display order
export async function getCategories(): Promise<Category[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.CATEGORIES), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Category;
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Category;
}

// Admin: Create category
export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), data);
  return docRef.id;
}

// Admin: Update category
export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await updateDoc(docRef, data);
}

// Admin: Delete category
export async function deleteCategory(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await deleteDoc(docRef);
}
