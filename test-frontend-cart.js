// Test script to verify frontend cart functionality
const puppeteer = require('puppeteer');

async function testFrontendCart() {
  let browser;
  try {
    console.log('🧪 Testing Frontend Cart Functionality...\n');

    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for products to load
    console.log('2. Waiting for products to load...');
    await page.waitForSelector('.card-product', { timeout: 10000 });
    
    // Check initial cart count (should be 0)
    console.log('3. Checking initial cart count...');
    const initialCartCount = await page.evaluate(() => {
      const cartBadge = document.querySelector('.bg-gradient-to-r.from-red-500.to-pink-600');
      return cartBadge ? cartBadge.textContent : '0';
    });
    console.log('✅ Initial cart count:', initialCartCount);
    
    // Find and click the first "Add to Cart" button
    console.log('4. Adding first product to cart...');
    const addToCartButton = await page.$('.btn-primary');
    if (addToCartButton) {
      await addToCartButton.click();
      console.log('✅ Clicked Add to Cart button');
      
      // Wait for toast notification
      await page.waitForTimeout(2000);
      
      // Check if cart count updated
      const updatedCartCount = await page.evaluate(() => {
        const cartBadge = document.querySelector('.bg-gradient-to-r.from-red-500.to-pink-600');
        return cartBadge ? cartBadge.textContent : '0';
      });
      console.log('✅ Updated cart count:', updatedCartCount);
      
      // Check localStorage
      const mockCartData = await page.evaluate(() => {
        return localStorage.getItem('mockCart');
      });
      console.log('✅ MockCart localStorage data:', mockCartData);
      
    } else {
      console.log('❌ No Add to Cart button found');
    }
    
    // Navigate to cart page
    console.log('5. Navigating to cart page...');
    await page.click('a[href="/cart"]');
    await page.waitForTimeout(3000);
    
    // Check if cart page shows items
    const cartItems = await page.evaluate(() => {
      const itemElements = document.querySelectorAll('[data-testid="cart-item"], .cart-item, .pb-6.border-b');
      return itemElements.length;
    });
    console.log('✅ Cart page shows', cartItems, 'items');
    
    console.log('\n🎉 Frontend cart test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testFrontendCart();
} catch (error) {
  console.log('⚠️ Puppeteer not available. Please test manually:');
  console.log('1. Open http://localhost:3000');
  console.log('2. Click "Add to Cart" on any product');
  console.log('3. Check if cart count updates in header');
  console.log('4. Navigate to /cart and verify items are shown');
}