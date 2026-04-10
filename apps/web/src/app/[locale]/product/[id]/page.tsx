import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { getProductById, getRelatedProducts, getAllProducts } from '@prakash/firebase';
import type { Product } from '@prakash/types';

// Fallback products in case Firebase fails
const fallbackProducts: Product[] = [
  {
    id: '1',
    title: { en: 'Traditional Diya Set', hi: 'पारंपरिक दीया सेट' },
    description: { en: 'Handcrafted clay diya set of 12. Perfect for Diwali celebrations and daily puja. Each diya is carefully crafted by skilled artisans using traditional techniques passed down through generations.', hi: '12 का हस्तनिर्मित मिट्टी दीया सेट। दिवाली उत्सव और दैनिक पूजा के लिए बिल्कुल सही।' },
    price: 299,
    salePrice: 249,
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
    ],
    category: 'diya',
    stock: 50,
    dimensions: '5cm x 5cm',
    weight: '200g',
    material: 'Pure Terracotta Clay',
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    codAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: { en: 'Ganesh Murti', hi: 'गणेश मूर्ति' },
    description: { en: 'Beautiful handmade Ganesh idol. This exquisite piece is perfect for your home temple or as a decorative piece. Crafted with attention to every detail by our master artisans.', hi: 'सुंदर हस्तनिर्मित गणेश मूर्ति। यह उत्कृष्ट टुकड़ा आपके घर मंदिर या सजावटी टुकड़े के लिए एकदम सही है।' },
    price: 599,
    images: [
      'https://images.unsplash.com/photo-1567591370504-80e1bf5c0ebb?w=800&q=80',
    ],
    category: 'murti',
    stock: 25,
    dimensions: '15cm x 10cm',
    weight: '500g',
    material: 'Pure Terracotta Clay',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    codAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: { en: 'Terracotta Planter', hi: 'टेराकोटा प्लांटर' },
    description: { en: 'Elegant clay planter for indoor plants. Add a touch of rustic charm to your home with this beautiful terracotta planter. Perfect for small to medium sized plants.', hi: 'इनडोर पौधों के लिए सुंदर मिट्टी का प्लांटर। इस सुंदर टेराकोटा प्लांटर के साथ अपने घर में देहाती आकर्षण जोड़ें।' },
    price: 449,
    salePrice: 399,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
    ],
    category: 'planters',
    stock: 40,
    dimensions: '20cm x 18cm',
    weight: '800g',
    material: 'Pure Terracotta Clay',
    isFeatured: true,
    isNewArrival: true,
    isBestseller: false,
    codAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: { en: 'Decorative Wall Hanging', hi: 'सजावटी वॉल हैंगिंग' },
    description: { en: 'Handpainted terracotta wall decor. Transform your walls with this stunning piece of art. Each piece is unique and hand-painted with traditional motifs.', hi: 'हाथ से पेंट किया गया टेराकोटा वॉल डेकोर। इस अद्भुत कला के टुकड़े के साथ अपनी दीवारों को बदलें।' },
    price: 799,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    category: 'homeDecor',
    stock: 15,
    dimensions: '30cm x 25cm',
    weight: '600g',
    material: 'Pure Terracotta Clay',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: false,
    codAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('product');

  // Try to fetch product from Firebase
  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    // Fetch product from Firebase
    product = await getProductById(id);

    if (product) {
      // Get related products from Firebase
      relatedProducts = await getRelatedProducts(id, product.category, 4);
    }
  } catch (error) {
    console.error('Error fetching product from Firebase:', error);
  }

  // If not found in Firebase, try fallback products
  if (!product) {
    product = fallbackProducts.find((p) => p.id === id) || null;

    if (product) {
      // Get related products from fallback
      relatedProducts = fallbackProducts
        .filter((p) => p.category === product!.category && p.id !== product!.id)
        .slice(0, 4);
    }
  }

  // If still not found, show 404
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Product Section */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            images={product.images}
            productName={product.title.en}
          />

          {/* Info */}
          <ProductInfo product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-12 md:mt-16">
            <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold text-clay-brown">
              {t('relatedProducts')}
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-10 sm:mt-12 md:mt-16">
          <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold text-clay-brown">
            Customer Reviews
          </h2>
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
