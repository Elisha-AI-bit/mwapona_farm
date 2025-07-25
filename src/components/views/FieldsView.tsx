import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { FieldForm } from '../forms/FieldForm';
import type { Database } from '../../lib/supabase';
import { MapPin, Droplets, Activity } from 'lucide-react';

type Field = Database['public']['Tables']['fields']['Row'];

export const FieldsView: React.FC = () => {
  const { user } = useAuth();
  const { fields, deleteField } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Field | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager';

  const handleAdd = () => {
    setSelectedField(undefined);
    setShowForm(true);
  };

  const handleEdit = (field: Field) => {
    setSelectedField(field);
    setShowForm(true);
  };

  const handleDelete = (field: Field) => {
    setShowDeleteConfirm(field);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteField(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting field:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedField(undefined);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      resting: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getIrrigationIcon = (system: string) => {
    if (!system || system === 'None / Rain-fed') return null;
    return <Droplets className="h-4 w-4 text-blue-500" title={system} />;
  };

  const columns = [
    {
      key: 'name',
      label: 'Field Name',
      render: (value: string, row: Field) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'size',
      label: 'Size (acres)',
      render: (value: number) => `${value.toFixed(1)} acres`
    },
    {
      key: 'location',
      label: 'Location'
    },
    {
      key: 'soil_type',
      label: 'Soil Type',
      render: (value: string) => (
        <span className="capitalize">{value.replace('-', ' ')}</span>
      )
    },
    {
      key: 'irrigation_system',
      label: 'Irrigation',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          {getIrrigationIcon(value)}
          <span className={!value || value === 'None / Rain-fed' ? 'text-gray-500' : ''}>
            {!value || value === '' ? 'Rain-fed' : value}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <Layout title="Field Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Fields</p>
                <p className="text-xl font-semibold">{fields.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Fields</p>
                <p className="text-xl font-semibold">
                  {fields.filter(f => f.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-xl font-semibold">
                  {fields.reduce((sum, field) => sum + field.size, 0).toFixed(1)} acres
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Irrigated Fields</p>
                <p className="text-xl font-semibold">
                  {fields.filter(f => f.irrigation_system && f.irrigation_system !== '').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fields Table */}
        <DataTable
          title="Field Records"
          data={fields}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Add Field"
        />

        {/* Form Modal */}
        {showForm && (
          <FieldForm
            field={selectedField}
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
                  Delete Field
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