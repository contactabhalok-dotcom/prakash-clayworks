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
  writeBatch,
  setDoc,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { ReturnRequest, ReturnStatus } from '@prakash/types';

// Customer: Create return request
export async function createReturnRequest(data: Omit<ReturnRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirestoreDb();

  // Remove undefined fields — Firestore doesn't support undefined values
  const cleanData: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });

  const docData = {
    ...cleanData,
    status: 'requested' as ReturnStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Use a batch to create return request and update order simultaneously
  const batch = writeBatch(db);
  
  const returnRequestRef = doc(collection(db, COLLECTIONS.RETURN_REQUESTS));
  batch.set(returnRequestRef, docData);
  
  // Update the order with return request info
  const orderRef = doc(db, COLLECTIONS.ORDERS, data.orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (orderSnap.exists()) {
    const orderData = orderSnap.data();
    const existingReturnIds = orderData.returnRequestIds || [];
    
    batch.update(orderRef, {
      returnRequestIds: [...existingReturnIds, returnRequestRef.id],
      // Set order status to reflect return request
      orderStatus: data.action === 'exchange' ? 'return_requested' : 'return_requested',
      updatedAt: serverTimestamp(),
    });
  }
  
  await batch.commit();

  return returnRequestRef.id;
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
  
  // Also update the order status to reflect the return status
  const returnRequestSnap = await getDoc(docRef);
  if (returnRequestSnap.exists()) {
    const returnData = returnRequestSnap.data();
    if (returnData.orderId) {
      const orderRef = doc(db, COLLECTIONS.ORDERS, returnData.orderId);
      
      // Map return status to order status
      let orderStatus: string = status;
      if (status === 'approved' || status === 'picked_up') {
        orderStatus = 'return_approved';
      } else if (status === 'rejected') {
        orderStatus = 'return_rejected';
      } else if (status === 'refunded' || status === 'refund_processing') {
        orderStatus = status === 'refund_processing' ? 'refund_processing' : 'refunded';
      } else if (status === 'exchange_ordered') {
        orderStatus = 'exchanged';
      } else if (status === 'exchange_delivered') {
        orderStatus = 'exchange_delivered';
      }
      
      await updateDoc(orderRef, {
        orderStatus,
        updatedAt: serverTimestamp(),
      });
    }
  }
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
