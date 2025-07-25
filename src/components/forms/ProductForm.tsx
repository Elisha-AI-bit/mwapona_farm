import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Database } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSave: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
  const { addProduct, updateProduct } = useData();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || '',
    description: product?.description || '',
    price_per_unit: product?.price_per_unit || 0,
    unit: product?.unit || '',
    quantity_available: product?.quantity_available || 0,
    harvest_date: product?.harvest_date || '',
    expiry_date: product?.expiry_date || '',
    status: product?.status || 'available'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Product type is required';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.price_per_unit <= 0) {
      newErrors.price_per_unit = 'Price per unit must be greater than 0';
    }
    if (formData.quantity_available < 0) {
      newErrors.quantity_available = 'Quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveProduct = async () => {
      try {
        const productData = {
          ...formData,
          price_per_unit: parseFloat(formData.price_per_unit.toString()),
          quantity_available: parseFloat(formData.quantity_available.toString()),
          harvest_date: formData.harvest_date || null,
          expiry_date: formData.expiry_date || null
        };

        if (product) {
          await updateProduct(product.id, productData);
        } else {
          await addProduct(productData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving product:', error);
        setErrors({ general: 'Failed to save product. Please try again.' });
      }
    };

    saveProduct();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price_per_unit', 'quantity_available'].includes(name) 
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
            {product ? 'Edit Product' : 'Add New Product'}
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
              Product Name *
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
              placeholder="e.g., Fresh Tomatoes, Maize Grain"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Product Type *
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Vegetable, Grain, Fruit"
            />
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Product description..."
            />
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
              placeholder="e.g., kg, bags, pieces"
            />
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
          </div>

          <div>
            <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit (K) *
            </label>
            <input
              type="number"
              id="price_per_unit"
              name="price_per_unit"
              value={formData.price_per_unit}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.price_per_unit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price_per_unit && <p className="text-red-500 text-sm mt-1">{errors.price_per_unit}</p>}
          </div>

          <div>
            <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Available
            </label>
            <input
              type="number"
              id="quantity_available"
              name="quantity_available"
              value={formData.quantity_available}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.quantity_available ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.quantity_available && <p className="text-red-500 text-sm mt-1">{errors.quantity_available}</p>}
          </div>

          <div>
            <label htmlFor="harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Date
            </label>
            <input
              type="date"
              id="harvest_date"
              name="harvest_date"
              value={formData.harvest_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
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
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
              <option value="damaged">Damaged</option>
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
              <span>{product ? 'Update' : 'Add'} Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};