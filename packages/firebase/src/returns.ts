import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { ReturnRequest, ReturnStatus } from '@prakash/types';

// Customer: Create return request
export async function createReturnRequest(data: Omit<ReturnRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirestoreDb();
  const docData = {
    ...data,
    status: 'requested' as ReturnStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.RETURN_REQUESTS), docData);

  // Update order with return request ID
  const orderRef = doc(db, COLLECTIONS.ORDERS, data.orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    const existingIds = orderSnap.data().returnRequestIds || [];
    await updateDoc(orderRef, {
      returnRequestIds: [...existingIds, docRef.id],
      orderStatus: 'return_requested',
    });
  }

  return docRef.id;
}

// Customer: Get return requests by order ID
export async function getReturnRequestsByOrderId(orderId: string): Promise<ReturnRequest[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.RETURN_REQUESTS),
    where('orderId', '==', orderId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ReturnRequest[];
}

// Customer: Get return requests by user email
export async function getReturnRequestsByEmail(email: string): Promise<ReturnRequest[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.RETURN_REQUESTS),
    where('customerEmail', '==', email),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ReturnRequest[];
}

// Customer: Get return request by ID
export async function getReturnRequestById(id: string): Promise<ReturnRequest | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.RETURN_REQUESTS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as ReturnRequest;
}

// Admin: Get all return requests
export async function getAllReturnRequests(): Promise<ReturnRequest[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.RETURN_REQUESTS),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ReturnRequest[];
}

// Admin: Get return requests by status
export async function getReturnRequestsByStatus(status: ReturnStatus): Promise<ReturnRequest[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.RETURN_REQUESTS),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ReturnRequest[];
}

// Admin: Update return request status
export async function updateReturnRequestStatus(
  id: string,
  status: ReturnStatus,
  updates: { adminNotes?: string; refundAmount?: number; exchangeOrderNumber?: string } = {}
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.RETURN_REQUESTS, id);
  const data: any = {
    status,
    updatedAt: serverTimestamp(),
    ...updates,
  };
  if (status === 'refunded') {
    data.refundProcessedAt = serverTimestamp();
  }
  await updateDoc(docRef, data);
}

// Admin: Approve return request
export async function approveReturnRequest(id: string, adminNotes?: string): Promise<void> {
  await updateReturnRequestStatus(id, 'approved', { adminNotes });
}

// Admin: Reject return request
export async function rejectReturnRequest(id: string, adminNotes?: string): Promise<void> {
  await updateReturnRequestStatus(id, 'rejected', { adminNotes });
}

// Admin: Delete return request
export async function deleteReturnRequest(id: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTIONS.RETURN_REQUESTS, id), {
    status: 'closed' as ReturnStatus,
    updatedAt: serverTimestamp(),
  });
}
