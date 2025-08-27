import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, Eye, Percent, RotateCcw, IndianRupee } from 'lucide-react';
import vendorService, { VendorAnalyticsResponse } from '../services/vendorService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface Props {
  className?: string;
}

const VendorBusinessDashboard: React.FC<Props> = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VendorAnalyticsResponse['data'] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await vendorService.getAnalytics();
        if (res && (res as any).data) {
          setData((res as any).data);
        } else if ((res as any).success !== false && (res as any).summary) {
          // In case service returns data directly
          setData(res as any);
        } else {
          setError((res as any).message || 'Failed to load analytics');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topProducts = useMemo(() => {
    if (!data) return [];
    return [...data.productOrders].sort((a, b) => b.orders - a.orders).slice(0, 8);
  }, [data]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${className}`}>
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const s = data.summary;

  const summaryCards = [
    { label: 'Total Clicks', value: s.totalClicks, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Views', value: s.totalViews, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Orders', value: s.totalOrders, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Conversion Rate', value: `${s.conversionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Sales', value: `₹${s.totalSales.toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Return %', value: `${s.returnPercentage}%`, icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const productVsOrders = topProducts.map(p => ({ name: p.name, Orders: p.orders, Views: p.views }));

  // Build stacked series: months on X, each product a line of quantity
  const months = data.productMonthly[0]?.months || [];
  const productMonthlySeries = data.productMonthly.map(p => ({ key: p.productId, name: p.name, series: p.series }));
  const monthlyChartData = months.map((m, i) => {
    const row: any = { month: m };
    productMonthlySeries.forEach(p => { row[p.name] = p.series[i] || 0; });
    return row;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${c.bg}`}>
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product vs Orders (Top 8) */}
      <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Products vs Orders</h3>
          <span className="text-xs text-gray-500">Top 8</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productVsOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Orders" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Views" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product vs Month (quantities) */}
      <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Products vs Months</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {productMonthlySeries.slice(0, 6).map((p, idx) => (
                <Line key={p.key} type="monotone" dataKey={p.name} stroke={["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4"][idx % 6]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VendorBusinessDashboard;