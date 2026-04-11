import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type {
  UserProfile,
  UserProfileFormData,
  UserAddress,
  UserAddressFormData,
  UserWallet,
  WalletTransaction,
  TransactionType,
  TransactionSource,
  Notification,
  NotificationPreferences,
  SavedPaymentMethod,
  RefundAccount,
  SupportTicket,
  SupportTicketFormData,
  SupportTicketMessage,
  UserSettings,
  OrderStats,
} from '@prakash/types';

// ==================== USER PROFILE ====================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    dateOfBirth: data.dateOfBirth?.toDate(),
    addresses: (data.addresses || []).map((addr: UserAddress & { createdAt: Timestamp; updatedAt: Timestamp }) => ({
      ...addr,
      createdAt: addr.createdAt?.toDate(),
      updatedAt: addr.updatedAt?.toDate(),
    })),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as UserProfile;
}

export async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile> {
  const db = getFirestoreDb();
  const now = new Date();

  const profile: Omit<UserProfile, 'id'> = {
    email,
    displayName,
    addresses: [],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...profile,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  return { ...profile, id: userId };
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfileFormData>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.USERS, userId);

  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.fromDate(new Date()),
  };

  // Include all provided fields - allow empty strings to clear values, but save them as empty string not null
  if ('displayName' in data) {
    updateData.displayName = data.displayName !== undefined ? (data.displayName || '') : null;
  }
  if ('phone' in data) {
    updateData.phone = data.phone !== undefined ? data.phone : null;
  }
  if ('gender' in data) {
    updateData.gender = data.gender !== undefined ? data.gender : null;
  }
  if ('photoURL' in data) {
    updateData.photoURL = data.photoURL !== undefined ? data.photoURL : null;
  }
  if ('dateOfBirth' in data) {
    updateData.dateOfBirth = data.dateOfBirth ? Timestamp.fromDate(data.dateOfBirth) : null;
  }

  console.log('Updating user profile with data:', updateData);
  await updateDoc(docRef, updateData);
}

export async function getOrCreateUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile> {
  const existing = await getUserProfile(userId);
  if (existing) {
    return existing;
  }
  return createUserProfile(userId, email, displayName);
}

// ==================== USER ADDRESSES ====================

export async function addUserAddress(
  userId: string,
  addressData: UserAddressFormData
): Promise<UserAddress> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const now = new Date();

  const newAddress: UserAddress = {
    ...addressData,
    id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  // If this is the default address, unset other defaults first
  if (addressData.isDefault) {
    const profile = await getUserProfile(userId);
    if (profile) {
      const updatedAddresses = profile.addresses.map(addr => ({
        ...addr,
        isDefault: false,
        createdAt: Timestamp.fromDate(addr.createdAt),
        updatedAt: Timestamp.fromDate(addr.updatedAt),
      }));
      await updateDoc(docRef, { addresses: updatedAddresses });
    }
  }

  await updateDoc(docRef, {
    addresses: arrayUnion({
      ...newAddress,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    }),
    updatedAt: Timestamp.fromDate(now),
  });

  return newAddress;
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  addressData: Partial<UserAddressFormData>
): Promise<void> {
  const db = getFirestoreDb();
  const profile = await getUserProfile(userId);

  if (!profile) throw new Error('User profile not found');

  const now = new Date();
  const updatedAddresses = profile.addresses.map(addr => {
    if (addr.id === addressId) {
      return {
        ...addr,
        ...addressData,
        updatedAt: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(addr.createdAt),
      };
    }
    // If updating to default, unset others
    if (addressData.isDefault && addr.isDefault) {
      return {
        ...addr,
        isDefault: false,
        updatedAt: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(addr.createdAt),
      };
    }
    return {
      ...addr,
      createdAt: Timestamp.fromDate(addr.createdAt),
      updatedAt: Timestamp.fromDate(addr.updatedAt),
    };
  });

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    addresses: updatedAddresses,
    updatedAt: Timestamp.fromDate(now),
  });
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<void> {
  const db = getFirestoreDb();
  const profile = await getUserProfile(userId);

  if (!profile) throw new Error('User profile not found');

  const addressToRemove = profile.addresses.find(addr => addr.id === addressId);
  if (!addressToRemove) throw new Error('Address not found');

  const updatedAddresses = profile.addresses
    .filter(addr => addr.id !== addressId)
    .map(addr => ({
      ...addr,
      createdAt: Timestamp.fromDate(addr.createdAt),
      updatedAt: Timestamp.fromDate(addr.updatedAt),
    }));

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    addresses: updatedAddresses,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await updateUserAddress(userId, addressId, { isDefault: true });
}

// ==================== WALLET ====================

export async function getUserWallet(userId: string): Promise<UserWallet | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.WALLETS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    lastUpdated: data.lastUpdated?.toDate(),
  } as UserWallet;
}

