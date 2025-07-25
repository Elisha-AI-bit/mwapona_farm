import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { CropForm } from '../forms/CropForm';
import type { Database } from '../../lib/supabase';
import { Wheat, Calendar, MapPin, Activity } from 'lucide-react';

type Crop = Database['public']['Tables']['crops']['Row'];
type CropWithField = Crop & { fields?: { name: string } | null };

export const CropsView: React.FC = () => {
  const { user } = useAuth();
  const { crops, deleteCrop } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropWithField | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<CropWithField | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  const handleAdd = () => {
    setSelectedCrop(undefined);
    setShowForm(true);
  };

  const handleEdit = (crop: CropWithField) => {
    setSelectedCrop(crop);
    setShowForm(true);
  };

  const handleDelete = (crop: CropWithField) => {
    setShowDeleteConfirm(crop);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteCrop(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting crop:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCrop(undefined);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      planted: 'bg-blue-100 text-blue-800',
      growing: 'bg-green-100 text-green-800',
      flowering: 'bg-yellow-100 text-yellow-800',
      harvested: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Crop Name',
      render: (value: string, row: CropWithField) => (
        <div className="flex items-center space-x-2">
          <Wheat className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            <p className="text-xs text-gray-500">{row.variety}</p>
          </div>
        </div>
      )
    },
    {
      key: 'fields',
      label: 'Field',
      render: (value: any, row: CropWithField) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{row.fields?.name || 'No field assigned'}</span>
        </div>
      )
    },
    {
      key: 'area',
      label: 'Area (acres)',
      render: (value: number) => `${value.toFixed(1)} acres`
    },
    {
      key: 'planting_date',
      label: 'Planted',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'expected_harvest_date',
      label: 'Expected Harvest',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const activeCrops = crops.filter(c => c.status !== 'harvested');
  const totalArea = crops.reduce((sum, crop) => sum + crop.area, 0);

  return (
    <Layout title="Crop Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wheat className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Crops</p>
                <p className="text-xl font-semibold">{crops.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Crops</p>
                <p className="text-xl font-semibold">{activeCrops.length}</p>
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
                <p className="text-xl font-semibold">{totalArea.toFixed(1)} acres</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ready to Harvest</p>
                <p className="text-xl font-semibold">
                  {crops.filter(c => c.status === 'flowering').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crops Table */}
        <DataTable
          title="Crop Records"
          data={crops}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Add Crop"
        />

        {/* Form Modal */}
        {showForm && (
          <CropForm
            crop={selectedCrop}
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
                  Delete Crop
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{showDeleteConfirm.name} ({showDeleteConfirm.variety})"? This action cannot be undone.
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