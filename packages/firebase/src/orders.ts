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
  Timestamp,
  limit,
  runTransaction,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Order, OrderStatus, PaymentStatus, CustomerInfo, OrderItem } from '@prakash/types';

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PC${timestamp}${random}`;
}

// Convert Firestore timestamp to Date
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  return result;
}

// Create new order
export async function createOrder(data: {
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'payu' | 'cod';
  payuPaymentId?: string;
  payuTransactionId?: string;
  idempotencyKey?: string;
}): Promise<{ orderId: string; orderNumber: string }> {
  const db = getFirestoreDb();

  // Check for duplicate order using idempotency key
  if (data.idempotencyKey) {
    const existingOrderQuery = query(
      collection(db, COLLECTIONS.ORDERS),
      where('idempotencyKey', '==', data.idempotencyKey),
      limit(1)
    );
    const existingOrderSnapshot = await getDocs(existingOrderQuery);

    if (!existingOrderSnapshot.empty) {
      // Order already exists with this idempotency key
      const existingOrder = existingOrderSnapshot.docs[0];
      console.log('Duplicate order creation prevented:', existingOrder.data().orderNumber);
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.data().orderNumber as string,
      };
    }
  }

  const orderNumber = generateOrderNumber();

  // If payuPaymentId is provided, payment is already completed
  const paymentStatus: PaymentStatus = data.payuPaymentId ? 'paid' : 'pending';

  const orderData = {
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    shipping: data.shipping,
    total: data.total,
    paymentMethod: data.paymentMethod,
    orderNumber,
    paymentStatus,
    orderStatus: 'new' as OrderStatus,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...(data.payuPaymentId && { payuPaymentId: data.payuPaymentId }),
    ...(data.payuTransactionId && { payuTransactionId: data.payuTransactionId }),
    ...(data.idempotencyKey && { idempotencyKey: data.idempotencyKey }),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);

  // Send email notification for new order
  try {
    if (data.customer.email) {
      const { sendOrderPlacedEmail } = await import('./email-service');
      await sendOrderPlacedEmail({
        orderNumber,
        customerName: data.customer.name,
        customerEmail: data.customer.email,
        total: data.total,
        items: data.items,
        shippingAddress: data.customer,
        paymentMethod: data.paymentMethod,
        paymentStatus: paymentStatus,
      });
    }
  } catch (err) {
    console.error('Failed to send order email notification:', err);
    // Don't fail order creation if email fails
  }

  // Notify admin of new order
  try {
    const { notifyNewOrder } = await import('./admin-notifications');
    await notifyNewOrder(orderNumber, data.total, data.customer.name);
  } catch (err) {
    console.error('Failed to send admin notification:', err);
    // Don't fail order creation if notification fails
  }

  return { orderId: docRef.id, orderNumber };
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Order;
}

// Get order by order number
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.ORDERS), where('orderNumber', '==', orderNumber));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamps(doc.data()),
  } as Order;
}

// Get order by PayU transaction ID (for callback processing)
export async function getOrderByPayUTransactionId(txnid: string): Promise<Order | null> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.ORDERS), where('payuTransactionId', '==', txnid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamps(doc.data()),
  } as Order;
}

// Update order status
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ORDERS, id);

  try {
    let orderData: any = null;

    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(docRef);

      if (!orderDoc.exists()) {
        throw new Error('ORDER_NOT_FOUND');
      }

      orderData = orderDoc.data();

      transaction.update(docRef, {
        orderStatus: status,
        updatedAt: Timestamp.now(),
      });
    });

    // Send email notification for status change
    if (orderData && orderData.customer.email) {
      try {
        const { 
          sendOrderConfirmationEmail,
          sendOrderShippedEmail, 
          sendOrderDeliveredEmail,
          sendOrderCancelledEmail 
        } = await import('./email-service');

        const emailData = {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customer.name,
          customerEmail: orderData.customer.email,
          total: orderData.total,
          items: orderData.items,
          shippingAddress: orderData.customer,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
        };

        switch (status) {
          case 'confirmed':
            await sendOrderConfirmationEmail(emailData);
            break;
          case 'shipped':
            await sendOrderShippedEmail(emailData);
            break;
          case 'delivered':
            await sendOrderDeliveredEmail(emailData);
            break;
          case 'cancelled':
            await sendOrderCancelledEmail(emailData);
            break;
        }
      } catch (err) {
        console.error('Failed to send status update email:', err);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    return { success: false, error: error.message };
  }
}

// Update payment status
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  payuData?: { payuTransactionId?: string; payuPaymentId?: string }
): Promise<{ success: boolean; error?: string }> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ORDERS, id);

  try {
    let orderNumber: string | undefined;
    let total: number | undefined;

    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(docRef);

      if (!orderDoc.exists()) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const orderData = orderDoc.data();
      const currentStatus = orderData.paymentStatus;
      orderNumber = orderData.orderNumber;
      total = orderData.total;

      // Prevent duplicate payment confirmations
      if (currentStatus === 'paid' && status === 'paid') {
        throw new Error('ALREADY_PAID');
      }

      transaction.update(docRef, {
        paymentStatus: status,
        ...payuData,
        updatedAt: Timestamp.now(),
      });
    });

    // Notify admin of payment received
    if (status === 'paid' && orderNumber && total) {
      try {
        const { notifyPaymentReceived } = await import('./admin-notifications');
        await notifyPaymentReceived(orderNumber, total);
      } catch (err) {
        console.error('Failed to send admin notification:', err);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update payment status:', error);
    return { success: false, error: error.message };
  }
}

// Admin: Get all orders
export async function getAllOrders(): Promise<Order[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Order[];
}

// Admin: Get orders by status
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('orderStatus', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Order[];
}

// Get orders by customer email
export async function getOrdersByEmail(email: string, limitCount?: number): Promise<Order[]> {
  const db = getFirestoreDb();
  let q;
  if (limitCount) {
    q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('customer.email', '==', email),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('customer.email', '==', email),
      orderBy('createdAt', 'desc')
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Order[];
}

// Get orders by customer phone
export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('customer.phone', '==', phone),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Order[];
}

// Admin: Get order statistics
export async function getOrderStats(): Promise<{
  total: number;
  new: number;
  processing: number;
  completed: number;
  totalRevenue: number;
}> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));

  let total = 0;
  let newOrders = 0;
  let processing = 0;
  let completed = 0;
  let totalRevenue = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    total++;

    if (data.orderStatus === 'new') newOrders++;
    else if (['confirmed', 'packing', 'shipped'].includes(data.orderStatus)) processing++;
    else if (data.orderStatus === 'delivered') completed++;

    if (data.paymentStatus === 'paid') {
      totalRevenue += data.total || 0;
    }
  });

  return { total, new: newOrders, processing, completed, totalRevenue };
}