export async function getOrCreateWallet(userId: string): Promise<UserWallet> {
  const existing = await getUserWallet(userId);
  if (existing) return existing;

  const db = getFirestoreDb();
  const now = new Date();

  const wallet: UserWallet = {
    userId,
    balance: 0,
    totalCredited: 0,
    totalDebited: 0,
    lastUpdated: now,
  };

  await setDoc(doc(db, COLLECTIONS.WALLETS, userId), {
    ...wallet,
    lastUpdated: Timestamp.fromDate(now),
  });

  return wallet;
}

export async function addWalletTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  source: TransactionSource,
  description: string,
  orderId?: string
): Promise<WalletTransaction> {
  const db = getFirestoreDb();
  const wallet = await getOrCreateWallet(userId);
  const now = new Date();

  let newBalance: number;
  let totalCredited = wallet.totalCredited;
  let totalDebited = wallet.totalDebited;

  if (type === 'credit') {
    newBalance = wallet.balance + amount;
    totalCredited += amount;
  } else {
    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }
    newBalance = wallet.balance - amount;
    totalDebited += amount;
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const transaction: WalletTransaction = {
    id: transactionId,
    userId,
    type,
    amount,
    source,
    description,
    orderId,
    balanceAfter: newBalance,
    createdAt: now,
  };

  // Add transaction
  await setDoc(doc(db, COLLECTIONS.WALLET_TRANSACTIONS, transactionId), {
    ...transaction,
    createdAt: Timestamp.fromDate(now),
  });

  // Update wallet
  await updateDoc(doc(db, COLLECTIONS.WALLETS, userId), {
    balance: newBalance,
    totalCredited,
    totalDebited,
    lastUpdated: Timestamp.fromDate(now),
  });

  return transaction;
}

export async function getWalletTransactions(
  userId: string,
  limitCount = 20
): Promise<WalletTransaction[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.WALLET_TRANSACTIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
    } as WalletTransaction;
  });
}

// ==================== NOTIFICATIONS ====================

export async function getUserNotifications(
  userId: string,
  limitCount = 50
): Promise<Notification[]> {
  const db = getFirestoreDb();
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
      } as Notification;
    });
  } catch (error) {
    // Index may be building or not exist yet - return empty array
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Notification index still building or not available yet');
      return [];
    }
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
    isRead: true,
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const db = getFirestoreDb();
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(docSnap =>
      updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, docSnap.id), { isRead: true })
    );

    await Promise.all(updates);
  } catch (error) {
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Notification index still building or not available yet');
      return;
    }
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = getFirestoreDb();
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Notification index still building or not available yet');
      return 0;
    }
    throw error;
  }
}

// ==================== USER SETTINGS ====================

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate(),
  } as UserSettings;
}

export async function getOrCreateUserSettings(userId: string): Promise<UserSettings> {
  const existing = await getUserSettings(userId);
  if (existing) return existing;

  const db = getFirestoreDb();
  const now = new Date();

  const settings: UserSettings = {
    userId,
    theme: 'system',
    language: 'en',
    textSize: 'medium',
    notificationPreferences: {
      orderUpdates: true,
      promotions: false,
      priceDropAlerts: true,
      newArrivals: true,
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
    },
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTIONS.USER_SETTINGS, userId), {
    ...settings,
    updatedAt: Timestamp.fromDate(now),
  });

  return settings;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTIONS.USER_SETTINGS, userId), {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  const settings = await getOrCreateUserSettings(userId);
  await updateUserSettings(userId, {
    notificationPreferences: {
      ...settings.notificationPreferences,
      ...preferences,
    },
  });
}

// ==================== SUPPORT TICKETS ====================

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

