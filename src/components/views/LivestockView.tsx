import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import { LivestockForm } from '../forms/LivestockForm';
import type { Database } from '../../lib/supabase';
import { Cog as Cow, Heart, AlertTriangle, Activity } from 'lucide-react';

type Livestock = Database['public']['Tables']['livestock']['Row'];

export const LivestockView: React.FC = () => {
  const { user } = useAuth();
  const { livestock, deleteLivestock } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedLivestock, setSelectedLivestock] = useState<Livestock | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Livestock | null>(null);

  const canModify = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  const handleAdd = () => {
    setSelectedLivestock(undefined);
    setShowForm(true);
  };

  const handleEdit = (animal: Livestock) => {
    setSelectedLivestock(animal);
    setShowForm(true);
  };

  const handleDelete = (animal: Livestock) => {
    setShowDeleteConfirm(animal);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteLivestock(showDeleteConfirm.id);
      } catch (error) {
        console.error('Error deleting livestock:', error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedLivestock(undefined);
  };

  const getHealthBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      quarantine: 'bg-yellow-100 text-yellow-800',
      deceased: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    return <Cow className="h-4 w-4 text-gray-400" />;
  };

  const columns = [
    {
      key: 'tag',
      label: 'Tag',
      render: (value: string, row: Livestock) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(row.type)}
          <div>
            <span className="font-medium">{value}</span>
            <p className="text-xs text-gray-500 capitalize">{row.type}</p>
          </div>
        </div>
      )
    },
    {
      key: 'breed',
      label: 'Breed',
      render: (value: string) => <span className="capitalize">{value}</span>
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (value: string) => <span className="capitalize">{value}</span>
    },
    {
      key: 'weight',
      label: 'Weight',
      render: (value: number | null) => value ? `${value} kg` : 'Not recorded'
    },
    {
      key: 'health_status',
      label: 'Health Status',
      render: (value: string) => getHealthBadge(value)
    },
    {
      key: 'date_of_birth',
      label: 'Date of Birth',
      render: (value: string | null) => value ? new Date(value).toLocaleDateString() : 'Unknown'
    },
    {
      key: 'reproduction_status',
      label: 'Reproduction',
      render: (value: string | null) => value ? (
        <span className="capitalize">{value}</span>
      ) : (
        <span className="text-gray-500">None</span>
      )
    }
  ];

  const healthyCount = livestock.filter(l => l.health_status === 'healthy').length;
  const sickCount = livestock.filter(l => l.health_status === 'sick').length;
  const typeGroups = livestock.reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout title="Livestock Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cow className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Animals</p>
                <p className="text-xl font-semibold">{livestock.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Healthy</p>
                <p className="text-xl font-semibold">{healthyCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-xl font-semibold">{sickCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Types</p>
                <p className="text-xl font-semibold">{Object.keys(typeGroups).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Type Breakdown */}
        {Object.keys(typeGroups).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Livestock by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(typeGroups).map(([type, count]) => (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Livestock Table */}
        <DataTable
          title="Livestock Records"
          data={livestock}
          columns={columns}
          onAdd={canModify ? handleAdd : undefined}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
          addButtonText="Add Animal"
        />

        {/* Form Modal */}
        {showForm && (
          <LivestockForm
            livestock={selectedLivestock}
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
                  Delete Animal
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete animal "{showDeleteConfirm.tag}" ({showDeleteConfirm.breed})? This action cannot be undone.
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