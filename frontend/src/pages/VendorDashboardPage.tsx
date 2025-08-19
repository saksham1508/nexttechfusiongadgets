import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ShoppingCart, Package, BarChart3, CheckCircle2 } from 'lucide-react';

const VendorDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="container-modern py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {user ? `Welcome, ${user.name}!` : 'Manage your products, orders, and performance.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">128</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold">42</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fulfillment Rate</p>
              <p className="text-2xl font-bold">98%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue (30d)</p>
              <p className="text-2xl font-bold">₹2.4L</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <p className="text-gray-500">Sample data only. Hook up to orders API to display real vendor orders.</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Inventory Alerts</h2>
          <p className="text-gray-500">Sample data only. Connect to inventory to show low-stock items.</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;