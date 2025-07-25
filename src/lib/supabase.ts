import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'manager' | 'staff' | 'customer';
          full_name: string;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'admin' | 'manager' | 'staff' | 'customer';
          full_name: string;
          email?: string | null;
          phone?: string | null;
        };
        Update: {
          username?: string;
          role?: 'admin' | 'manager' | 'staff' | 'customer';
          full_name?: string;
          email?: string | null;
          phone?: string | null;
        };
      };
      fields: {
        Row: {
          id: string;
          name: string;
          size: number;
          location: string;
          soil_type: string;
          irrigation_system: string | null;
          status: 'active' | 'resting' | 'maintenance';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          size: number;
          location: string;
          soil_type: string;
          irrigation_system?: string | null;
          status?: 'active' | 'resting' | 'maintenance';
        };
        Update: {
          name?: string;
          size?: number;
          location?: string;
          soil_type?: string;
          irrigation_system?: string | null;
          status?: 'active' | 'resting' | 'maintenance';
        };
      };
      crops: {
        Row: {
          id: string;
          name: string;
          variety: string;
          planting_date: string;
          expected_harvest_date: string;
          field_id: string | null;
          status: 'planted' | 'growing' | 'flowering' | 'harvested';
          area: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          variety: string;
          planting_date: string;
          expected_harvest_date: string;
          field_id?: string | null;
          status?: 'planted' | 'growing' | 'flowering' | 'harvested';
          area: number;
          notes?: string | null;
        };
        Update: {
          name?: string;
          variety?: string;
          planting_date?: string;
          expected_harvest_date?: string;
          field_id?: string | null;
          status?: 'planted' | 'growing' | 'flowering' | 'harvested';
          area?: number;
          notes?: string | null;
        };
      };
      livestock: {
        Row: {
          id: string;
          type: 'cattle' | 'goats' | 'sheep' | 'pigs' | 'chickens' | 'other';
          breed: string;
          tag: string;
          date_of_birth: string | null;
          gender: string;
          weight: number | null;
          health_status: 'healthy' | 'sick' | 'quarantine' | 'deceased';
          vaccinations: string[];
          reproduction_status: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          type: 'cattle' | 'goats' | 'sheep' | 'pigs' | 'chickens' | 'other';
          breed: string;
          tag: string;
          date_of_birth?: string | null;
          gender: string;
          weight?: number | null;
          health_status?: 'healthy' | 'sick' | 'quarantine' | 'deceased';
          vaccinations?: string[];
          reproduction_status?: string | null;
          notes?: string | null;
        };
        Update: {
          type?: 'cattle' | 'goats' | 'sheep' | 'pigs' | 'chickens' | 'other';
          breed?: string;
          tag?: string;
          date_of_birth?: string | null;
          gender?: string;
          weight?: number | null;
          health_status?: 'healthy' | 'sick' | 'quarantine' | 'deceased';
          vaccinations?: string[];
          reproduction_status?: string | null;
          notes?: string | null;
        };
      };
      inputs: {
        Row: {
          id: string;
          name: string;
          type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'equipment' | 'other';
          supplier: string;
          quantity_in_stock: number;
          unit: string;
          cost_per_unit: number;
          reorder_level: number;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'equipment' | 'other';
          supplier: string;
          quantity_in_stock?: number;
          unit: string;
          cost_per_unit: number;
          reorder_level?: number;
          expiry_date?: string | null;
        };
        Update: {
          name?: string;
          type?: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'equipment' | 'other';
          supplier?: string;
          quantity_in_stock?: number;
          unit?: string;
          cost_per_unit?: number;
          reorder_level?: number;
          expiry_date?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          price_per_unit: number;
          unit: string;
          quantity_available: number;
          harvest_date: string | null;
          expiry_date: string | null;
          status: 'available' | 'sold' | 'reserved' | 'damaged';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          type: string;
          description?: string | null;
          price_per_unit: number;
          unit: string;
          quantity_available?: number;
          harvest_date?: string | null;
          expiry_date?: string | null;
          status?: 'available' | 'sold' | 'reserved' | 'damaged';
        };
        Update: {
          name?: string;
          type?: string;
          description?: string | null;
          price_per_unit?: number;
          unit?: string;
          quantity_available?: number;
          harvest_date?: string | null;
          expiry_date?: string | null;
          status?: 'available' | 'sold' | 'reserved' | 'damaged';
        };
      };
      sales: {
        Row: {
          id: string;
          product_id: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          quantity: number;
          price_per_unit: number;
          total_amount: number;
          sale_date: string;
          payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
          payment_status: 'paid' | 'pending' | 'partial' | 'overdue';
          delivery_status: 'pending' | 'delivered' | 'picked_up';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          product_id: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          quantity: number;
          price_per_unit: number;
          total_amount: number;
          sale_date: string;
          payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
          payment_status?: 'paid' | 'pending' | 'partial' | 'overdue';
          delivery_status?: 'pending' | 'delivered' | 'picked_up';
          notes?: string | null;
        };
        Update: {
          product_id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string | null;
          quantity?: number;
          price_per_unit?: number;
          total_amount?: number;
          sale_date?: string;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
          payment_status?: 'paid' | 'pending' | 'partial' | 'overdue';
          delivery_status?: 'pending' | 'delivered' | 'picked_up';
          notes?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          assigned_by: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          due_date: string;
          start_date: string | null;
          completed_date: string | null;
          field_id: string | null;
          crop_id: string | null;
          livestock_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          assigned_by?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          due_date: string;
          start_date?: string | null;
          completed_date?: string | null;
          field_id?: string | null;
          crop_id?: string | null;
          livestock_id?: string | null;
          notes?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          assigned_by?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          due_date?: string;
          start_date?: string | null;
          completed_date?: string | null;
          field_id?: string | null;
          crop_id?: string | null;
          livestock_id?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}