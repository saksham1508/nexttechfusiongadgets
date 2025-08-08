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
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if user is logged in using Redux state first, then localStorage as fallback
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const isAuthenticated = user || (storedUser && storedToken);
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!product.inStock || product.stockQuantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // User is logged in - use Redux/API cart system
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: quantity 
      })).unwrap();
      toast.success(`Added ${quantity} item(s) to cart successfully`);
      
      // Show smart recommendations modal
      setShowRecommendationsModal(true);
    } catch (error: any) {
      console.error('Cart error:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full h-96 object-cover rounded shadow"
          />
          <div className="flex space-x-2 mt-4">
            {product.images.map((img, i) => (
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
            <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount > 0 && <span className="ml-2 text-red-500">-{discount}%</span>}
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

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stockQuantity === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              !product.inStock || product.stockQuantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {!product.inStock || product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Features and Specs */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Features</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          {product.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-2">Specifications</h2>
        <table className="w-full text-sm text-left text-gray-700">
          <tbody>
            {Object.entries(product.specifications).map(([key, val], i) => (
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
            images: product.images.map(img => ({ url: img, alt: product.name })),
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
