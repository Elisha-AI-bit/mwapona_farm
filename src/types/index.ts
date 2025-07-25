export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  full_name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Field {
  id: string;
  name: string;
  size: number; // in acres
  location: string;
  soil_type: string;
  irrigation_system?: string;
  status: 'active' | 'resting' | 'maintenance';
  created_at: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  planting_date: string;
  expected_harvest_date: string;
  field_id: string;
  status: 'planted' | 'growing' | 'flowering' | 'harvested';
  area: number; // in acres
  notes?: string;
  created_at: string;
}

export interface Livestock {
  id: string;
  type: 'cattle' | 'goats' | 'sheep' | 'pigs' | 'chickens' | 'other';
  breed: string;
  tag: string;
  date_of_birth?: string;
  gender: 'male' | 'female';
  weight?: number;
  health_status: 'healthy' | 'sick' | 'quarantine' | 'deceased';
  vaccinations: string[];
  reproduction_status?: 'pregnant' | 'lactating' | 'breeding' | 'none';
  notes?: string;
  created_at: string;
}

export interface Input {
  id: string;
  name: string;
  type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'equipment' | 'other';
  supplier: string;
  quantity_in_stock: number;
  unit: string;
  cost_per_unit: number;
  reorder_level: number;
  expiry_date?: string;
  created_at: string;
}

export interface InputUsage {
  id: string;
  input_id: string;
  field_id?: string;
  crop_id?: string;
  quantity: number;
  date_used: string;
  purpose: string;
  applied_by: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  harvest_date?: string;
  expiry_date?: string;
  status: 'available' | 'sold' | 'reserved' | 'damaged';
  created_at: string;
}

export interface Harvest {
  id: string;
  crop_id: string;
  field_id: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  storage_location: string;
  harvested_by: string;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  due_date: string;
  start_date?: string;
  completed_date?: string;
  field_id?: string;
  crop_id?: string;
  livestock_id?: string;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  sale_date: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
  payment_status: 'paid' | 'pending' | 'partial' | 'overdue';
  delivery_status: 'pending' | 'delivered' | 'picked_up';
  notes?: string;
  created_at: string;
}

export interface LivestockProduction {
  id: string;
  livestock_id: string;
  production_type: 'milk' | 'eggs' | 'meat' | 'offspring';
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}