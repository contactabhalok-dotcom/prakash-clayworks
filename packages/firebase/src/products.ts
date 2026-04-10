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
  startAfter,
  type QueryConstraint,
  type DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb, COLLECTIONS } from './config';
import type { Product, ProductFormData, ProductFilters, PaginatedResponse } from '@prakash/types';

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

// Get all products with optional filters and pagination
export async function getProducts(
  filters?: ProductFilters,
  pageSize = 12,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<Product>> {
  const db = getFirestoreDb();
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const constraints: QueryConstraint[] = [];

  // Apply filters
  if (filters?.category) {
    console.log('[getProducts] Applying category filter:', filters.category);
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.isNewArrival) {
    constraints.push(where('isNewArrival', '==', true));
  }
  if (filters?.isBestseller) {
    constraints.push(where('isBestseller', '==', true));
  }
  if (filters?.isFeatured) {
    constraints.push(where('isFeatured', '==', true));
  }

  // Apply sorting
  // Note: When filtering by category, we MUST sort in memory to avoid requiring a composite index
  // This is because Firestore requires an index for queries that filter on one field and sort by another
  const needsMemorySort = !!filters?.category || !!filters?.isNewArrival || !!filters?.isBestseller || !!filters?.isFeatured;

  // Only apply orderBy if not filtering (to avoid index requirement)
  if (!needsMemorySort && filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price_desc':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'oldest':
        constraints.push(orderBy('createdAt', 'asc'));
        break;
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }
  } else if (!needsMemorySort) {
    // Default sort when no filters
    constraints.push(orderBy('createdAt', 'desc'));
  }

  // Pagination
  constraints.push(limit(pageSize));
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(productsRef, ...constraints);
  const snapshot = await getDocs(q);

  const items: Product[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Product[];

  // Filter by price range in memory (Firestore doesn't support range on different field than sort)
  let filteredItems = items;
  if (filters?.minPrice !== undefined) {
    filteredItems = filteredItems.filter((p) => (p.salePrice || p.price) >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    filteredItems = filteredItems.filter((p) => (p.salePrice || p.price) <= filters.maxPrice!);
  }

  // Apply in-memory sorting if needed (when category filter is applied)
  if (needsMemorySort) {
    switch (filters?.sortBy) {
      case 'price_asc':
        filteredItems.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price_desc':
        filteredItems.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'oldest':
        filteredItems.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return aTime - bTime;
        });
        break;
      case 'newest':
      default:
        filteredItems.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        break;
    }
  }

  return {
    items: filteredItems,
    total: filteredItems.length,
    page: 1,
    pageSize,
    totalPages: 1,
  };
}

// Get featured products
export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where('isFeatured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Product[];
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Product;
}

// Get products by category
export async function getProductsByCategory(categorySlug: string, count = 12): Promise<Product[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where('category', '==', categorySlug),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Product[];
}

// Get related products (same category, excluding current product)
export async function getRelatedProducts(productId: string, category: string, count = 4): Promise<Product[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where('category', '==', category),
    limit(count + 1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    .filter((p) => p.id !== productId)
    .slice(0, count) as Product[];
}

// Admin: Create product
export async function createProduct(data: ProductFormData): Promise<string> {
  const db = getFirestoreDb();

  // Filter out undefined values to prevent Firebase errors
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    ...cleanData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Admin: Update product
export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);

  // Filter out undefined values to prevent Firebase errors
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: Timestamp.now(),
  });
}

// Admin: Delete product
export async function deleteProduct(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
}

// Admin: Get all products (for admin list)
export async function getAllProducts(): Promise<Product[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Product[];
}
