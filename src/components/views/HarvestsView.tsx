import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { HarvestForm } from '../forms/HarvestForm';
import type { Database } from '../../lib/supabase';
import { Wheat, Calendar, MapPin, User, Star } from 'lucide-react';

type Harvest = Database['public']['Tables']['harvests']['Row'];
type HarvestWithDetails = Harvest & {
  crops?: { name: string } | null;
  fields?: { name: string } | null;
  harvested_by_profile?: { full_name: string } | null;
};

export const HarvestsView: React.FC = () => {
  const { user } = useAuth();
  const { harvests, deleteHarvest } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestWithDetails | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<HarvestWithDetails | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  const handleAdd = () => {
    setSelectedHarvest(undefined);
    setShowForm(true);
  };

  const handleEdit = (harvest: HarvestWithDetails) => {
    setSelectedHarvest(harvest);
    setShowForm(true);
  };

  const handleDelete = (harvest: HarvestWithDetails) => {
    setShowDeleteConfirm(harvest);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteHarvest(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting harvest:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedHarvest(undefined);
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[quality as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {quality.charAt(0).toUpperCase() + quality.slice(1)}
      </span>
    );
  };

  const getQualityStars = (quality: string) => {
    const stars = {
      excellent: 5,
      good: 4,
      fair: 3,
      poor: 2
    };
    const starCount = stars[quality as keyof typeof stars] || 0;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < starCount ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'harvest_date',
      label: 'Harvest Date',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'crops',
      label: 'Crop',
      render: (value: any, row: HarvestWithDetails) => (
        <div className="flex items-center space-x-2">
          <Wheat className="h-4 w-4 text-gray-400" />
          <span>{row.crops?.name || 'Unknown Crop'}</span>
        </div>
      )
    },
    {
      key: 'fields',
      label: 'Field',
      render: (value: any, row: HarvestWithDetails) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{row.fields?.name || 'Unknown Field'}</span>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value: number, row: HarvestWithDetails) => (
        <span className="font-medium">{value} {row.unit}</span>
      )
    },
    {
      key: 'quality',
      label: 'Quality',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getQualityBadge(value)}
          {getQualityStars(value)}
        </div>
      )
    },
    {
      key: 'storage_location',
      label: 'Storage',
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: 'harvested_by_profile',
      label: 'Harvested By',
      render: (value: any, row: HarvestWithDetails) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.harvested_by_profile?.full_name || 'Unknown'}</span>
        </div>
      )
    }
  ];

  const totalQuantity = harvests.reduce((sum, harvest) => sum + harvest.quantity, 0);
  const recentHarvests = harvests.filter(h => {
    const harvestDate = new Date(h.harvest_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return harvestDate >= thirtyDaysAgo;
  }).length;

  const qualityDistribution = harvests.reduce((acc, harvest) => {
    acc[harvest.quality] = (acc[harvest.quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout title="Harvest Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wheat className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Harvests</p>
                <p className="text-xl font-semibold">{harvests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent (30 days)</p>
                <p className="text-xl font-semibold">{recentHarvests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wheat className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-xl font-semibold">{totalQuantity.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Excellent Quality</p>
                <p className="text-xl font-semibold">{qualityDistribution.excellent || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Distribution */}
        {Object.keys(qualityDistribution).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(qualityDistribution).map(([quality, count]) => (
                <div key={quality} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getQualityStars(quality)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{quality}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harvests Table */}
        <DataTable
          title="Harvest Records"
          data={harvests}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Record Harvest"
        />

        {/* Form Modal */}
        {showForm && (
          <HarvestForm
            harvest={selectedHarvest}
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
                  Delete Harvest Record
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this harvest record from {new Date(showDeleteConfirm.harvest_date).toLocaleDateString()}? This action cannot be undone.
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