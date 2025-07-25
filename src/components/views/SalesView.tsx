import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import type { Database } from '../../lib/supabase';
import { ShoppingCart, DollarSign, Calendar, Phone, Package } from 'lucide-react';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleWithProduct = Sale & { products?: { name: string; unit: string } | null };

export const SalesView: React.FC = () => {
  const { user } = useAuth();
  const { sales } = useData();

  const canView = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  if (!canView) {
    return (
      <Layout title="Sales">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view sales data.
          </p>
        </div>
      </Layout>
    );
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDeliveryStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      picked_up: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      pending: 'Pending',
      delivered: 'Delivered',
      picked_up: 'Picked Up'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const columns = [
    {
      key: 'sale_date',
      label: 'Sale Date',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'products',
      label: 'Product',
      render: (value: any, row: SaleWithProduct) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{row.products?.name || 'Unknown Product'}</span>
        </div>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value: string, row: SaleWithProduct) => (
        <div>
          <span className="font-medium">{value}</span>
          {row.customer_phone && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{row.customer_phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value: number, row: SaleWithProduct) => 
        `${value} ${row.products?.unit || 'units'}`
    },
    {
      key: 'price_per_unit',
      label: 'Unit Price',
      render: (value: number) => `K${value.toFixed(2)}`
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (value: number) => (
        <span className="font-semibold text-green-600">K{value.toFixed(2)}</span>
      )
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      render: (value: string) => (
        <span className="capitalize">{value.replace('_', ' ')}</span>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (value: string) => getPaymentStatusBadge(value)
    },
    {
      key: 'delivery_status',
      label: 'Delivery',
      render: (value: string) => getDeliveryStatusBadge(value)
    }
  ];

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const paidSales = sales.filter(s => s.payment_status === 'paid');
  const pendingDeliveries = sales.filter(s => s.delivery_status === 'pending');
  const recentSales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  });

  return (
    <Layout title="Sales Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-semibold">{sales.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-semibold">K{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Sales</p>
                <p className="text-xl font-semibold">{paidSales.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Deliveries</p>
                <p className="text-xl font-semibold">{pendingDeliveries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales (Last 30 Days)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{recentSales.length}</p>
              <p className="text-sm text-gray-600">Sales Count</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                K{recentSales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                K{recentSales.length > 0 ? (recentSales.reduce((sum, sale) => sum + sale.total_amount, 0) / recentSales.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-600">Average Sale</p>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <DataTable
          title="Sales Records"
          data={sales}
          columns={columns}
          searchable={true}
        />

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['cash', 'mobile_money', 'bank_transfer', 'credit'].map(method => {
              const count = sales.filter(s => s.payment_method === method).length;
              const percentage = sales.length > 0 ? ((count / sales.length) * 100).toFixed(1) : '0';
              return (
                <div key={method} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{method.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};