import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { ProductForm } from '../forms/ProductForm';
import type { Database } from '../../lib/supabase';
import { Package, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

export const ProductsView: React.FC = () => {
  const { user } = useAuth();
  const { products, deleteProduct } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    setShowDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteProduct(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedProduct(undefined);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      reserved: 'bg-blue-100 text-blue-800',
      damaged: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      render: (value: string, row: Product) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            <p className="text-xs text-gray-500 capitalize">{row.type}</p>
          </div>
        </div>
      )
    },
    {
      key: 'price_per_unit',
      label: 'Price',
      render: (value: number, row: Product) => (
        <span className="font-medium text-green-600">
          K{value.toFixed(2)}/{row.unit}
        </span>
      )
    },
    {
      key: 'quantity_available',
      label: 'Available',
      render: (value: number, row: Product) => `${value} ${row.unit}`
    },
    {
      key: 'harvest_date',
      label: 'Harvest Date',
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      render: (value: string | null, row: Product) => {
        if (!value) return 'No expiry';
        const isExpiring = isExpiringSoon(value);
        return (
          <div className="flex items-center space-x-1">
            {isExpiring && <AlertTriangle className="h-3 w-3 text-orange-500" />}
            <span className={isExpiring ? 'text-orange-600 font-medium' : ''}>
              {new Date(value).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'created_at',
      label: 'Added',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const availableProducts = products.filter(p => p.status === 'available');
  const expiringProducts = products.filter(p => isExpiringSoon(p.expiry_date));
  const totalValue = products.reduce((sum, product) => sum + (product.quantity_available * product.price_per_unit), 0);

  return (
    <Layout title="Product Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-semibold">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-xl font-semibold">{availableProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-xl font-semibold">{expiringProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-semibold">K{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Products Alert */}
        {expiringProducts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-orange-800">Products Expiring Soon</h3>
            </div>
            <p className="text-orange-700 text-sm mb-3">
              The following products will expire within 7 days:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {expiringProducts.slice(0, 4).map(product => (
                <div key={product.id} className="bg-white p-2 rounded border">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    (expires {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'unknown'})
                  </span>
                </div>
              ))}
            </div>
            {expiringProducts.length > 4 && (
              <p className="text-orange-600 text-sm mt-2">
                +{expiringProducts.length - 4} more products expiring soon
              </p>
            )}
          </div>
        )}

        {/* Products Table */}
        <DataTable
          title="Product Inventory"
          data={products}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Add Product"
        />

        {/* Form Modal */}
        {showForm && (
          <ProductForm
            product={selectedProduct}
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
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
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