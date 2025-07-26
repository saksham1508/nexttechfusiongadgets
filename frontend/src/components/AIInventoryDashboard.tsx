// AI Inventory Dashboard Component
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  BarChart3,
  Brain,
  Zap,
  RefreshCw,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { useOptimizedState } from '../hooks/useOptimizedState';
import VirtualizedList from './VirtualizedList';
import performanceOptimizer from '../utils/performanceOptimizer';

interface DashboardData {
  summary: {
    totalProducts: number;
    lowStockProducts: number;
    pendingOrders: number;
    overdueOrders: number;
    forecastAccuracy: number;
    stockoutRisk: number;
  };
  alerts: Alert[];
  topPerformingProducts: Product[];
  inventoryByCategory: CategoryData[];
  recommendations: Recommendation[];
  generatedAt: string;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  countInStock: number;
  salesCount: number;
  price: number;
}

interface CategoryData {
  _id: string;
  totalValue: number;
  totalProducts: number;
  totalStock: number;
}

interface Recommendation {
  productId: string;
  productName: string;
  recommendations: {
    type: string;
    message: string;
    impact: string;
  }[];
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  productName: string;
  orderQuantity: number;
  totalCost: number;
  urgency: string;
  confidence: number;
  expectedDelivery: string;
  status: string;
}

const AIInventoryDashboard: React.FC = () => {
  const { state: dashboardData, setState: setDashboardData } = useOptimizedState<DashboardData | null>({
    initialValue: null
  });

  const { state: purchaseOrders, setState: setPurchaseOrders } = useOptimizedState<PurchaseOrder[]>({
    initialValue: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'alerts' | 'insights'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // O(1) - Memoized API calls
  const fetchDashboardData = useMemo(
    () => performanceOptimizer.memoize(
      async () => {
        const response = await fetch('/api/ai-inventory/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        return response.json();
      },
      () => 'dashboard_data',
      300000 // 5 minutes cache
    ),
    []
  );

  const fetchPurchaseOrders = useMemo(
    () => performanceOptimizer.memoize(
      async () => {
        const response = await fetch('/api/ai-inventory/purchase-orders?status=pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch purchase orders');
        }

        return response.json();
      },
      () => 'purchase_orders',
      180000 // 3 minutes cache
    ),
    []
  );

  // O(1) - Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardResponse, ordersResponse] = await Promise.all([
          fetchDashboardData(),
          fetchPurchaseOrders()
        ]);

        if (dashboardResponse.success) {
          setDashboardData(dashboardResponse.data);
        }

        if (ordersResponse.success) {
          setPurchaseOrders(ordersResponse.data.orders);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchDashboardData, fetchPurchaseOrders, setDashboardData, setPurchaseOrders]);

  // O(1) - Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    performanceOptimizer.clearAllCaches();
    
    try {
      const [dashboardResponse, ordersResponse] = await Promise.all([
        fetchDashboardData(),
        fetchPurchaseOrders()
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      if (ordersResponse.success) {
        setPurchaseOrders(ordersResponse.data.orders);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  // O(1) - Approve purchase order
  const handleApproveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/ai-inventory/purchase-orders/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove approved order from list
        setPurchaseOrders(prev => prev.filter(order => order._id !== orderId));
      }
    } catch (err) {
      console.error('Error approving order:', err);
    }
  };

  // O(1) - Reject purchase order
  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      const response = await fetch(`/api/ai-inventory/purchase-orders/${orderId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Remove rejected order from list
        setPurchaseOrders(prev => prev.filter(order => order._id !== orderId));
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
    }
  };

  // O(1) - Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // O(1) - Render purchase order item
  const renderPurchaseOrderItem = (order: PurchaseOrder, index: number) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-gray-900">{order.productName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(order.urgency)}`}>
              {order.urgency.toUpperCase()}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Quantity:</span> {order.orderQuantity}
            </div>
            <div>
              <span className="font-medium">Cost:</span> ${order.totalCost.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Confidence:</span> {(order.confidence * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Delivery:</span> {new Date(order.expectedDelivery).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => handleApproveOrder(order._id)}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Approve
          </button>
          <button
            onClick={() => handleRejectOrder(order._id, 'Manual review required')}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI Inventory Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Inventory Management</h1>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'orders', label: 'AI Orders', icon: ShoppingCart },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'insights', label: 'Insights', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.lowStockProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.overdueOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">{(dashboardData.summary.forecastAccuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stockout Risk</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.stockoutRisk}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Products */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                <div className="space-y-3">
                  {dashboardData.topPerformingProducts.slice(0, 5).map(product => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{product.salesCount} sold</p>
                        <p className="text-sm text-gray-600">{product.countInStock} in stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory by Category */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
                <div className="space-y-3">
                  {dashboardData.inventoryByCategory.slice(0, 5).map(category => (
                    <div key={category._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{category._id}</p>
                        <p className="text-sm text-gray-600">{category.totalProducts} products</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${category.totalValue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{category.totalStock} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {dashboardData.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                <div className="space-y-4">
                  {dashboardData.recommendations.map(rec => (
                    <div key={rec.productId} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">{rec.productName}</h4>
                      <div className="mt-2 space-y-1">
                        {rec.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              recommendation.impact === 'high' ? 'bg-red-100 text-red-800' :
                              recommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {recommendation.impact}
                            </span>
                            <p className="text-sm text-gray-600">{recommendation.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">AI-Generated Purchase Orders</h2>
              <div className="text-sm text-gray-600">
                {purchaseOrders.length} pending orders
              </div>
            </div>

            {purchaseOrders.length > 0 ? (
              <VirtualizedList
                items={purchaseOrders}
                itemHeight={120}
                containerHeight={600}
                renderItem={renderPurchaseOrderItem}
                className="bg-gray-50 rounded-lg p-4"
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Orders</h3>
                <p className="text-gray-600">All AI-generated purchase orders have been processed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && dashboardData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Inventory Alerts</h2>
            
            {dashboardData.alerts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.alerts.map(alert => (
                  <div key={alert.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">Your inventory is running smoothly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInventoryDashboard;