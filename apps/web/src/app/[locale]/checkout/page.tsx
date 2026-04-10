'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { createOrder, updatePaymentStatus, validateCoupon, getProductById, getUserProfile } from '@prakash/firebase';
import { formatPrice, getLocalizedText } from '@/lib/utils';
import {
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  LogIn,
  AlertCircle,
  Tag,
  X,
  MapPin,
  Plus,
  Home,
  Building,
  MapPinned,
  Edit,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import type { UserAddress } from '@prakash/types';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tc = useTranslations('cart');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { items, getSubtotal, getShipping, getTotal, clearCart, updateCartPrices, _hasHydrated } = useCartStore();
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'payu' | 'cod'>('payu');
  const [error, setError] = useState<string | null>(null);
  const [pricesValidated, setPricesValidated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Address selection state
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const totalBeforeDiscount = getTotal();
  const total = totalBeforeDiscount - couponDiscount;

  // Pre-fill user email if logged in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email || '' }));
    }
    if (user?.displayName && !formData.name) {
      setFormData((prev) => ({ ...prev, name: user.displayName || '' }));
    }
  }, [user]);

  // Load saved addresses and select default
  useEffect(() => {
    if (!user?.uid) return;

    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const profile = await getUserProfile(user.uid);
        if (profile && profile.addresses && profile.addresses.length > 0) {
          setSavedAddresses(profile.addresses);

          // Find default address
          const defaultAddr = profile.addresses.find(addr => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setUseNewAddress(false);
            setShowAddressSelector(true); // Auto-show the selector
            // Pre-fill form with default address
            setFormData(prev => ({
              ...prev,
              name: defaultAddr.name || prev.name,
              phone: defaultAddr.phone || prev.phone,
              address: defaultAddr.address || prev.address,
              city: defaultAddr.city || prev.city,
              state: defaultAddr.state || prev.state,
              pincode: defaultAddr.pincode || prev.pincode,
            }));
            toast.success('Default address loaded', {
              description: `${defaultAddr.label} address has been loaded.`,
            });
          } else {
            // No default, use first address
            setSelectedAddressId(profile.addresses[0].id);
            setUseNewAddress(false);
            setShowAddressSelector(true); // Auto-show the selector
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [user?.uid]);

  // Validate and update cart prices on page load
  useEffect(() => {
    if (!_hasHydrated || items.length === 0 || pricesValidated) return;

    const validateAndUpdatePrices = async () => {
      try {
        const productIds = items.map(item => item.productId);
        const currentProducts = await Promise.all(
          productIds.map(id => getProductById(id))
        );

        let updated = false;
        const updatedItems = items.map((item, index) => {
          const current = currentProducts[index];
          if (!current) {
            // Product no longer exists - keep original item
            return item;
          }

          const currentPrice = current.salePrice || current.price;
          const cartPrice = item.salePrice || item.price;

          if (currentPrice !== cartPrice) {
            updated = true;
            return {
              ...item,
              price: current.price,
              salePrice: current.salePrice,
              category: current.category, // Update category too in case it changed
            };
          }
          return item;
        });

        if (updated) {
          updateCartPrices(updatedItems);
          toast.info('Prices updated to current rates', {
            description: 'Cart prices have been refreshed to match current product prices.',
          });
        }

        setPricesValidated(true);
      } catch (error) {
        console.error('Failed to validate cart prices:', error);
        // Don't block checkout on validation error
        setPricesValidated(true);
      }
    };

    validateAndUpdatePrices();
  }, [_hasHydrated, items, pricesValidated, updateCartPrices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  // Handle address selection from saved addresses
  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddressId(address.id);
    setUseNewAddress(false);
    setFormData({
      name: address.name,
      phone: address.phone,
      email: formData.email,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowAddressSelector(false);
    toast.success('Address selected', {
      description: `${address.label} address has been selected for shipping.`,
    });
  };

  // Handle switching to new address entry
  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      name: user?.displayName || '',
      phone: '',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  // Get address icon
  const getAddressIcon = (label: string) => {
    switch (label) {
      case 'home':
        return Home;
      case 'office':
        return Building;
      default:
        return MapPinned;
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const cartItems = items.map(item => ({ category: item.category }));
      const result = await validateCoupon(couponCode, subtotal, cartItems, user?.uid);

      if (result.valid) {
        setAppliedCoupon(couponCode);
        setCouponDiscount(result.discount);
        setCouponError(null);
        toast.success(`Coupon applied!`, {
          description: `You saved ${formatPrice(result.discount)}`,
        });
      } else {
        setCouponError(result.message);
        toast.error('Coupon invalid', {
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
      toast.error('Failed to apply coupon', {
        description: 'Please try again',
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError(null);
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill in ${field}`);
        return false;
      }
    }
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    if (formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PC${timestamp}${random}`;
  };

  // Create order in Firebase
  const createFirebaseOrder = async (method: 'payu' | 'cod') => {
    const orderItems = items.map((item) => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.salePrice || item.price,
      quantity: item.quantity,
    }));

    const { orderId, orderNumber } = await createOrder({
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || user?.email || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      items: orderItems,
      subtotal,
      shipping,
      total,
      paymentMethod: method,
    });

    return { orderId, orderNumber };
  };

  const handleCODOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create order in Firebase
      const { orderNumber } = await createFirebaseOrder('cod');
      clearCart();
      router.push(`/${locale}/order/success?orderNumber=${orderNumber}&method=cod`);
    } catch (error) {
      console.error('COD Order creation error:', error);
      // Fallback - generate local order number and proceed
      const orderNumber = generateOrderNumber();
      clearCart();
      router.push(`/${locale}/order/success?orderNumber=${orderNumber}&method=cod`);
    }
  };

  const handlePayUPayment = async () => {
    if (!validateForm()) return;

    // Check if PayU key is configured
    const payuKey = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY;
    if (!payuKey) {
      console.error('PayU key not configured');
      setError('Payment system is not configured. Please use Cash on Delivery or contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Store checkout data in sessionStorage (order will be created AFTER payment succeeds)
    const checkoutData = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || user?.email || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      items: items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice || item.price,
        quantity: item.quantity,
      })),
      subtotal,
      shipping,
      discount: couponDiscount,
      couponCode: appliedCoupon,
      total,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));
    } catch (error) {
      console.error('Failed to store checkout data:', error);
      setError('Failed to proceed to payment. Please try again.');
      setIsLoading(false);
      return;
    }

    // Redirect to dedicated payment page (no orderId yet)
    const paymentUrl = `/${locale}/checkout/payment?` + new URLSearchParams({
      amount: total.toString(),
      name: formData.name,
      email: formData.email || user?.email || '',
      phone: formData.phone,
    }).toString();

    router.push(paymentUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handlePayUPayment();
    }
  };

  // Show loading until hydrated and auth is checked
  if (!_hasHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-warm-beige/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-terracotta" />
          <p className="text-clay-brown">Loading...</p>
        </div>
      </div>
    );
  }

  // Require login to checkout
  if (!user) {
    return (
      <div className="min-h-screen bg-warm-beige/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <LogIn className="mx-auto mb-4 h-16 w-16 text-clay-brown/30" />
          <h1 className="mb-4 text-2xl font-bold text-clay-brown">
            {tAuth('loginRequired') || 'Login Required'}
          </h1>
          <p className="mb-6 text-gray-600">
            Please login or create an account to continue with your purchase.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/auth/login?redirect=/checkout">
                {tAuth('login') || 'Login'}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signup?redirect=/checkout">
                {tAuth('signup') || 'Sign Up'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm-beige/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-clay-brown/30" />
          <h1 className="mb-4 text-2xl font-bold text-clay-brown">
            Your cart is empty
          </h1>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-beige/20 py-4 sm:py-8 pb-24 sm:pb-8">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/shop"
          className="mb-4 sm:mb-6 inline-flex items-center text-sm sm:text-base text-clay-brown hover:text-terracotta min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-clay-brown">{t('title') || 'Checkout'}</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              {/* Contact Information */}
              <div className="rounded-xl border border-clay-brown/10 bg-white p-4 sm:p-6">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-clay-brown">
                  {t('contactInfo') || 'Contact Information'}
                </h2>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <Input
                    name="name"
                    placeholder={t('name') || 'Full Name'}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder={t('phone') || 'Phone Number'}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('email') || 'Email (optional)'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="sm:col-span-2 min-h-[48px]"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-xl border border-clay-brown/10 bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-clay-brown">
                    {t('shippingAddress') || 'Shipping Address'}
                  </h2>
                  {!loadingAddresses && savedAddresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressSelector(!showAddressSelector)}
                      className="min-h-[40px]"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {showAddressSelector ? 'Hide' : 'Select Saved'}
                    </Button>
                  )}
                </div>

                {/* Selected Address Indicator */}
                {!useNewAddress && selectedAddressId && savedAddresses.length > 0 && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Using saved address: {savedAddresses.find(a => a.id === selectedAddressId)?.label}
                      </span>
                      <button
                        type="button"
                        onClick={handleUseNewAddress}
                        className="ml-auto text-sm text-terracotta hover:text-terracotta/80 font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Addresses Selector */}
                {showAddressSelector && savedAddresses.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-clay-brown">
                        Your Saved Addresses
                      </h3>
                      <Link href="/addresses/new">
                        <Button type="button" variant="ghost" size="sm" className="min-h-[32px] h-8 px-2">
                          <Plus className="h-3 w-3 mr-1" />
                          Add New
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {savedAddresses.map((address) => {
                        const AddressIcon = getAddressIcon(address.label);
                        const isSelected = selectedAddressId === address.id && !useNewAddress;
                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleSelectAddress(address)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-terracotta bg-terracotta/5'
                                : 'border-clay-brown/10 hover:border-terracotta/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${isSelected ? 'text-terracotta' : 'text-gray-500'}`}>
                                <AddressIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium uppercase text-gray-600">
                                    {address.label}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-clay-brown font-medium">{address.name}</p>
                                <p className="text-xs text-gray-600">{address.phone}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {address.address}
                                  {address.landmark && `, ${address.landmark}`}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="text-terracotta">
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-clay-brown/10">
                      <button
                        type="button"
                        onClick={handleUseNewAddress}
                        className="text-sm text-terracotta hover:text-terracotta/80 font-medium"
                      >
                        + Use a different address
                      </button>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <Input
                    name="name"
                    placeholder={t('name') || 'Full Name'}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder={t('phone') || 'Phone Number'}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="address"
                    placeholder={t('address') || 'Street Address'}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="sm:col-span-2 min-h-[48px]"
                  />
                  <Input
                    name="city"
                    placeholder={t('city') || 'City'}
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="state"
                    placeholder={t('state') || 'State'}
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="min-h-[48px]"
                  />
                  <Input
                    name="pincode"
                    placeholder={t('pincode') || 'PIN Code'}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    maxLength={6}
                    className="min-h-[48px]"
                  />
                </div>

                {/* Loading indicator for addresses */}
                {loadingAddresses && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading saved addresses...</span>
                  </div>
                )}

                {/* No saved addresses message */}
                {!loadingAddresses && savedAddresses.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Save addresses in your profile to skip filling them next time!
                    </p>
                    <Link href="/addresses/new">
                      <Button type="button" variant="outline" size="sm" className="mt-2 min-h-[36px]">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Your First Address
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border border-clay-brown/10 bg-white p-4 sm:p-6">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-clay-brown">
                  {t('paymentMethod') || 'Payment Method'}
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                      paymentMethod === 'payu'
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-clay-brown/10 hover:border-terracotta/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payu"
                      checked={paymentMethod === 'payu'}
                      onChange={() => setPaymentMethod('payu')}
                      className="h-5 w-5 text-terracotta"
                    />
                    <CreditCard className="h-6 w-6 text-terracotta" />
                    <div>
                      <p className="font-medium text-clay-brown">Pay Online</p>
                      <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-clay-brown/10 hover:border-terracotta/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-5 w-5 text-terracotta"
                    />
                    <Truck className="h-6 w-6 text-terracotta" />
                    <div>
                      <p className="font-medium text-clay-brown">{t('codOption') || 'Cash on Delivery'}</p>
                      <p className="text-sm text-gray-500">{t('codNote') || 'Pay when you receive'}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 rounded-xl border border-clay-brown/10 bg-white p-4 sm:p-6">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-clay-brown">
                  {t('orderSummary') || 'Order Summary'}
                </h2>

                {/* Items */}
                <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-warm-beige">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={getLocalizedText(item.title, locale)}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-clay-brown">
                          {getLocalizedText(item.title, locale)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice((item.salePrice || item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-clay-brown/10 pt-4">
                  {!appliedCoupon ? (
                    <div>
                      <label className="text-sm font-medium text-clay-brown mb-2 block">
                        Have a coupon code?
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          placeholder="Enter code"
                          disabled={applyingCoupon}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          size="sm"
                          variant="outline"
                        >
                          {applyingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-1">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-700">{appliedCoupon}</p>
                          <p className="text-xs text-green-600">-{formatPrice(couponDiscount)} discount applied</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-clay-brown/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{tc('subtotal') || 'Subtotal'}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{tc('shipping') || 'Shipping'}</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-clay-brown/10 pt-2 text-base font-semibold">
                    <span className="text-clay-brown">{tc('total') || 'Total'}</span>
                    <span className="text-terracotta">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit Button - Desktop */}
                <Button
                  type="submit"
                  size="lg"
                  className="mt-4 sm:mt-6 w-full hidden sm:flex min-h-[48px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('processing') || 'Processing...'}
                    </>
                  ) : paymentMethod === 'cod' ? (
                    t('placeOrder') || 'Place Order'
                  ) : (
                    t('payNow') || `Pay ${formatPrice(total)}`
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Pay Button */}
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-clay-brown/10 p-4 shadow-lg sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-terracotta">{formatPrice(total)}</p>
              </div>
              <Button
                type="submit"
                size="lg"
                className="min-h-[52px] px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : paymentMethod === 'cod' ? (
                  t('placeOrder') || 'Place Order'
                ) : (
                  t('payNow') || 'Pay Now'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
