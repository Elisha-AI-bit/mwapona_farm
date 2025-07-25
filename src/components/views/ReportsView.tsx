import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import type { Database } from '../../lib/supabase';
import { TrendingUp, BarChart3, PieChart, Calendar, Download, Filter } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const { fields, crops, livestock, products, sales, harvests, tasks } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const canView = user?.role === 'admin' || user?.role === 'manager';

  if (!canView) {
    return (
      <Layout title="Reports">
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view reports.
          </p>
        </div>
      </Layout>
    );
  }

  // Calculate date range
  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange(parseInt(selectedPeriod));

  // Filter data by selected period
  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    return saleDate >= startDate && saleDate <= endDate;
  });

  const filteredHarvests = harvests.filter(h => {
    const harvestDate = new Date(h.harvest_date);
    return harvestDate >= startDate && harvestDate <= endDate;
  });

  const filteredTasks = tasks.filter(t => {
    const taskDate = new Date(t.created_at);
    return taskDate >= startDate && taskDate <= endDate;
  });

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalHarvestQuantity = filteredHarvests.reduce((sum, harvest) => sum + harvest.quantity, 0);
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Product performance
  const productSales = filteredSales.reduce((acc, sale) => {
    const productName = sale.products?.name || 'Unknown';
    if (!acc[productName]) {
      acc[productName] = { quantity: 0, revenue: 0, count: 0 };
    }
    acc[productName].quantity += sale.quantity;
    acc[productName].revenue += sale.total_amount;
    acc[productName].count += 1;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number; count: number }>);

  const topProducts = Object.entries(productSales)
    .sort(([,a], [,b]) => b.revenue - a.revenue)
    .slice(0, 5);

  // Crop performance
  const cropHarvests = filteredHarvests.reduce((acc, harvest) => {
    const cropName = harvest.crops?.name || 'Unknown';
    if (!acc[cropName]) {
      acc[cropName] = { quantity: 0, count: 0 };
    }
    acc[cropName].quantity += harvest.quantity;
    acc[cropName].count += 1;
    return acc;
  }, {} as Record<string, { quantity: number; count: number }>);

  const topCrops = Object.entries(cropHarvests)
    .sort(([,a], [,b]) => b.quantity - a.quantity)
    .slice(0, 5);

  // Payment method distribution
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header with Period Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Farm Analytics</h2>
            <p className="text-gray-600">Comprehensive insights into your farm operations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">K{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Last {selectedPeriod} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sales Count</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
                <p className="text-xs text-gray-500">Avg: K{averageSaleValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Harvest Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{totalHarvestQuantity.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{filteredHarvests.length} harvests</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                <p className="text-xs text-gray-500">of {filteredTasks.length} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map(([product, data], index) => (
                  <div key={product} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product}</p>
                        <p className="text-sm text-gray-500">{data.count} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">K{data.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{data.quantity} units</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data for selected period</p>
            )}
          </div>

          {/* Top Crops */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Harvested Crops</h3>
            {topCrops.length > 0 ? (
              <div className="space-y-3">
                {topCrops.map(([crop, data], index) => (
                  <div key={crop} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-amber-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{crop}</p>
                        <p className="text-sm text-gray-500">{data.count} harvests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-amber-600">{data.quantity.toFixed(1)}</p>
                      <p className="text-sm text-gray-500">total quantity</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No harvest data for selected period</p>
            )}
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            {Object.keys(paymentMethods).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(paymentMethods).map(([method, count]) => {
                  const percentage = filteredSales.length > 0 ? ((count / filteredSales.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{method.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No payment data for selected period</p>
            )}
          </div>

          {/* Farm Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Fields</span>
                <span className="font-semibold">{fields.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Crops</span>
                <span className="font-semibold">{crops.filter(c => c.status !== 'harvested').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Livestock Count</span>
                <span className="font-semibold">{livestock.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Available Products</span>
                <span className="font-semibold">{products.filter(p => p.status === 'available').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Farm Area</span>
                <span className="font-semibold">{fields.reduce((sum, field) => sum + field.size, 0).toFixed(1)} acres</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};