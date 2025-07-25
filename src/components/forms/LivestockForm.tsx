import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Database } from '../../lib/supabase';
import { X, Save, Plus, Trash2 } from 'lucide-react';

type Livestock = Database['public']['Tables']['livestock']['Row'];

interface LivestockFormProps {
  livestock?: Livestock;
  onClose: () => void;
  onSave: () => void;
}

export const LivestockForm: React.FC<LivestockFormProps> = ({ livestock, onClose, onSave }) => {
  const { addLivestock, updateLivestock } = useData();
  const [formData, setFormData] = useState({
    type: livestock?.type || 'cattle',
    breed: livestock?.breed || '',
    tag: livestock?.tag || '',
    date_of_birth: livestock?.date_of_birth || '',
    gender: livestock?.gender || 'female',
    weight: livestock?.weight || null,
    health_status: livestock?.health_status || 'healthy',
    reproduction_status: livestock?.reproduction_status || '',
    notes: livestock?.notes || ''
  });
  const [vaccinations, setVaccinations] = useState<string[]>(livestock?.vaccinations || []);
  const [newVaccination, setNewVaccination] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }
    if (!formData.tag.trim()) {
      newErrors.tag = 'Tag is required';
    }
    if (formData.weight !== null && formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saveLivestock = async () => {
      try {
        const livestockData = {
          ...formData,
          weight: formData.weight ? parseFloat(formData.weight.toString()) : null,
          vaccinations,
          reproduction_status: formData.reproduction_status || null
        };

        if (livestock) {
          await updateLivestock(livestock.id, livestockData);
        } else {
          await addLivestock(livestockData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving livestock:', error);
        setErrors({ general: 'Failed to save animal. Please try again.' });
      }
    };

    saveLivestock();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' ? (value ? parseFloat(value) : null) : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addVaccination = () => {
    if (newVaccination.trim() && !vaccinations.includes(newVaccination.trim())) {
      setVaccinations([...vaccinations, newVaccination.trim()]);
      setNewVaccination('');
    }
  };

  const removeVaccination = (index: number) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {livestock ? 'Edit Animal' : 'Add New Animal'}
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Animal Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="cattle">Cattle</option>
              <option value="goats">Goats</option>
              <option value="sheep">Sheep</option>
              <option value="pigs">Pigs</option>
              <option value="chickens">Chickens</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
              Breed *
            </label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.breed ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Brahman, Boer, Large White"
            />
            {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
              Tag/ID *
            </label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.tag ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., C001, G001, P001"
            />
            {errors.tag && <p className="text-red-500 text-sm mt-1">{errors.tag}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
          </div>

          <div>
            <label htmlFor="health_status" className="block text-sm font-medium text-gray-700 mb-1">
              Health Status
            </label>
            <select
              id="health_status"
              name="health_status"
              value={formData.health_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="healthy">Healthy</option>
              <option value="sick">Sick</option>
              <option value="quarantine">Quarantine</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <div>
            <label htmlFor="reproduction_status" className="block text-sm font-medium text-gray-700 mb-1">
              Reproduction Status
            </label>
            <select
              id="reproduction_status"
              name="reproduction_status"
              value={formData.reproduction_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="">None</option>
              <option value="pregnant">Pregnant</option>
              <option value="lactating">Lactating</option>
              <option value="breeding">Breeding</option>
            </select>
          </div>

          {/* Vaccinations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaccinations
            </label>
            <div className="space-y-2">
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm">{vaccination}</span>
                  <button
                    type="button"
                    onClick={() => removeVaccination(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newVaccination}
                  onChange={(e) => setNewVaccination(e.target.value)}
                  placeholder="Add vaccination"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVaccination())}
                />
                <button
                  type="button"
                  onClick={addVaccination}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
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
              placeholder="Additional notes about this animal..."
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
              <span>{livestock ? 'Update' : 'Add'} Animal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};