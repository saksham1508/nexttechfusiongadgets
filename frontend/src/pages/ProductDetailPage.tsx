import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import CartRecommendationsModal from '../components/CartRecommendationsModal';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  numReviews: number;
  specifications: { [key: string]: string };
  features: string[];
  warranty: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // Helper: try to show a fallback product for demo IDs or cached snapshot
      const tryFallback = (): boolean => {
        try {
          const fallbackProducts: Product[] = [
            {
              _id: 'fp_1',
              name: 'iPhone 15 Pro',
              description: 'Latest iPhone with A17 Pro chip',
              price: 99999,
              originalPrice: 109999,
              category: 'smartphones',
              brand: 'Apple',
              images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],
              inStock: true,
              stockQuantity: 25,
              rating: 4.8,
              numReviews: 1250,
              specifications: {},
              features: [],
              warranty: ''
            },
            {
              _id: 'fp_2',
              name: 'Samsung Galaxy S24 Ultra',
              description: 'Premium Android smartphone with S Pen',
              price: 899,
              originalPrice: 999,
              category: 'smartphones',
              brand: 'Samsung',
              images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
              inStock: true,
              stockQuantity: 18,
              rating: 4.7,
              numReviews: 980,
              specifications: {},
              features: [],
              warranty: ''
            },
            {
              _id: 'fp_3',
              name: 'Sony WH-1000XM5',
              description: 'Industry-leading noise canceling headphones',
              price: 349,
              originalPrice: 399,
              category: 'audio',
              brand: 'Sony',
              images: ['https://images.unsplash.com/photo-1518443895914-3c7b99bc3a3b?w=600'],
              inStock: true,
              stockQuantity: 40,
              rating: 4.8,
              numReviews: 1500,
              specifications: {},
              features: [],
              warranty: ''
            }
          ];

          const fp = fallbackProducts.find((p) => p._id === id);
          if (fp) {
            setProduct(fp);
            toast.success('Showing demo product');
            return true;
          }

          // Try cached snapshot saved from product card/cart flows
          const snapRaw = localStorage.getItem(`productSnapshot:${id}`);
          if (snapRaw) {
            const snap = JSON.parse(snapRaw);
            const normalizedFromSnap: Product = {
              _id: snap._id || (id as string),
              name: snap.name || 'Product',
              description: '',
              price: Number(snap.price) || 0,
              originalPrice: undefined,
              category: 'General',
              brand: '',
              images: Array.isArray(snap.images) ? snap.images.map((i: any) => i.url) : [],
              inStock: (snap.stock ?? 0) > 0,
              stockQuantity: snap.stock ?? 0,
              rating: 0,
              numReviews: 0,
              specifications: {},
              features: [],
              warranty: ''
            };
            setProduct(normalizedFromSnap);
            toast.success('Showing cached product');
            return true;
          }
        } catch {}
        return false;
      };

      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${base}/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            const handled = tryFallback();
            if (handled) {
              setLoading(false);
              return;
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        // Backend may wrap payload: { success, data: { product } }
        const apiProduct = json.data?.product || json.data || json.product || json;
        // Normalize to ensure required fields exist for vendor-created items
        const normalized: Product = {
          _id: apiProduct._id || apiProduct.id, // robust: support both
          name: apiProduct.name || 'Unnamed Product',
          description: apiProduct.description || '',
          price: Number(apiProduct.price) || 0,
          originalPrice: apiProduct.originalPrice ? Number(apiProduct.originalPrice) : undefined,
          category: apiProduct.category || 'General',
          brand: apiProduct.brand || '',
          images: Array.isArray(apiProduct.images) ? apiProduct.images : (apiProduct.image ? [apiProduct.image] : []),
          inStock: typeof apiProduct.inStock === 'boolean' ? apiProduct.inStock : (typeof apiProduct.countInStock === 'number' ? apiProduct.countInStock > 0 : true),
          stockQuantity: typeof apiProduct.stockQuantity === 'number' ? apiProduct.stockQuantity : (typeof apiProduct.countInStock === 'number' ? apiProduct.countInStock : 0),
          rating: typeof apiProduct.rating === 'number' ? apiProduct.rating : 0,
          numReviews: typeof apiProduct.numReviews === 'number' ? apiProduct.numReviews : 0,
          specifications: apiProduct.specifications && typeof apiProduct.specifications === 'object' ? apiProduct.specifications : {},
          features: Array.isArray(apiProduct.features) ? apiProduct.features : [],
          warranty: apiProduct.warranty || ''
        };
        setProduct(normalized);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        if (!tryFallback()) {
          toast.error('Failed to load product details');
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Track product view/click to update vendor analytics in real-time
  useEffect(() => {
    if (!product?._id) return;
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    // Fire-and-forget; ignore errors
    fetch(`${base}/products/${product._id}/track`, { method: 'POST' }).catch(() => {});
  }, [product?._id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!product.inStock || product.stockQuantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Check if user is logged in using Redux state first, then localStorage as fallback
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const isAuthenticated = user || (storedUser && storedToken);
    
    console.log('🔍 Add to cart - Auth check:', {
      reduxUser: !!user,
      storedUser: !!storedUser,
      storedToken: !!storedToken,
      isAuthenticated
    });
    
    if (isAuthenticated) {
      // User is logged in - use Redux/API cart system
      try {
        // Save a product snapshot so mock fallback uses correct name/price/images
        try {
          const pid = (product as any)._id || (product as any).id;
          localStorage.setItem(
            `productSnapshot:${pid}`,
            JSON.stringify({
              _id: pid,
              name: product.name,
              price: product.price,
              images: (product.images || []).map((img) => (
                typeof img === 'string' ? { url: img, alt: product.name } : { url: (img as any).url, alt: (img as any).alt || product.name }
              )),
              stock: product.stockQuantity,
            })
          );
        } catch {}

        console.log('🚀 Adding to authenticated cart:', { productId: product._id, quantity });
        await dispatch(addToCart({ 
          productId: (product as any)._id || (product as any).id, 
          quantity: quantity 
        })).unwrap();
        toast.success(`Added ${quantity} item(s) to cart successfully`);
        
        // Show smart recommendations modal
        setShowRecommendationsModal(true);
      } catch (error: any) {
        console.error('❌ Cart error:', error);
        console.error('❌ Error details:', error.message || error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to add item to cart. Please try again.';
        if (error.message) {
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = 'Please log in again to add items to cart.';
            // Clear invalid auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          } else if (error.message.includes('Network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast.error(errorMessage);
      }
    } else {
      // Guest flow: Use mock cart via thunk fallback for smooth UX
      try {
        await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
        toast.success(`Added ${quantity} item(s) to cart`);
      } catch (error) {
        toast.error('Failed to add item to cart');
      }
    }
  };

  // Buy Now: add to cart then go to checkout payment options
  const handleBuyNow = async () => {
    if (!product) return;
    if (!product.inStock || product.stockQuantity === 0) {
      toast.error('Product is out of stock');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      navigate('/checkout');
    } catch (error: any) {
      toast.error('Failed to proceed to checkout');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

  const discount = product?.originalPrice
    ? Math.max(0, Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))
    : 0;
  const savingsAmount = product?.originalPrice ? Math.max(0, product.originalPrice - product.price) : 0;

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-red-600">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <button onClick={() => navigate('/products')} className="text-blue-600 mb-4">
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img
            src={(product.images && product.images.length > 0 ? product.images[selectedImage] : 'https://via.placeholder.com/600x400?text=No+Image')}
            alt={product.name}
            className="w-full h-96 object-cover rounded shadow"
          />
          <div className="flex space-x-2 mt-4">
            {(product.images || []).map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 object-cover cursor-pointer border ${
                  i === selectedImage ? 'border-blue-500' : 'border-gray-300'
                } rounded`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-600 mb-4">Brand: {product.brand}</p>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-base text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Save {discount}%
                </span>
              )}
            </div>
            {product.originalPrice && discount > 0 && (
              <div className="text-sm text-gray-600 mt-1">You save {formatPrice(savingsAmount)} on MRP</div>
            )}
          </div>

          <p className="text-gray-700 mb-4">{product.description}</p>

          <div className="flex items-center mb-4">
            <label className="mr-2">Qty:</label>
            <input
              type="number"
              value={quantity}
              min={1}
              max={product.stockQuantity}
              onChange={(e) => setQuantity(Math.min(product.stockQuantity, Math.max(1, +e.target.value)))}
              className="w-16 p-1 border border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-500">{product.stockQuantity} in stock</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stockQuantity === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                !product.inStock || product.stockQuantity === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Add to Cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock || product.stockQuantity === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                !product.inStock || product.stockQuantity === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={() => navigate(`/products`)}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              View More Products
            </button>
          </div>
        </div>
      </div>

      {/* Features and Specs */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Features</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          {(product.features || []).map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-2">Specifications</h2>
        <table className="w-full text-sm text-left text-gray-700">
          <tbody>
            {Object.entries(product.specifications || {}).map(([key, val], i) => (
              <tr key={i} className="border-b">
                <th className="py-2 pr-4 capitalize">{key}</th>
                <td className="py-2">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Smart Recommendations Modal */}
      {product && (
        <CartRecommendationsModal
          isOpen={showRecommendationsModal}
          onClose={() => setShowRecommendationsModal(false)}
          addedProduct={{
            _id: product._id,
            name: product.name,
            price: product.price,
            images: (product.images || []).map(img => ({ url: img, alt: product.name })),
            rating: product.rating,
            numReviews: product.numReviews,
            category: product.category,
            brand: product.brand
          }}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
