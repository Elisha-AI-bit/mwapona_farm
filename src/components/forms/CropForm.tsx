import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import type { Database } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

type Crop = Database['public']['Tables']['crops']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

interface CropFormProps {
  crop?: Crop & { fields?: { name: string } | null };
  onClose: () => void;
  onSave: () => void;
}

export const CropForm: React.FC<CropFormProps> = ({ crop, onClose, onSave }) => {
  const { addCrop, updateCrop, fields } = useData();
  const [formData, setFormData] = useState({
    name: crop?.name || '',
    variety: crop?.variety || '',
    planting_date: crop?.planting_date || '',
    expected_harvest_date: crop?.expected_harvest_date || '',
    field_id: crop?.field_id || '',
    status: crop?.status || 'planted',
    area: crop?.area || 0,
    notes: crop?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Crop name is required';
    }
    if (!formData.variety.trim()) {
      newErrors.variety = 'Variety is required';
    }
    if (!formData.planting_date) {
      newErrors.planting_date = 'Planting date is required';
    }
    if (!formData.expected_harvest_date) {
      newErrors.expected_harvest_date = 'Expected harvest date is required';
    }
    if (formData.area <= 0) {
      newErrors.area = 'Area must be greater than 0';
    }
    if (formData.planting_date && formData.expected_harvest_date) {
      if (new Date(formData.planting_date) >= new Date(formData.expected_harvest_date)) {
        newErrors.expected_harvest_date = 'Harvest date must be after planting date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveCrop = async () => {
      try {
        const cropData = {
          ...formData,
          area: parseFloat(formData.area.toString()),
          field_id: formData.field_id || null
        };

        if (crop) {
          await updateCrop(crop.id, cropData);
        } else {
          await addCrop(cropData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving crop:', error);
        setErrors({ general: 'Failed to save crop. Please try again.' });
      }
    };

    saveCrop();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' ? parseFloat(value) || 0 : value
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
            {crop ? 'Edit Crop' : 'Add New Crop'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Crop Name *
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
              placeholder="e.g., Maize, Soybeans, Tomatoes"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
              Variety *
            </label>
            <input
              type="text"
              id="variety"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.variety ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., SC627, Makwacha, Roma VF"
            />
            {errors.variety && <p className="text-red-500 text-sm mt-1">{errors.variety}</p>}
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
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
              Area (acres) *
            </label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
          </div>

          <div>
            <label htmlFor="planting_date" className="block text-sm font-medium text-gray-700 mb-1">
              Planting Date *
            </label>
            <input
              type="date"
              id="planting_date"
              name="planting_date"
              value={formData.planting_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.planting_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.planting_date && <p className="text-red-500 text-sm mt-1">{errors.planting_date}</p>}
          </div>

          <div>
            <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Harvest Date *
            </label>
            <input
              type="date"
              id="expected_harvest_date"
              name="expected_harvest_date"
              value={formData.expected_harvest_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.expected_harvest_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expected_harvest_date && <p className="text-red-500 text-sm mt-1">{errors.expected_harvest_date}</p>}
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
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="flowering">Flowering</option>
              <option value="harvested">Harvested</option>
            </select>
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
              placeholder="Additional notes about this crop..."
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
              <span>{crop ? 'Update' : 'Add'} Crop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};