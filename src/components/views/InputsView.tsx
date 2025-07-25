import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { InputForm } from '../forms/InputForm';
import type { Database } from '../../lib/supabase';
import { Package, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';

type Input = Database['public']['Tables']['inputs']['Row'];

export const InputsView: React.FC = () => {
  const { user } = useAuth();
  const { inputs, deleteInput } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedInput, setSelectedInput] = useState<Input | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Input | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  const handleAdd = () => {
    setSelectedInput(undefined);
    setShowForm(true);
  };

  const handleEdit = (input: Input) => {
    setSelectedInput(input);
    setShowForm(true);
  };

  const handleDelete = (input: Input) => {
    setShowDeleteConfirm(input);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteInput(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting input:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedInput(undefined);
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      seed: 'bg-green-100 text-green-800',
      fertilizer: 'bg-blue-100 text-blue-800',
      pesticide: 'bg-red-100 text-red-800',
      herbicide: 'bg-orange-100 text-orange-800',
      equipment: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStockStatus = (current: number, reorder: number) => {
    if (current <= 0) {
      return <span className="text-red-600 font-medium">Out of Stock</span>;
    } else if (current <= reorder) {
      return <span className="text-orange-600 font-medium">Low Stock</span>;
    }
    return <span className="text-green-600">In Stock</span>;
  };

  const columns = [
    {
      key: 'name',
      label: 'Input Name',
      render: (value: string, row: Input) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            <p className="text-xs text-gray-500">{row.supplier}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => getTypeBadge(value)
    },
    {
      key: 'quantity_in_stock',
      label: 'Stock',
      render: (value: number, row: Input) => (
        <div>
          <span className="font-medium">{value} {row.unit}</span>
          <div className="text-xs">
            {getStockStatus(value, row.reorder_level)}
          </div>
        </div>
      )
    },
    {
      key: 'cost_per_unit',
      label: 'Cost per Unit',
      render: (value: number, row: Input) => `K${value.toFixed(2)}/${row.unit}`
    },
    {
      key: 'reorder_level',
      label: 'Reorder Level',
      render: (value: number, row: Input) => `${value} ${row.unit}`
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : 'No expiry'
    },
    {
      key: 'created_at',
      label: 'Added',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const lowStockInputs = inputs.filter(i => i.quantity_in_stock <= i.reorder_level);
  const outOfStockInputs = inputs.filter(i => i.quantity_in_stock <= 0);
  const totalValue = inputs.reduce((sum, input) => sum + (input.quantity_in_stock * input.cost_per_unit), 0);

  return (
    <Layout title="Input Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Inputs</p>
                <p className="text-xl font-semibold">{inputs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-xl font-semibold">{lowStockInputs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-xl font-semibold">{outOfStockInputs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-semibold">K{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockInputs.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-orange-800">Low Stock Alert</h3>
            </div>
            <p className="text-orange-700 text-sm mb-3">
              The following inputs need to be restocked:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lowStockInputs.slice(0, 6).map(input => (
                <div key={input.id} className="bg-white p-2 rounded border">
                  <span className="font-medium">{input.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({input.quantity_in_stock} {input.unit} remaining)
                  </span>
                </div>
              ))}
            </div>
            {lowStockInputs.length > 6 && (
              <p className="text-orange-600 text-sm mt-2">
                +{lowStockInputs.length - 6} more items need restocking
              </p>
            )}
          </div>
        )}

        {/* Inputs Table */}
        <DataTable
          title="Input Inventory"
          data={inputs}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Add Input"
        />

        {/* Form Modal */}
        {showForm && (
          <InputForm
            input={selectedInput}
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
                  Delete Input
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