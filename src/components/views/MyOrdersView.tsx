import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import type { Database } from '../../lib/supabase';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleWithProduct = Sale & { products?: { name: string; unit: string } | null };

export const MyOrdersView: React.FC = () => {
  const { user } = useAuth();
  const { sales } = useData();

  // Filter sales for current customer (in a real app, this would be based on customer_id)
  const myOrders = sales.filter(sale => 
    sale.customer_name === user?.full_name || 
    sale.customer_phone === user?.phone
  );

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
      label: 'Order Date',
      render: (value: string) => new Date(value).toLocaleDateString()
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

  const totalSpent = myOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = myOrders.filter(o => o.delivery_status === 'pending').length;
  const completedOrders = myOrders.filter(o => o.delivery_status === 'delivered' || o.delivery_status === 'picked_up').length;

  return (
    <Layout title="My Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
          <h2 className="text-2xl font-bold mb-2">My Orders</h2>
          <p className="text-blue-100">
            Track your orders and purchase history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-semibold">{myOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">{pendingOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">{completedOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-semibold">K{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {myOrders.length > 0 ? (
          <DataTable
            title="Order History"
            data={myOrders}
            columns={columns}
            searchable={true}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet. Browse our marketplace to get started!
            </p>
            <button
              onClick={() => window.location.hash = '#marketplace'}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Order Status Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getPaymentStatusBadge('pending')}
                  <span className="text-sm text-gray-600">Payment is being processed</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusBadge('paid')}
                  <span className="text-sm text-gray-600">Payment completed successfully</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusBadge('partial')}
                  <span className="text-sm text-gray-600">Partial payment received</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusBadge('overdue')}
                  <span className="text-sm text-gray-600">Payment is overdue</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Status</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getDeliveryStatusBadge('pending')}
                  <span className="text-sm text-gray-600">Order is being prepared</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getDeliveryStatusBadge('delivered')}
                  <span className="text-sm text-gray-600">Order has been delivered</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getDeliveryStatusBadge('picked_up')}
                  <span className="text-sm text-gray-600">Order has been picked up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};