import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Database } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

type Input = Database['public']['Tables']['inputs']['Row'];

interface InputFormProps {
  input?: Input;
  onClose: () => void;
  onSave: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ input, onClose, onSave }) => {
  const { addInput, updateInput } = useData();
  const [formData, setFormData] = useState({
    name: input?.name || '',
    type: input?.type || 'seed',
    supplier: input?.supplier || '',
    quantity_in_stock: input?.quantity_in_stock || 0,
    unit: input?.unit || '',
    cost_per_unit: input?.cost_per_unit || 0,
    reorder_level: input?.reorder_level || 0,
    expiry_date: input?.expiry_date || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Input name is required';
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.cost_per_unit < 0) {
      newErrors.cost_per_unit = 'Cost per unit must be 0 or greater';
    }
    if (formData.quantity_in_stock < 0) {
      newErrors.quantity_in_stock = 'Quantity must be 0 or greater';
    }
    if (formData.reorder_level < 0) {
      newErrors.reorder_level = 'Reorder level must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveInput = async () => {
      try {
        const inputData = {
          ...formData,
          quantity_in_stock: parseFloat(formData.quantity_in_stock.toString()),
          cost_per_unit: parseFloat(formData.cost_per_unit.toString()),
          reorder_level: parseFloat(formData.reorder_level.toString()),
          expiry_date: formData.expiry_date || null
        };

        if (input) {
          await updateInput(input.id, inputData);
        } else {
          await addInput(inputData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving input:', error);
        setErrors({ general: 'Failed to save input. Please try again.' });
      }
    };

    saveInput();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['quantity_in_stock', 'cost_per_unit', 'reorder_level'].includes(name) 
        ? parseFloat(value) || 0 
        : value
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
            {input ? 'Edit Input' : 'Add New Input'}
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
              Input Name *
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
              placeholder="e.g., Maize Seeds, NPK Fertilizer"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="seed">Seed</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="pesticide">Pesticide</option>
              <option value="herbicide">Herbicide</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.supplier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., AgriSupply Ltd, Local Supplier"
            />
            {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
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
              placeholder="e.g., kg, bags, liters"
            />
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
          </div>

          <div>
            <label htmlFor="quantity_in_stock" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity in Stock
            </label>
            <input
              type="number"
              id="quantity_in_stock"
              name="quantity_in_stock"
              value={formData.quantity_in_stock}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.quantity_in_stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.quantity_in_stock && <p className="text-red-500 text-sm mt-1">{errors.quantity_in_stock}</p>}
          </div>

          <div>
            <label htmlFor="cost_per_unit" className="block text-sm font-medium text-gray-700 mb-1">
              Cost per Unit (K)
            </label>
            <input
              type="number"
              id="cost_per_unit"
              name="cost_per_unit"
              value={formData.cost_per_unit}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.cost_per_unit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.cost_per_unit && <p className="text-red-500 text-sm mt-1">{errors.cost_per_unit}</p>}
          </div>

          <div>
            <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              id="reorder_level"
              name="reorder_level"
              value={formData.reorder_level}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.reorder_level ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.reorder_level && <p className="text-red-500 text-sm mt-1">{errors.reorder_level}</p>}
          </div>

          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              id="expiry_date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
              <span>{input ? 'Update' : 'Add'} Input</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};