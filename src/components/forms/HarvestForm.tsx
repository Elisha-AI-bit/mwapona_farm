import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import type { Database } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

type Harvest = Database['public']['Tables']['harvests']['Row'];

interface HarvestFormProps {
  harvest?: Harvest & { 
    crops?: { name: string } | null;
    fields?: { name: string } | null;
    harvested_by_profile?: { full_name: string } | null;
  };
  onClose: () => void;
  onSave: () => void;
}

export const HarvestForm: React.FC<HarvestFormProps> = ({ harvest, onClose, onSave }) => {
  const { user } = useAuth();
  const { addHarvest, updateHarvest, crops, fields } = useData();
  const [formData, setFormData] = useState({
    crop_id: harvest?.crop_id || '',
    field_id: harvest?.field_id || '',
    harvest_date: harvest?.harvest_date || '',
    quantity: harvest?.quantity || 0,
    unit: harvest?.unit || '',
    quality: harvest?.quality || 'good',
    storage_location: harvest?.storage_location || '',
    harvested_by: harvest?.harvested_by || user?.id || '',
    notes: harvest?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.harvest_date) {
      newErrors.harvest_date = 'Harvest date is required';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (!formData.storage_location.trim()) {
      newErrors.storage_location = 'Storage location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveHarvest = async () => {
      try {
        const harvestData = {
          ...formData,
          quantity: parseFloat(formData.quantity.toString()),
          crop_id: formData.crop_id || null,
          field_id: formData.field_id || null,
          harvested_by: formData.harvested_by || null
        };

        if (harvest) {
          await updateHarvest(harvest.id, harvestData);
        } else {
          await addHarvest(harvestData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving harvest:', error);
        setErrors({ general: 'Failed to save harvest. Please try again.' });
      }
    };

    saveHarvest();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
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
            {harvest ? 'Edit Harvest' : 'Record New Harvest'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="crop_id" className="block text-sm font-medium text-gray-700 mb-1">
              Crop
            </label>
            <select
              id="crop_id"
              name="crop_id"
              value={formData.crop_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a crop</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.variety})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="field_id" className="block text-sm font-medium text-gray-700 mb-1">
              Field
            </label>
            <select
              id="field_id"
              name="field_id"
              value={formData.field_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a field</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.name} ({field.size} acres)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Date *
            </label>
            <input
              type="date"
              id="harvest_date"
              name="harvest_date"
              value={formData.harvest_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.harvest_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.harvest_date && <p className="text-red-500 text-sm mt-1">{errors.harvest_date}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.unit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., kg, bags, tons"
            />
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
          </div>

          <div>
            <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
              Quality
            </label>
            <select
              id="quality"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label htmlFor="storage_location" className="block text-sm font-medium text-gray-700 mb-1">
              Storage Location *
            </label>
            <input
              type="text"
              id="storage_location"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.storage_location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Warehouse A, Storage Room 1"
            />
            {errors.storage_location && <p className="text-red-500 text-sm mt-1">{errors.storage_location}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Additional notes about this harvest..."
            />
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
              <span>{harvest ? 'Update' : 'Record'} Harvest</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};