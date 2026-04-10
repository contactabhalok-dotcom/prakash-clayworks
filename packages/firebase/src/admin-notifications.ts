import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'new_ticket' | 'new_enquiry' | 'new_review' | 'low_stock' | 'payment_received';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    ticketId?: string;
    ticketNumber?: string;
    enquiryId?: string;
    productId?: string;
    reviewId?: string;
    amount?: number;
  };
}

// Create admin notification
export async function createAdminNotification(
  type: AdminNotification['type'],
  title: string,
  message: string,
  link?: string,
  metadata?: AdminNotification['metadata']
): Promise<void> {
  const db = getFirestoreDb();
  const now = new Date();

  await addDoc(collection(db, 'admin_notifications'), {
    type,
    title,
    message,
    link,
    read: false,
    createdAt: Timestamp.fromDate(now),
    metadata: metadata || {},
  });
}

// Get all admin notifications
export async function getAdminNotifications(limitCount = 50): Promise<AdminNotification[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'admin_notifications'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
  })) as AdminNotification[];
}

// Get unread admin notifications
export async function getUnreadAdminNotifications(): Promise<AdminNotification[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
  })) as AdminNotification[];
}

// Get unread count
export async function getUnreadAdminNotificationCount(): Promise<number> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Mark notification as read
export async function markAdminNotificationAsRead(notificationId: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, 'admin_notifications', notificationId), {
    read: true,
  });
}

// Mark all notifications as read
export async function markAllAdminNotificationsAsRead(): Promise<void> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(docSnap =>
    updateDoc(doc(db, 'admin_notifications', docSnap.id), { read: true })
  );

  await Promise.all(updates);
}

// Helper functions to create specific notifications
export async function notifyNewOrder(orderNumber: string, amount: number, customerName: string): Promise<void> {
  await createAdminNotification(
    'new_order',
    'New Order Received',
    `Order #${orderNumber} from ${customerName} for ₹${amount.toLocaleString('en-IN')}`,
    `/orders/${orderNumber}`,
    { orderNumber, amount }
  );
}

export async function notifyNewTicket(ticketNumber: string, subject: string, userName: string, ticketId: string): Promise<void> {
  await createAdminNotification(
    'new_ticket',
    'New Support Ticket',
    `${ticketNumber} - "${subject}" from ${userName}`,
    `/support/${ticketId}`,
    { ticketNumber, ticketId }
  );
}

export async function notifyNewEnquiry(name: string, email: string, enquiryId: string): Promise<void> {
  await createAdminNotification(
    'new_enquiry',
    'New Enquiry Received',
    `${name} (${email}) submitted a new enquiry`,
    `/enquiries/${enquiryId}`,
    { enquiryId }
  );
}

export async function notifyNewReview(customerName: string, rating: number, reviewId: string): Promise<void> {
  await createAdminNotification(
    'new_review',
    'New Product Review',
    `${rating}⭐ review from "${customerName}" - Awaiting approval`,
    `/reviews`,
    { reviewId }
  );
}

export async function notifyPaymentReceived(orderNumber: string, amount: number): Promise<void> {
  await createAdminNotification(
    'payment_received',
    'Payment Received',
    `Payment of ₹${amount.toLocaleString('en-IN')} received for order #${orderNumber}`,
    `/orders/${orderNumber}`,
    { orderNumber, amount }
  );
}

export async function notifyLowStock(productName: string, stock: number, productId: string): Promise<void> {
  await createAdminNotification(
    'low_stock',
    'Low Stock Alert',
    `"${productName}" is low on stock (${stock} remaining)`,
    `/products/${productId}`,
    { productId }
  );
}
