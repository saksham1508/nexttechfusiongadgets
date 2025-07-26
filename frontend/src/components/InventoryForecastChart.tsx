// Inventory Forecast Chart Component
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import performanceOptimizer from '../utils/performanceOptimizer';

interface ForecastData {
  date: string;
  predicted: number;
  confidence: number;
  seasonalFactor: number;
}

interface InventoryForecastChartProps {
  productId: string;
  productName: string;
  currentStock: number;
  days?: number;
  className?: string;
}

const InventoryForecastChart: React.FC<InventoryForecastChartProps> = ({
  productId,
  productName,
  currentStock,
  days = 30,
  className = ''
}) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // O(1) - Memoized API call
  const fetchForecast = useMemo(
    () => performanceOptimizer.memoize(
      async (productId: string, days: number) => {
        const response = await fetch(`/api/ai-inventory/forecast/${productId}?days=${days}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch forecast data');
        }

        return response.json();
      },
      (productId: string, days: number) => `forecast_${productId}_${days}`,
      300000 // 5 minutes cache
    ),
    []
  );

  // O(1) - Load forecast data
  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchForecast(productId, days);
        
        if (response.success) {
          setForecastData(response.data.forecast);
        } else {
          setError(response.message || 'Failed to load forecast');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [productId, days, fetchForecast]);

  // O(n) - Calculate chart dimensions and data points
  const chartData = useMemo(() => {
    if (forecastData.length === 0) return null;

    const maxDemand = Math.max(...forecastData.map(d => d.predicted));
    const minDemand = Math.min(...forecastData.map(d => d.predicted));
    const range = maxDemand - minDemand;
    const padding = range * 0.1;

    const chartHeight = 200;
    const chartWidth = 600;

    const points = forecastData.map((data, index) => {
      const x = (index / (forecastData.length - 1)) * chartWidth;
      const y = chartHeight - ((data.predicted - minDemand + padding) / (range + 2 * padding)) * chartHeight;
      
      return {
        x,
        y,
        data
      };
    });

    // Create SVG path for the forecast line
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    // Create confidence band path
    const confidencePath = points.reduce((path, point, index) => {
      const confidenceRange = (1 - point.data.confidence) * 20; // Visual confidence range
      const upperY = Math.max(0, point.y - confidenceRange);
      const lowerY = Math.min(chartHeight, point.y + confidenceRange);
      
      if (index === 0) {
        return `M ${point.x} ${upperY} L ${point.x} ${lowerY}`;
      }
      
      return `${path} L ${point.x} ${upperY} L ${point.x} ${lowerY}`;
    }, '');

    return {
      points,
      pathData,
      confidencePath,
      maxDemand,
      minDemand,
      chartHeight,
      chartWidth
    };
  }, [forecastData]);

  // O(1) - Calculate forecast summary
  const forecastSummary = useMemo(() => {
    if (forecastData.length === 0) return null;

    const totalDemand = forecastData.reduce((sum, d) => sum + d.predicted, 0);
    const avgDemand = totalDemand / forecastData.length;
    const avgConfidence = forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length;
    
    const trend = forecastData.length > 1 
      ? forecastData[forecastData.length - 1].predicted - forecastData[0].predicted
      : 0;

    const stockoutRisk = forecastData.findIndex(d => {
      const cumulativeDemand = forecastData.slice(0, forecastData.indexOf(d) + 1)
        .reduce((sum, item) => sum + item.predicted, 0);
      return cumulativeDemand > currentStock;
    });

    return {
      totalDemand: Math.round(totalDemand),
      avgDemand: Math.round(avgDemand),
      avgConfidence,
      trend,
      stockoutRisk: stockoutRisk === -1 ? null : stockoutRisk + 1
    };
  }, [forecastData, currentStock]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Forecast Unavailable</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || !forecastSummary) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data</h3>
          <p className="text-gray-600">Insufficient historical data to generate forecast</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-600">Demand Forecast - Next {days} Days</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-xl font-bold text-gray-900">{currentStock}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Avg Confidence</p>
            <p className="text-xl font-bold text-blue-600">
              {(forecastSummary.avgConfidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <svg
          width={chartData.chartWidth}
          height={chartData.chartHeight}
          className="w-full h-48 border border-gray-200 rounded"
          viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Confidence band */}
          <path
            d={chartData.confidencePath}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="none"
          />

          {/* Forecast line */}
          <path
            d={chartData.pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all cursor-pointer"
              />
              
              {/* Tooltip on hover */}
              <g className="opacity-0 hover:opacity-100 transition-opacity">
                <rect
                  x={point.x - 40}
                  y={point.y - 35}
                  width="80"
                  height="25"
                  fill="rgba(0, 0, 0, 0.8)"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {Math.round(point.data.predicted)} units
                </text>
              </g>
            </g>
          ))}

          {/* Current stock line */}
          <line
            x1="0"
            y1={chartData.chartHeight - (currentStock / chartData.maxDemand) * chartData.chartHeight}
            x2={chartData.chartWidth}
            y2={chartData.chartHeight - (currentStock / chartData.maxDemand) * chartData.chartHeight}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Chart legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span className="text-gray-600">Predicted Demand</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-600" style={{ borderTop: '2px dashed' }}></div>
            <span className="text-gray-600">Current Stock</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-blue-100"></div>
            <span className="text-gray-600">Confidence Band</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Demand</p>
          <p className="text-lg font-bold text-gray-900">{forecastSummary.totalDemand}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Daily Average</p>
          <p className="text-lg font-bold text-gray-900">{forecastSummary.avgDemand}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1">
            {forecastSummary.trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <p className="text-sm text-gray-600">Trend</p>
          </div>
          <p className={`text-lg font-bold ${forecastSummary.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {forecastSummary.trend > 0 ? '+' : ''}{Math.round(forecastSummary.trend)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Stockout Risk</p>
          <p className={`text-lg font-bold ${
            forecastSummary.stockoutRisk 
              ? forecastSummary.stockoutRisk <= 7 
                ? 'text-red-600' 
                : 'text-orange-600'
              : 'text-green-600'
          }`}>
            {forecastSummary.stockoutRisk ? `Day ${forecastSummary.stockoutRisk}` : 'Low'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {forecastSummary.stockoutRisk && forecastSummary.stockoutRisk <= 7 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">
              Critical: Stockout predicted in {forecastSummary.stockoutRisk} days
            </p>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Consider immediate reordering to avoid stockout
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryForecastChart;