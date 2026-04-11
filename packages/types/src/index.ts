// Bilingual text type
export interface LocalizedText {
  en: string;
  hi: string;
}

// ==================== ADMIN TYPES ====================

// Admin Role types
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export type AdminPermission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read' | 'orders:write' | 'orders:delete'
  | 'categories:read' | 'categories:write' | 'categories:delete'
  | 'customers:read' | 'customers:write'
  | 'banners:read' | 'banners:write' | 'banners:delete'
  | 'reviews:read' | 'reviews:write' | 'reviews:delete'
  | 'support:read' | 'support:write'
  | 'enquiries:read' | 'enquiries:write' | 'enquiries:delete'
  | 'settings:read' | 'settings:write'
  | 'admins:read' | 'admins:write' | 'admins:delete';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AdminFormData {
  email: string;
  displayName: string;
  role: AdminRole;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[] | '*'> = {
  super_admin: '*', // All permissions
  admin: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'categories:read', 'categories:write', 'categories:delete',
    'customers:read',
    'banners:read', 'banners:write', 'banners:delete',
    'reviews:read', 'reviews:write', 'reviews:delete',
    'support:read', 'support:write',
    'enquiries:read', 'enquiries:write', 'enquiries:delete',
  ],
  moderator: [
    'products:read',
    'orders:read', 'orders:write',
    'categories:read',
    'customers:read',
    'reviews:read', 'reviews:write',
    'support:read', 'support:write',
    'enquiries:read', 'enquiries:write',
  ],
};

// Product types
export interface Product {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  stock: number;
  dimensions: string;
  weight: string;
  material: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  codAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  title: LocalizedText;
  description: LocalizedText;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  stock: number;
  dimensions: string;
  weight: string;
  material: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  codAvailable: boolean;
}

// Category types
export interface Category {
  id: string;
  name: LocalizedText;
  slug: string;
  image: string;
  order: number;
}

// Order types
export type PaymentMethod = 'payu' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'new' | 'confirmed' | 'packing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'return_approved' | 'return_rejected' | 'return_received' | 'refund_processing' | 'refunded' | 'exchanged' | 'exchange_delivered';

export interface ReturnReason {
  code: string;
  label: string;
}

export type ReturnAction = 'refund' | 'exchange';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'picked_up' | 'refund_processing' | 'refunded' | 'exchange_ordered' | 'exchange_delivered' | 'closed';

export interface RefundBankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerPhone: string;
  // Return details
  itemIndex: number; // Which item in the order is being returned
  itemId: string; // productId
  itemTitle: LocalizedText;
  itemQuantity: number;
  itemPrice: number;
  // Reason
  reason: string;
  reasonDetail?: string;
  images?: string[];
  // Action requested
  action: ReturnAction; // refund or exchange
  exchangeProductId?: string; // If exchange, which product
  // Refund account
  refundAccountId?: string; // Saved UPI/Bank account for refund
  refundAccountType?: 'upi' | 'bank';
  refundUpiId?: string; // UPI ID for refund
  refundBankDetails?: RefundBankDetails; // Bank details for refund
  // Status
  status: ReturnStatus;
  adminNotes?: string;
  refundAmount?: number;
  refundProcessedAt?: Date;
  exchangeOrderNumber?: string; // If exchange, the new order number
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  title: LocalizedText;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  payuTransactionId?: string;
  payuPaymentId?: string;
  returnRequestIds?: string[]; // IDs of return requests for this order
  createdAt: Date;
  updatedAt: Date;
}

// Enquiry types
export type EnquiryStatus = 'new' | 'contacted' | 'closed';
export type BusinessType = 'shop' | 'reseller' | 'decorator' | 'individual' | 'other';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  businessType: BusinessType;
  quantity: string;
  message: string;
  referenceImage?: string;
  status: EnquiryStatus;
  createdAt: Date;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  email?: string;
  businessType: BusinessType;
  quantity: string;
  message: string;
  referenceImage?: string;
}

