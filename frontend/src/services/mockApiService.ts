// Mock API Service for development/fallback
export interface MockCartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; alt: string }[];
    stock: number;
  };
  quantity: number;
}

export interface MockCartResponse {
  items: MockCartItem[];
  totalAmount: number;
}

class MockApiService {
  private readonly CART_STORAGE_KEY = 'mockCart';

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get cart items from localStorage
  private getCartItems(): MockCartItem[] {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  // Save cart items to localStorage
  private saveCartItems(items: MockCartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      console.log('💾 Mock API: Cart saved to localStorage', items);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  async getCart(): Promise<MockCartResponse> {
    await this.delay(300);
    const cartItems = this.getCartItems();
    console.log('🔄 Mock API: Getting cart', cartItems);
    
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      items: cartItems,
      totalAmount
    };
  }

  async addToCart(productId: string, quantity: number): Promise<MockCartResponse> {
    await this.delay(500);
    console.log('🔄 Mock API: Adding to cart', { productId, quantity });

    const cartItems = this.getCartItems();

    // Mock product data - in real app this would come from product service
    const mockProduct = {
      _id: productId,
      name: `Product ${productId.slice(-4)}`,
      price: Math.floor(Math.random() * 1000) + 100,
      images: [{ url: '/placeholder-image.jpg', alt: 'Product Image' }],
      stock: 10
    };

    const existingItemIndex = cartItems.findIndex(
      item => item.product._id === productId
    );

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += quantity;
      console.log('📦 Mock API: Updated existing item quantity', cartItems[existingItemIndex]);
    } else {
      const newItem = {
        product: mockProduct,
        quantity
      };
      cartItems.push(newItem);
      console.log('📦 Mock API: Added new item to cart', newItem);
    }

    this.saveCartItems(cartItems);

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    console.log('✅ Mock API: Cart updated', cartItems);

    return {
      items: cartItems,
      totalAmount
    };
  }

  async updateCartItem(productId: string, quantity: number): Promise<MockCartResponse> {
    await this.delay(300);
    console.log('🔄 Mock API: Updating cart item', { productId, quantity });

    let cartItems = this.getCartItems();

    if (quantity === 0) {
      cartItems = cartItems.filter(item => item.product._id !== productId);
      console.log('🗑️ Mock API: Removed item from cart', productId);
    } else {
      const existingItemIndex = cartItems.findIndex(
        item => item.product._id === productId
      );

      if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity = quantity;
        console.log('📦 Mock API: Updated item quantity', cartItems[existingItemIndex]);
      }
    }

    this.saveCartItems(cartItems);

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    console.log('✅ Mock API: Cart item updated', cartItems);

    return {
      items: cartItems,
      totalAmount
    };
  }

  async removeFromCart(productId: string): Promise<MockCartResponse> {
    await this.delay(300);
    console.log('🔄 Mock API: Removing from cart', { productId });

    const cartItems = this.getCartItems().filter(item => item.product._id !== productId);
    this.saveCartItems(cartItems);

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    console.log('✅ Mock API: Item removed from cart', cartItems);

    return {
      items: cartItems,
      totalAmount
    };
  }

  async clearCart(): Promise<MockCartResponse> {
    await this.delay(300);
    console.log('🔄 Mock API: Clearing cart');

    this.saveCartItems([]);

    console.log('✅ Mock API: Cart cleared');

    return {
      items: [],
      totalAmount: 0
    };
  }
}

export const mockApiService = new MockApiService();