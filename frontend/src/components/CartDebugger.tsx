import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { addToCart, fetchCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const CartDebugger: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalAmount, isLoading, error } = useAppSelector(state => state.cart);
  const [testProductId, setTestProductId] = useState('507f1f77bcf86cd799439011');

  const handleTestAddToCart = async () => {
    try {
      console.log('Testing add to cart with product ID:', testProductId);
      const result = await dispatch(addToCart({ 
        productId: testProductId, 
        quantity: 1 
      })).unwrap();
      console.log('Add to cart result:', result);
      toast.success('Item added to cart successfully!');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(`Failed to add item: ${error}`);
    }
  };

  const handleFetchCart = async () => {
    try {
      console.log('Fetching cart...');
      const result = await dispatch(fetchCart()).unwrap();
      console.log('Fetch cart result:', result);
      toast.success('Cart fetched successfully!');
    } catch (error: any) {
      console.error('Fetch cart error:', error);
      toast.error(`Failed to fetch cart: ${error}`);
    }
  };

  const checkAuthStatus = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('Auth status:', { 
      hasUser: !!user, 
      hasToken: !!token,
      user: user ? JSON.parse(user) : null,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h3>Cart Debugger</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Cart State:</strong>
        <div>Items: {items.length}</div>
        <div>Total: ${totalAmount}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          value={testProductId} 
          onChange={(e) => setTestProductId(e.target.value)}
          placeholder="Product ID"
          style={{ width: '100%', marginBottom: '5px' }}
        />
        <button onClick={handleTestAddToCart} style={{ marginRight: '5px' }}>
          Test Add to Cart
        </button>
        <button onClick={handleFetchCart}>
          Fetch Cart
        </button>
      </div>

      <button onClick={checkAuthStatus} style={{ width: '100%' }}>
        Check Auth Status
      </button>

      {items.length > 0 && (
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          <strong>Cart Items:</strong>
          {items.map((item, index) => (
            <div key={index}>
              {item.product?.name || 'Unknown'} x{item.quantity}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartDebugger;