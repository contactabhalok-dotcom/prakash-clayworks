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
  increment,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Coupon, CouponFormData, CouponValidationResult } from '@prakash/types';

// Convert Firestore timestamp to Date
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  if (result.validFrom instanceof Timestamp) {
    result.validFrom = result.validFrom.toDate();
  }
  if (result.validUntil instanceof Timestamp) {
    result.validUntil = result.validUntil.toDate();
  }
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  return result;
}

// Get all coupons (Admin)
export async function getAllCoupons(): Promise<Coupon[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.COUPONS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Coupon[];
}

// Get active coupons (Public - for website)
export async function getActiveCoupons(): Promise<Coupon[]> {
  const db = getFirestoreDb();
  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTIONS.COUPONS),
    where('isActive', '==', true),
    where('validFrom', '<=', now),
    where('validUntil', '>=', now)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Coupon[];
}

// Get coupon by code
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.COUPONS),
    where('code', '==', code.toUpperCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamps(doc.data()),
  } as Coupon;
}

// Get coupon by ID
export async function getCouponById(id: string): Promise<Coupon | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.COUPONS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Coupon;
}

// Validate and calculate coupon discount
export async function validateCoupon(
  code: string,
  cartTotal: number,
  cartItems: { category: string }[],
  userId?: string
): Promise<CouponValidationResult> {
  try {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid coupon code',
      };
    }

    // Check if active
    if (!coupon.isActive) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon is no longer active',
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon is not yet valid',
      };
    }
    if (now > coupon.validUntil) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon has expired',
      };
    }

    // Check minimum order value
    if (cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      };
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'This coupon has reached its usage limit',
      };
    }

    // Check category restrictions
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableItem = cartItems.some((item) =>
        coupon.applicableCategories!.includes(item.category)
      );
      if (!hasApplicableItem) {
        return {
          valid: false,
          discount: 0,
          message: 'This coupon is not applicable to items in your cart',
        };
      }
    }

    if (coupon.excludedCategories && coupon.excludedCategories.length > 0) {
      const hasExcludedItem = cartItems.some((item) =>
        coupon.excludedCategories!.includes(item.category)
      );
      if (hasExcludedItem) {
        return {
          valid: false,
          discount: 0,
          message: 'This coupon cannot be applied to some items in your cart',
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed cart total
    discount = Math.min(discount, cartTotal);

    return {
      valid: true,
      discount: Math.round(discount),
      message: 'Coupon applied successfully!',
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      valid: false,
      discount: 0,
      message: 'Error validating coupon',
    };
  }
}

// Admin: Create coupon
export async function createCoupon(data: CouponFormData): Promise<string> {
  const db = getFirestoreDb();

  // Check if code already exists
  const existing = await getCouponByCode(data.code);
  if (existing) {
    throw new Error('Coupon code already exists');
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries({
      ...data,
      code: data.code.toUpperCase(),
      usedCount: 0,
      validFrom: Timestamp.fromDate(data.validFrom),
      validUntil: Timestamp.fromDate(data.validUntil),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }).filter(([_, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, COLLECTIONS.COUPONS), cleanData);
  return docRef.id;
}

// Admin: Update coupon
export async function updateCoupon(
  id: string,
  data: Partial<CouponFormData>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.COUPONS, id);

  // If code is being updated, check if it already exists
  if (data.code) {
    const existing = await getCouponByCode(data.code);
    if (existing && existing.id !== id) {
      throw new Error('Coupon code already exists');
    }
  }

  const updateData: Record<string, unknown> = {
    ...data,
  };

  if (data.code) {
    updateData.code = data.code.toUpperCase();
  }
  if (data.validFrom) {
    updateData.validFrom = Timestamp.fromDate(data.validFrom);
  }
  if (data.validUntil) {
    updateData.validUntil = Timestamp.fromDate(data.validUntil);
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries({
      ...updateData,
      updatedAt: Timestamp.now(),
    }).filter(([_, value]) => value !== undefined)
  );

  await updateDoc(docRef, cleanData);
}

// Admin: Delete coupon
export async function deleteCoupon(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.COUPONS, id);
  await deleteDoc(docRef);
}

// Increment coupon usage count (called when order is placed)
export async function incrementCouponUsage(couponId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.COUPONS, couponId);
  await updateDoc(docRef, {
    usedCount: increment(1),
  });
}
