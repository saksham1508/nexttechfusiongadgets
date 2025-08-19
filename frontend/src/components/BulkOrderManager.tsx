import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  FileText, 
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingDown,
  Percent
} from 'lucide-react';

import { useAppDispatch } from '../store/store';
import toast from 'react-hot-toast';

interface BulkOrderItem {
  product: any;
  quantity: number;
  unitPrice: number;
  bulkDiscount: number;
  totalPrice: number;
}

interface BulkPricingTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  pricePerUnit: number;
}

interface BulkOrderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialProducts?: any[];
}

const BulkOrderManager: React.FC<BulkOrderManagerProps> = ({
  isOpen,
  onClose,
  initialProducts = []
}) => {
  const dispatch = useAppDispatch();
  const [bulkItems, setBulkItems] = useState<BulkOrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    requirements: ''
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);

  // Initialize with products if provided
  useEffect(() => {
    if (initialProducts.length > 0) {
      const items = initialProducts.map(product => ({
        product,
        quantity: 10, // Default bulk quantity
        unitPrice: product.price,
        bulkDiscount: calculateBulkDiscount(product.price, 10),
        totalPrice: calculateTotalPrice(product.price, 10)
      }));
      setBulkItems(items);
    }
  }, [initialProducts]);

  // Mock bulk pricing tiers
  const getBulkPricingTiers = (basePrice: number): BulkPricingTier[] => [
    { minQuantity: 1, maxQuantity: 9, discountPercentage: 0, pricePerUnit: basePrice },
    { minQuantity: 10, maxQuantity: 49, discountPercentage: 5, pricePerUnit: basePrice * 0.95 },
    { minQuantity: 50, maxQuantity: 99, discountPercentage: 10, pricePerUnit: basePrice * 0.90 },
    { minQuantity: 100, maxQuantity: 499, discountPercentage: 15, pricePerUnit: basePrice * 0.85 },
    { minQuantity: 500, discountPercentage: 20, pricePerUnit: basePrice * 0.80 }
  ];

  const calculateBulkDiscount = (basePrice: number, quantity: number): number => {
    const tiers = getBulkPricingTiers(basePrice);
    const tier = tiers.find(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity));
    return tier?.discountPercentage || 0;
  };

  const calculateTotalPrice = (basePrice: number, quantity: number): number => {
    const discount = calculateBulkDiscount(basePrice, quantity);
    const discountedPrice = basePrice * (1 - discount / 100);
    return discountedPrice * quantity;
  };

  const addProduct = (product: any) => {
    const existingItem = bulkItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 10);
    } else {
      const newItem: BulkOrderItem = {
        product,
        quantity: 10,
        unitPrice: product.price,
        bulkDiscount: calculateBulkDiscount(product.price, 10),
        totalPrice: calculateTotalPrice(product.price, 10)
      };
      setBulkItems([...bulkItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setBulkItems(items => items.map(item => {
      if (item.product._id === productId) {
        const bulkDiscount = calculateBulkDiscount(item.product.price, newQuantity);
        return {
          ...item,
          quantity: newQuantity,
          bulkDiscount,
          totalPrice: calculateTotalPrice(item.product.price, newQuantity)
        };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setBulkItems(items => items.filter(item => item.product._id !== productId));
  };

  const getTotalAmount = () => {
    return bulkItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalDiscount = () => {
    return bulkItems.reduce((total, item) => {
      const originalTotal = item.product.price * item.quantity;
      return total + (originalTotal - item.totalPrice);
    }, 0);
  };

  const getTotalItems = () => {
    return bulkItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitQuote = async () => {
    if (bulkItems.length === 0) {
      toast.error('Please add products to your bulk order');
      return;
    }

    if (!customerInfo.companyName || !customerInfo.contactPerson || !customerInfo.email) {
      toast.error('Please fill in required customer information');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Bulk order quote submitted successfully!');
      setShowQuotation(true);
      // Auto-generate and download PDF after successful submission
      generateQuotationPDF();
    } catch (error) {
      toast.error('Failed to submit bulk order quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQuotationPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 40;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Bulk Order Quotation', pageWidth / 2, y, { align: 'center' });
      y += 24;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const dateStr = new Date().toLocaleString();
      doc.text(`Date: ${dateStr}`, 40, y);
      y += 16;

      // Customer Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Customer Details', 40, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const customerLines = [
        `Company: ${customerInfo.companyName || '-'}`,
        `Contact Person: ${customerInfo.contactPerson || '-'}`,
        `Email: ${customerInfo.email || '-'}`,
        `Phone: ${customerInfo.phone || '-'}`,
        `Address: ${customerInfo.address || '-'}`,
        customerInfo.gstNumber ? `GST: ${customerInfo.gstNumber}` : undefined,
        deliveryDate ? `Preferred Delivery: ${deliveryDate}` : undefined,
      ].filter(Boolean) as string[];
      customerLines.forEach(line => { doc.text(line, 40, y); y += 14; });

      y += 10;
      // Items table header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Items', 40, y);
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Product', 40, y);
      doc.text('Qty', pageWidth - 260, y);
      doc.text('Unit Price', pageWidth - 200, y);
      doc.text('Discount', pageWidth - 120, y);
      doc.text('Total', pageWidth - 60, y);
      y += 10;
      doc.setLineWidth(0.5);
      doc.line(40, y, pageWidth - 40, y);
      y += 12;

      // Items rows
      doc.setFont('helvetica', 'normal');
      bulkItems.forEach(item => {
        const name = String(item.product.name || 'Item');
        const qty = String(item.quantity);
        const unit = `₹${item.unitPrice?.toLocaleString() || item.product.price?.toLocaleString?.() || '-'}`;
        const disc = `${item.bulkDiscount}%`;
        const tot = `₹${item.totalPrice.toLocaleString()}`;

        // Wrap product name if long
        const nameLines: string[] = doc.splitTextToSize(name, pageWidth - 320) as string[];
        nameLines.forEach((line: string, idx: number) => {
          if (y > 780) { // simple page break
            doc.addPage();
            y = 40;
          }
          if (idx === 0) {
            doc.text(line, 40, y);
            doc.text(qty, pageWidth - 260, y, { align: 'left' });
            doc.text(unit, pageWidth - 200, y, { align: 'left' });
            doc.text(disc, pageWidth - 120, y, { align: 'left' });
            doc.text(tot, pageWidth - 60, y, { align: 'left' });
          } else {
            doc.text(line, 40, y);
          }
          y += 14;
        });
        y += 4;
      });

      // Summary
      if (y > 740) { doc.addPage(); y = 40; }
      doc.setLineWidth(0.5);
      doc.line(40, y, pageWidth - 40, y);
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Items: ${getTotalItems()}`, 40, y); y += 16;
      doc.text(`Total Savings: ₹${getTotalDiscount().toLocaleString()}`, 40, y); y += 16;
      doc.text(`Grand Total: ₹${getTotalAmount().toLocaleString()}`, 40, y);

      // Footer
      y += 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('This is a system-generated quotation request summary.', 40, y);

      const filename = `Quotation_${customerInfo.companyName || 'Customer'}_${Date.now()}.pdf`;
      doc.save(filename);
      toast.success('Quotation PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Order Manager</h2>
                <p className="text-gray-600">Request quotes for large quantity purchases</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close bulk order manager"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full max-h-[calc(90vh-100px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Items</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{getTotalItems()}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Total Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{getTotalDiscount().toLocaleString()}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Avg. Discount</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {bulkItems.length > 0 ? Math.round(bulkItems.reduce((sum, item) => sum + item.bulkDiscount, 0) / bulkItems.length) : 0}%
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">₹{getTotalAmount().toLocaleString()}</p>
                </div>
              </div>

              {/* Bulk Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                
                {bulkItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No items in bulk order</h4>
                    <p className="text-gray-600">Add products to start building your bulk order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulkItems.map((item) => (
                      <motion.div
                        key={item.product._id}
                        layout
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <img
                            src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          
                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.product._id}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500">Unit Price:</span>
                              <span className="font-medium">₹{item.product.price.toLocaleString()}</span>
                              {item.bulkDiscount > 0 && (
                                <span className="text-sm text-green-600 font-medium">
                                  ({item.bulkDiscount}% off)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 10)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              disabled={item.quantity <= 10}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <div className="text-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                                className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                                min="1"
                                aria-label={`Quantity for ${item.product.name}`}
                              />
                              <p className="text-xs text-gray-500 mt-1">Quantity</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 10)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Total Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{item.totalPrice.toLocaleString()}
                            </p>
                            {item.bulkDiscount > 0 && (
                              <p className="text-sm text-green-600">
                                Saved: ₹{((item.product.price * item.quantity) - item.totalPrice).toLocaleString()}
                              </p>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={`Remove ${item.product.name} from bulk order`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Bulk Pricing Tiers */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Bulk Pricing Tiers</h5>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {getBulkPricingTiers(item.product.price).map((tier, index) => (
                              <div
                                key={index}
                                className={`p-2 rounded text-center text-xs ${
                                  item.quantity >= tier.minQuantity && (!tier.maxQuantity || item.quantity <= tier.maxQuantity)
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                              >
                                <div className="font-medium">
                                  {tier.minQuantity}+ {tier.maxQuantity ? `- ${tier.maxQuantity}` : ''}
                                </div>
                                <div>{tier.discountPercentage}% off</div>
                                <div>₹{tier.pricePerUnit.toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.contactPerson}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={customerInfo.gstNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, gstNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter GST number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="delivery-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Required Delivery Date
                    </label>
                    <input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    value={customerInfo.requirements}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any special requirements or notes"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting || bulkItems.length === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Quote Request</span>
                    </>
                  )}
                </motion.button>
                
                {showQuotation && (
                  <motion.button
                    type="button"
                    onClick={generateQuotationPDF}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Quote</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkOrderManager;