import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Database } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

type Field = Database['public']['Tables']['fields']['Row'];

interface FieldFormProps {
  field?: Field;
  onClose: () => void;
  onSave: () => void;
}

export const FieldForm: React.FC<FieldFormProps> = ({ field, onClose, onSave }) => {
  const { addField, updateField } = useData();
  const [formData, setFormData] = useState({
    name: field?.name || '',
    size: field?.size || 0,
    location: field?.location || '',
    soil_type: field?.soil_type || '',
    irrigation_system: field?.irrigation_system || '',
    status: field?.status || 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
    }
    if (formData.size <= 0) {
      newErrors.size = 'Field size must be greater than 0';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.soil_type.trim()) {
      newErrors.soil_type = 'Soil type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveField = async () => {
      try {
        if (field) {
          await updateField(field.id, formData);
        } else {
          await addField(formData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving field:', error);
        setErrors({ general: 'Failed to save field. Please try again.' });
      }
    };

    saveField();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'size' ? parseFloat(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {field ? 'Edit Field' : 'Add New Field'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Field Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., North Field, Field A"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              Size (acres) *
            </label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.size ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., North of farmhouse, Plot 123"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700 mb-1">
              Soil Type *
            </label>
            <select
              id="soil_type"
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.soil_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select soil type</option>
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sandy">Sandy</option>
              <option value="silt">Silt</option>
              <option value="sandy-loam">Sandy Loam</option>
              <option value="clay-loam">Clay Loam</option>
            </select>
            {errors.soil_type && <p className="text-red-500 text-sm mt-1">{errors.soil_type}</p>}
          </div>

          <div>
            <label htmlFor="irrigation_system" className="block text-sm font-medium text-gray-700 mb-1">
              Irrigation System
            </label>
            <select
              id="irrigation_system"
              name="irrigation_system"
              value={formData.irrigation_system}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="">None / Rain-fed</option>
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="flood">Flood Irrigation</option>
              <option value="furrow">Furrow Irrigation</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="active">Active</option>
              <option value="resting">Resting</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{field ? 'Update' : 'Add'} Field</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};