// Banner types
export interface Banner {
  id: string;
  image: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  buttonText: LocalizedText;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

// Review types
export interface Review {
  id: string;
  productId: string;
  userId?: string;
  customerName: string;
  email?: string;
  rating: number;
  review: string;
  images?: string[];
  isApproved: boolean;
  isVerifiedPurchase?: boolean;
  createdAt: Date;
}

// Cart types
export interface CartItem {
  productId: string;
  title: LocalizedText;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  category: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

// ==================== USER PROFILE TYPES ====================

// User Address types
export interface UserAddress {
  id: string;
  label: string; // e.g., "Home", "Office", "Other"
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddressFormData {
  label: string;
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// User Profile types
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  id: string; // Firebase UID
  email: string;
  displayName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  photoURL?: string;
  addresses: UserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileFormData {
  displayName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  photoURL?: string;
}

// Wallet & Credits types
export type TransactionType = 'credit' | 'debit';
export type TransactionSource = 'order_refund' | 'cashback' | 'referral' | 'admin_credit' | 'order_payment' | 'withdrawal';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  source: TransactionSource;
  description: string;
  orderId?: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface UserWallet {
  userId: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  lastUpdated: Date;
}

// Recently Viewed types
export interface RecentlyViewedItem {
  productId: string;
  title: LocalizedText;
  image: string;
  price: number;
  salePrice?: number;
  viewedAt: Date;
}

// Saved for Later types
export interface SavedForLaterItem {
  productId: string;
  title: LocalizedText;
  image: string;
  price: number;
  salePrice?: number;
  savedAt: Date;
}

// Notification types
export type NotificationType = 'order_update' | 'promotion' | 'price_drop' | 'new_arrival' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: LocalizedText;
  message: LocalizedText;
  image?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  priceDropAlerts: boolean;
  newArrivals: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
}

// Payment Methods types
export type SavedPaymentType = 'upi' | 'card' | 'netbanking';

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  type: SavedPaymentType;
  label: string; // e.g., "Personal UPI", "HDFC Card ending 4242"
  details: {
    upiId?: string;
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    bankName?: string;
  };
  isDefault: boolean;
  createdAt: Date;
}

// Refund Account types
export interface RefundAccount {
  id: string;
  userId: string;
  type: 'bank' | 'upi';
  accountName: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
  isDefault: boolean;
  createdAt: Date;
}

// Support Ticket types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketCategory = 'order' | 'payment' | 'delivery' | 'product' | 'refund' | 'other';

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: TicketCategory;
  subject: string;
  description: string;
  orderId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: SupportTicketMessage[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface SupportTicketFormData {
  category: TicketCategory;
  subject: string;
  description: string;
  orderId?: string;
}

// User Settings types
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  textSize: 'small' | 'medium' | 'large';
  notificationPreferences: NotificationPreferences;
  updatedAt: Date;
}

// Order Statistics (for Account Summary)
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalSpent: number;
}

// ==================== COUPON TYPES ====================

export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string; // Unique coupon code (e.g., "DIWALI25")
  description: string; // Description of the coupon
  type: CouponType; // 'percentage' or 'fixed'
  value: number; // Percentage (e.g., 25 for 25%) or fixed amount (e.g., 100 for ₹100)
  minOrderValue: number; // Minimum order value to apply coupon
  maxDiscount?: number; // Maximum discount amount (for percentage coupons)
  usageLimit: number; // Total number of times coupon can be used (0 = unlimited)
  usedCount: number; // Number of times coupon has been used
  perUserLimit: number; // Number of times one user can use (0 = unlimited)
  validFrom: Date; // Start date
  validUntil: Date; // Expiry date
  isActive: boolean; // Whether coupon is active
  applicableCategories?: string[]; // If set, only applies to these categories
  excludedCategories?: string[]; // Categories where coupon doesn't apply
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponFormData {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories?: string[];
  excludedCategories?: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
}

// ==================== OFFERS & ANNOUNCEMENTS TYPES ====================

export type OfferType = 'discount' | 'deal' | 'announcement' | 'promotion';

export interface Offer {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: OfferType;
  image?: string;
  discount?: number; // Percentage discount (e.g., 20 for 20% off)
  link?: string; // Link to products/category
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  showAsAnnouncement: boolean; // If true, shows as banner on website
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferFormData {
  title: LocalizedText;
  description: LocalizedText;
  type: OfferType;
  image?: string;
  discount?: number;
  link?: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  showAsAnnouncement: boolean;
  order: number;
}
