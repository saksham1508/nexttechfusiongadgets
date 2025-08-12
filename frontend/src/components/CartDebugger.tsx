import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addToCart, fetchCart, updateCartItem, clearCart } from '../store/slices/cartSlice';
import { checkAuthentication } from '../utils/authHelpers';
import toast from 'react-hot-toast';

const CartDebugger: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalAmount, isLoading, error } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [testProductId, setTestProductId] = useState('507f1f77bcf86cd799439011');
  
  const authResult = checkAuthentication(user);

  const handleTestAddToCart = async () => {
    if (!authResult.isAuthenticated) {
      toast.error('Please log in first');
      return;
    }
    
    try {
      console.log('🔄 Debug: Testing add to cart with product ID:', testProductId);
      const result = await dispatch(addToCart({ 
        productId: testProductId, 
        quantity: 1 
      })).unwrap();
      console.log('✅ Debug: Add to cart result:', result);
      toast.success('Item added to cart successfully!');
    } catch (error: any) {
      console.error('❌ Debug: Add to cart error:', error);
      toast.error(`Failed to add item: ${error}`);
    }
  };

  const handleClearCart = async () => {
    if (!authResult.isAuthenticated) {
      toast.error('Please log in first');
      return;
    }
    
    try {
      console.log('🔄 Debug: Clearing cart...');
      await dispatch(clearCart()).unwrap();
      toast.success('Cart cleared successfully!');
    } catch (error: any) {
      console.error('❌ Debug: Clear cart error:', error);
      toast.error(`Failed to clear cart: ${error}`);
    }
  };

  const handleFetchCart = async () => {
    if (!authResult.isAuthenticated) {
      toast.error('Please log in first');
      return;
    }
    
    try {
      console.log('🔄 Debug: Fetching cart...');
      const result = await dispatch(fetchCart()).unwrap();
      console.log('✅ Debug: Fetch cart result:', result);
      toast.success('Cart fetched successfully!');
    } catch (error: any) {
      console.error('❌ Debug: Fetch cart error:', error);
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
        <strong>Auth Status:</strong>
        <div>Authenticated: {authResult.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {authResult.user?.name || 'None'}</div>
        <div>Token: {authResult.token ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Cart State:</strong>
        <div>Items: {items.length}</div>
        <div>Total: ₹{totalAmount}</div>
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
        <button onClick={handleTestAddToCart} style={{ marginRight: '5px', marginBottom: '5px' }}>
          Test Add to Cart
        </button>
        <button onClick={handleFetchCart} style={{ marginBottom: '5px' }}>
          Fetch Cart
        </button>
        <button onClick={handleClearCart} style={{ marginBottom: '5px', backgroundColor: '#dc2626', color: 'white' }}>
          Clear Cart
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