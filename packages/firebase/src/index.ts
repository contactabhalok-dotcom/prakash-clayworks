// Config exports
export {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  COLLECTIONS,
} from './config';

// Products exports
export {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from './products';

// Categories exports
export {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories';

// Orders exports
export {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getOrderByPayUTransactionId,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  getOrdersByStatus,
  getOrdersByEmail,
  getOrdersByPhone,
  getOrderStats,
} from './orders';

// Enquiries exports
export {
  createEnquiry,
  getEnquiryById,
  getAllEnquiries,
  getEnquiriesByStatus,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats,
} from './enquiries';

// Banners exports
export {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from './banners';

// Reviews exports
export {
  getApprovedReviews,
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewApproval,
  getProductReviews,
  getProductReviewStats,
  submitProductReview,
  hasUserReviewedProduct,
} from './reviews';

// Users exports
export {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getOrCreateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserWallet,
  getOrCreateWallet,
  addWalletTransaction,
  getWalletTransactions,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  getUserSettings,
  getOrCreateUserSettings,
  updateUserSettings,
  updateNotificationPreferences,
  createSupportTicket,
  getUserSupportTickets,
  getSupportTicketById,
  addTicketMessage,
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  getRefundAccounts,
  addRefundAccount,
  deleteRefundAccount,
  getUserOrderStats,
  getAllUsers,
  getAllSupportTickets,
  updateTicketStatus,
  adminCreditWallet,
} from './users';

// Admin exports
export {
  verifyAdmin,
  getAllAdmins,
  createAdmin,
  updateAdminRole,
  updateAdminDisplayName,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin,
  updateAdminLastLogin,
  hasPermission,
  getAdminByEmail,
} from './admins';

// Storage exports
export {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  validateImageFile,
  createPreviewURL,
  revokePreviewURL,
} from './storage';

export type { UploadProgress, UploadResult } from './storage';

// Coupons exports
export {
  getAllCoupons,
  getActiveCoupons,
  getCouponByCode,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage,
} from './coupons';

// Admin Notifications exports
export {
  createAdminNotification,
  getAdminNotifications,
  getUnreadAdminNotifications,
  getUnreadAdminNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  notifyNewOrder,
  notifyNewTicket,
  notifyNewEnquiry,
  notifyNewReview,
  notifyPaymentReceived,
  notifyLowStock,
} from './admin-notifications';

export type { AdminNotification } from './admin-notifications';

// Email Service exports
export {
  sendOrderConfirmationEmail,
  sendOrderPlacedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from './email-service';

// Offers exports
export {
  getActiveOffers,
  getActiveAnnouncements,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
} from './offers';

// Site Settings exports
export {
  getSiteSettings,
  saveSiteSettings,
  updateSiteSettings,
} from './site-settings';

export type { SiteSettings } from './site-settings';

// Returns exports
export {
  createReturnRequest,
  getReturnRequestsByOrderId,
  getReturnRequestsByEmail,
  getReturnRequestById,
  getAllReturnRequests,
  getReturnRequestsByStatus,
  updateReturnRequestStatus,
  approveReturnRequest,
  rejectReturnRequest,
  deleteReturnRequest,
} from './returns';
