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
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Enquiry, EnquiryFormData, EnquiryStatus } from '@prakash/types';

// Convert Firestore timestamp to Date
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  return result;
}

// Create new enquiry
export async function createEnquiry(data: EnquiryFormData): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.ENQUIRIES), {
    ...data,
    status: 'new' as EnquiryStatus,
    createdAt: Timestamp.now(),
  });

  const enquiryId = docRef.id;

  // Notify admin of new enquiry
  try {
    const { notifyNewEnquiry } = await import('./admin-notifications');
    await notifyNewEnquiry(data.name, data.email || data.phone, enquiryId);
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }

  return enquiryId;
}

// Get enquiry by ID
export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Enquiry;
}

// Admin: Get all enquiries
export async function getAllEnquiries(): Promise<Enquiry[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.ENQUIRIES), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Enquiry[];
}

// Admin: Get enquiries by status
export async function getEnquiriesByStatus(status: EnquiryStatus): Promise<Enquiry[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.ENQUIRIES),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Enquiry[];
}

// Admin: Update enquiry status
export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
  await updateDoc(docRef, { status });
}

// Admin: Delete enquiry
export async function deleteEnquiry(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
  await deleteDoc(docRef);
}

// Get enquiry count for dashboard
export async function getEnquiryStats(): Promise<{ total: number; new: number; contacted: number; closed: number }> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, COLLECTIONS.ENQUIRIES));

  let total = 0;
  let newEnquiries = 0;
  let contacted = 0;
  let closed = 0;

  snapshot.docs.forEach((doc) => {
    total++;
    const status = doc.data().status;
    if (status === 'new') newEnquiries++;
    else if (status === 'contacted') contacted++;
    else if (status === 'closed') closed++;
  });

  return { total, new: newEnquiries, contacted, closed };
}
