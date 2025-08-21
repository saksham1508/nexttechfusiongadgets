import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { Eye, Pencil, ArrowLeft } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  brand?: string;
  images?: string[];
  countInStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

const VendorProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/products/${id}`);
        const data = res.data?.data?.product || res.data?.data || res.data?.product || res.data;
        setProduct(data);
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6 text-red-600">Product not found.</div>;

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="container-modern py-6">
      <button onClick={() => navigate('/vendor/dashboard')} className="text-gray-700 hover:text-blue-600 flex items-center mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4">
            <img
              src={images[0] || 'https://via.placeholder.com/800x500?text=No+Image'}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
            />
            <div className="flex gap-2 mt-3">
              {images.slice(0,4).map((img, i) => (
                <img key={i} src={img} alt={`img-${i}`} className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            {product.brand && <p className="text-gray-600 mb-2">Brand: {product.brand}</p>}
            {product.category && <p className="text-gray-600 mb-2">Category: {product.category}</p>}
            <div className="text-xl font-semibold text-gray-900 mb-4">₹{Number(product.price).toLocaleString()}</div>
            {typeof product.countInStock === 'number' && (
              <p className="text-sm text-gray-500 mb-4">{product.countInStock} in stock</p>
            )}
            {product.description && <p className="text-gray-700 mb-6">{product.description}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/vendor/dashboard`)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
              >
                Close
              </button>

            </div>

            <p className="text-xs text-gray-400 mt-6">Vendor view: Customer actions like Add to Cart are hidden here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductViewPage;