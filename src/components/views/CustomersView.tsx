import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { CustomerForm } from '../forms/CustomerForm';
import type { Database } from '../../lib/supabase';
import { Users, Phone, Mail, MapPin, Calendar } from 'lucide-react';

type Customer = Database['public']['Tables']['customers']['Row'];

export const CustomersView: React.FC = () => {
  const { user } = useAuth();
  const { customers, deleteCustomer, sales } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Customer | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager';

  if (!canModify) {
    return (
      <Layout title="Customers">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view customer data.
          </p>
        </div>
      </Layout>
    );
  }

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (customer: Customer) => {
    setShowDeleteConfirm(customer);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteCustomer(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCustomer(undefined);
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customer_id === customerId);
  };

  const getCustomerTotalSpent = (customerId: string) => {
    return getCustomerSales(customerId).reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      render: (value: string, row: Customer) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            {row.email && (
              <p className="text-xs text-gray-500">{row.email}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string | null) => value ? (
        <div className="flex items-center space-x-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-gray-500 text-sm">No phone</span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: string | null) => value ? (
        <div className="flex items-center space-x-1">
          <Mail className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-gray-500 text-sm">No email</span>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (value: string | null) => value ? (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="text-sm line-clamp-2">{value}</span>
        </div>
      ) : (
        <span className="text-gray-500 text-sm">No address</span>
      )
    },
    {
      key: 'id',
      label: 'Orders',
      render: (value: string) => {
        const customerSales = getCustomerSales(value);
        return (
          <div className="text-center">
            <span className="font-medium">{customerSales.length}</span>
            <p className="text-xs text-gray-500">orders</p>
          </div>
        );
      }
    },
    {
      key: 'id',
      label: 'Total Spent',
      render: (value: string) => {
        const totalSpent = getCustomerTotalSpent(value);
        return (
          <span className="font-semibold text-green-600">
            K{totalSpent.toFixed(2)}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Customer Since',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter(c => getCustomerSales(c.id).length > 0).length;
  const totalCustomerValue = customers.reduce((sum, customer) => sum + getCustomerTotalSpent(customer.id), 0);
  const averageCustomerValue = totalCustomers > 0 ? totalCustomerValue / totalCustomers : 0;

  return (
    <Layout title="Customer Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-xl font-semibold">{totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-xl font-semibold">{customersWithOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Value</p>
                <p className="text-xl font-semibold">K{totalCustomerValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Customer Value</p>
                <p className="text-xl font-semibold">K{averageCustomerValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Value</h3>
          <div className="space-y-3">
            {customers
              .map(customer => ({
                ...customer,
                totalSpent: getCustomerTotalSpent(customer.id),
                orderCount: getCustomerSales(customer.id).length
              }))
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .slice(0, 5)
              .map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.orderCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">K{customer.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">total spent</p>
                  </div>
                </div>
              ))}
            {customers.length === 0 && (
              <p className="text-gray-500 text-center py-8">No customers yet</p>
            )}
          </div>
        </div>

        {/* Customers Table */}
        <DataTable
          title="Customer Directory"
          data={customers}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          addButtonText="Add Customer"
        />

        {/* Form Modal */}
        {showForm && (
          <CustomerForm
            customer={selectedCustomer}
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Customer
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone and will affect related sales records.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};