export async function createSupportTicket(
  userId: string,
  userEmail: string,
  userName: string,
  data: SupportTicketFormData
): Promise<SupportTicket> {
  try {
    const db = getFirestoreDb();
    const now = new Date();
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const ticket: SupportTicket = {
      id: ticketId,
      ticketNumber: generateTicketNumber(),
      userId,
      userEmail,
      userName,
      category: data.category,
      subject: data.subject,
      description: data.description,
      orderId: data.orderId,
      priority: 'medium',
      status: 'open',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    // Prepare Firestore data, excluding undefined fields
    const firestoreData: Record<string, unknown> = {
      id: ticketId,
      ticketNumber: ticket.ticketNumber,
      userId,
      userEmail,
      userName,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: 'medium',
      status: 'open',
      messages: [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    // Only add orderId if it's defined and not empty
    if (data.orderId && data.orderId.trim() !== '') {
      firestoreData.orderId = data.orderId;
    }

    console.log('Creating support ticket with ID:', ticketId);
    console.log('Ticket data:', firestoreData);

    await setDoc(doc(db, COLLECTIONS.SUPPORT_TICKETS, ticketId), firestoreData);

    console.log('Support ticket created successfully');

    // Notify admin
    try {
      const { notifyNewTicket } = await import('./admin-notifications');
      await notifyNewTicket(ticket.ticketNumber, ticket.subject, userName, ticketId);
    } catch (err) {
      console.error('Failed to send admin notification:', err);
      // Don't fail ticket creation if notification fails
    }

    return ticket;
  } catch (error) {
    console.error('Error in createSupportTicket:', error);
    throw new Error(`Failed to create support ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const db = getFirestoreDb();
    const q = query(
      collection(db, COLLECTIONS.SUPPORT_TICKETS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    console.log('Fetching support tickets for user:', userId);
    const snapshot = await getDocs(q);
    console.log('Found tickets:', snapshot.size);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate(),
        messages: (data.messages || []).map((msg: SupportTicketMessage & { createdAt: Timestamp }) => ({
          ...msg,
          createdAt: msg.createdAt?.toDate(),
        })),
      } as SupportTicket;
    });
  } catch (error) {
    console.error('Error in getUserSupportTickets:', error);
    throw new Error(`Failed to fetch support tickets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.SUPPORT_TICKETS, ticketId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    resolvedAt: data.resolvedAt?.toDate(),
    messages: (data.messages || []).map((msg: SupportTicketMessage & { createdAt: Timestamp }) => ({
      ...msg,
      createdAt: msg.createdAt?.toDate(),
    })),
  } as SupportTicket;
}

export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  senderType: 'user' | 'admin',
  message: string,
  attachments?: string[]
): Promise<void> {
  const db = getFirestoreDb();
  const now = new Date();

  const newMessage: SupportTicketMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderType,
    message,
    attachments,
    createdAt: now,
  };

  await updateDoc(doc(db, COLLECTIONS.SUPPORT_TICKETS, ticketId), {
    messages: arrayUnion({
      ...newMessage,
      createdAt: Timestamp.fromDate(now),
    }),
    updatedAt: Timestamp.fromDate(now),
    status: senderType === 'admin' ? 'in_progress' : undefined,
  });
}

// ==================== SAVED PAYMENT METHODS ====================

export async function getSavedPaymentMethods(userId: string): Promise<SavedPaymentMethod[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.SAVED_PAYMENTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
    } as SavedPaymentMethod;
  });
}

export async function deleteSavedPaymentMethod(paymentId: string): Promise<void> {
  const db = getFirestoreDb();
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, COLLECTIONS.SAVED_PAYMENTS, paymentId));
}

// ==================== REFUND ACCOUNTS ====================

export async function getRefundAccounts(userId: string): Promise<RefundAccount[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.REFUND_ACCOUNTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
    } as RefundAccount;
  });
}

export async function addRefundAccount(
  userId: string,
  data: Omit<RefundAccount, 'id' | 'userId' | 'createdAt'>
): Promise<RefundAccount> {
  const db = getFirestoreDb();
  const now = new Date();
  const accountId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const account: RefundAccount = {
    id: accountId,
    userId,
    ...data,
    createdAt: now,
  };

  // Remove undefined fields — Firestore doesn't support undefined values
  const cleanAccount: Record<string, any> = {};
  Object.entries(account).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanAccount[key] = value;
    }
  });

  await setDoc(doc(db, COLLECTIONS.REFUND_ACCOUNTS, accountId), {
    ...cleanAccount,
    createdAt: Timestamp.fromDate(now),
  });

  return account;
}

export async function deleteRefundAccount(accountId: string): Promise<void> {
  const db = getFirestoreDb();
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, COLLECTIONS.REFUND_ACCOUNTS, accountId));
}

// ==================== ORDER STATS ====================

export async function getUserOrderStats(userEmail: string): Promise<OrderStats> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('customer.email', '==', userEmail)
  );

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => doc.data());

  const stats: OrderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o =>
      ['new', 'confirmed', 'packing', 'shipped'].includes(o.orderStatus)
    ).length,
    deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
    returnedOrders: 0, // TODO: Add return status when implemented
    totalSpent: orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return stats;
}

// ==================== ADMIN FUNCTIONS ====================

export async function getAllUsers(limitCount = 100): Promise<UserProfile[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      dateOfBirth: data.dateOfBirth?.toDate(),
      addresses: (data.addresses || []).map((addr: UserAddress & { createdAt: Timestamp; updatedAt: Timestamp }) => ({
        ...addr,
        createdAt: addr.createdAt?.toDate(),
        updatedAt: addr.updatedAt?.toDate(),
      })),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as UserProfile;
  });
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.SUPPORT_TICKETS),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      resolvedAt: data.resolvedAt?.toDate(),
      messages: (data.messages || []).map((msg: SupportTicketMessage & { createdAt: Timestamp }) => ({
        ...msg,
        createdAt: msg.createdAt?.toDate(),
      })),
    } as SupportTicket;
  });
}

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicket['status'],
  assignedTo?: string
): Promise<void> {
  const db = getFirestoreDb();
  const now = new Date();

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: Timestamp.fromDate(now),
  };

  if (assignedTo) {
    updateData.assignedTo = assignedTo;
  }

  if (status === 'resolved' || status === 'closed') {
    updateData.resolvedAt = Timestamp.fromDate(now);
  }

  await updateDoc(doc(db, COLLECTIONS.SUPPORT_TICKETS, ticketId), updateData);
}

export async function adminCreditWallet(
  userId: string,
  amount: number,
  description: string
): Promise<WalletTransaction> {
  return addWalletTransaction(userId, 'credit', amount, 'admin_credit', description);
}
