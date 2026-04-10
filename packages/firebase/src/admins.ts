import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { AdminUser, AdminRole, AdminPermission, ROLE_PERMISSIONS } from '@prakash/types';

// Helper to convert Firestore timestamps to Date
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = (result[key] as Timestamp).toDate();
    }
  }
  return result;
}

// Verify if a user is an admin and return admin data
export async function verifyAdmin(userId: string): Promise<AdminUser | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = convertTimestamps(docSnap.data());

  // Check if admin is active
  if (!data.isActive) {
    return null;
  }

  return {
    id: docSnap.id,
    email: data.email as string,
    displayName: data.displayName as string,
    role: data.role as AdminRole,
    isActive: data.isActive as boolean,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
    lastLoginAt: data.lastLoginAt as Date | undefined,
  };
}

// Get all admins
export async function getAllAdmins(): Promise<AdminUser[]> {
  const db = getFirestoreDb();
  const adminsRef = collection(db, COLLECTIONS.ADMINS);
  const q = query(adminsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamps(doc.data());
    return {
      id: doc.id,
      email: data.email as string,
      displayName: data.displayName as string,
      role: data.role as AdminRole,
      isActive: data.isActive as boolean,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
      lastLoginAt: data.lastLoginAt as Date | undefined,
    };
  });
}

// Create a new admin
export async function createAdmin(
  userId: string,
  email: string,
  displayName: string,
  role: AdminRole
): Promise<AdminUser> {
  const db = getFirestoreDb();
  const now = new Date();

  const adminData = {
    email,
    displayName,
    role,
    isActive: true,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  await setDoc(doc(db, COLLECTIONS.ADMINS, userId), adminData);

  return {
    id: userId,
    email,
    displayName,
    role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

// Update admin role
export async function updateAdminRole(userId: string, role: AdminRole): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);

  await updateDoc(docRef, {
    role,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Update admin display name
export async function updateAdminDisplayName(userId: string, displayName: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);

  await updateDoc(docRef, {
    displayName,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Deactivate admin (soft delete)
export async function deactivateAdmin(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);

  await updateDoc(docRef, {
    isActive: false,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Activate admin
export async function activateAdmin(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);

  await updateDoc(docRef, {
    isActive: true,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

// Delete admin permanently
export async function deleteAdmin(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);
  await deleteDoc(docRef);
}

// Update last login timestamp
export async function updateAdminLastLogin(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.ADMINS, userId);

  await updateDoc(docRef, {
    lastLoginAt: Timestamp.fromDate(new Date()),
  });
}

// Check if admin has a specific permission
export function hasPermission(
  admin: AdminUser,
  permission: AdminPermission,
  rolePermissions: Record<AdminRole, AdminPermission[] | '*'>
): boolean {
  const permissions = rolePermissions[admin.role];

  // Super admin has all permissions
  if (permissions === '*') {
    return true;
  }

  return permissions.includes(permission);
}

// Get admin by email
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = getFirestoreDb();
  const adminsRef = collection(db, COLLECTIONS.ADMINS);
  const querySnapshot = await getDocs(adminsRef);

  for (const doc of querySnapshot.docs) {
    const data = convertTimestamps(doc.data());
    if (data.email === email) {
      return {
        id: doc.id,
        email: data.email as string,
        displayName: data.displayName as string,
        role: data.role as AdminRole,
        isActive: data.isActive as boolean,
        createdAt: data.createdAt as Date,
        updatedAt: data.updatedAt as Date,
        lastLoginAt: data.lastLoginAt as Date | undefined,
      };
    }
  }

  return null;
}
