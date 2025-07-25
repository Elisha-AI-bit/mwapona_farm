/*
  # Farm Management System Database Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `fields` - Farm field information
    - `crops` - Crop planting and management
    - `livestock` - Animal inventory and health tracking
    - `inputs` - Farm inputs (seeds, fertilizers, etc.)
    - `input_usage` - Track input consumption
    - `products` - Products available for sale
    - `harvests` - Harvest records
    - `tasks` - Task management
    - `sales` - Sales transactions
    - `livestock_production` - Animal production records
    - `customers` - Customer information

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'customer');
CREATE TYPE field_status AS ENUM ('active', 'resting', 'maintenance');
CREATE TYPE crop_status AS ENUM ('planted', 'growing', 'flowering', 'harvested');
CREATE TYPE livestock_type AS ENUM ('cattle', 'goats', 'sheep', 'pigs', 'chickens', 'other');
CREATE TYPE health_status AS ENUM ('healthy', 'sick', 'quarantine', 'deceased');
CREATE TYPE input_type AS ENUM ('seed', 'fertilizer', 'pesticide', 'herbicide', 'equipment', 'other');
CREATE TYPE product_status AS ENUM ('available', 'sold', 'reserved', 'damaged');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'bank_transfer', 'credit');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'partial', 'overdue');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'picked_up');
CREATE TYPE production_type AS ENUM ('milk', 'eggs', 'meat', 'offspring');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size decimal NOT NULL CHECK (size > 0),
  location text NOT NULL,
  soil_type text NOT NULL,
  irrigation_system text,
  status field_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  variety text NOT NULL,
  planting_date date NOT NULL,
  expected_harvest_date date NOT NULL,
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  status crop_status DEFAULT 'planted',
  area decimal NOT NULL CHECK (area > 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Livestock table
CREATE TABLE IF NOT EXISTS livestock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type livestock_type NOT NULL,
  breed text NOT NULL,
  tag text UNIQUE NOT NULL,
  date_of_birth date,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  weight decimal,
  health_status health_status DEFAULT 'healthy',
  vaccinations text[] DEFAULT '{}',
  reproduction_status text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inputs table
CREATE TABLE IF NOT EXISTS inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type input_type NOT NULL,
  supplier text NOT NULL,
  quantity_in_stock decimal NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost_per_unit decimal NOT NULL CHECK (cost_per_unit >= 0),
  reorder_level decimal NOT NULL DEFAULT 0,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Input usage table
CREATE TABLE IF NOT EXISTS input_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id uuid REFERENCES inputs(id) ON DELETE CASCADE,
  field_id uuid REFERENCES fields(id) ON DELETE SET NULL,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  quantity decimal NOT NULL CHECK (quantity > 0),
  date_used date NOT NULL,
  purpose text NOT NULL,
  applied_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  price_per_unit decimal NOT NULL CHECK (price_per_unit >= 0),
  unit text NOT NULL,
  quantity_available decimal NOT NULL DEFAULT 0,
  harvest_date date,
  expiry_date date,
  status product_status DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Harvests table
CREATE TABLE IF NOT EXISTS harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  harvest_date date NOT NULL,
  quantity decimal NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  quality text NOT NULL CHECK (quality IN ('excellent', 'good', 'fair', 'poor')),
  storage_location text NOT NULL,
  harvested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  due_date date NOT NULL,
  start_date date,
  completed_date date,
  field_id uuid REFERENCES fields(id) ON DELETE SET NULL,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  livestock_id uuid REFERENCES livestock(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  quantity decimal NOT NULL CHECK (quantity > 0),
  price_per_unit decimal NOT NULL CHECK (price_per_unit >= 0),
  total_amount decimal NOT NULL CHECK (total_amount >= 0),
  sale_date date NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  delivery_status delivery_status DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Livestock production table
CREATE TABLE IF NOT EXISTS livestock_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id uuid REFERENCES livestock(id) ON DELETE CASCADE,
  production_type production_type NOT NULL,
  quantity decimal NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_production ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fields policies
CREATE POLICY "All authenticated users can read fields" ON fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and managers can manage fields" ON fields FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Crops policies
CREATE POLICY "All authenticated users can read crops" ON crops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage crops" ON crops FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Livestock policies
CREATE POLICY "All authenticated users can read livestock" ON livestock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage livestock" ON livestock FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Inputs policies
CREATE POLICY "All authenticated users can read inputs" ON inputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage inputs" ON inputs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Input usage policies
CREATE POLICY "All authenticated users can read input usage" ON input_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage input usage" ON input_usage FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Products policies
CREATE POLICY "All users can read available products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage products" ON products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Harvests policies
CREATE POLICY "All authenticated users can read harvests" ON harvests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage harvests" ON harvests FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Tasks policies
CREATE POLICY "Users can read tasks assigned to them or all if admin/manager" ON tasks FOR SELECT TO authenticated USING (
  assigned_to = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admin and managers can manage all tasks" ON tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Staff can update their assigned tasks" ON tasks FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid()
);

-- Customers policies
CREATE POLICY "Admin and managers can read customers" ON customers FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admin and managers can manage customers" ON customers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Sales policies
CREATE POLICY "Admin and managers can read all sales" ON sales FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Customers can read their own sales" ON sales FOR SELECT TO authenticated USING (
  customer_id IN (SELECT id FROM customers WHERE id = auth.uid())
);
CREATE POLICY "Admin, managers, and staff can manage sales" ON sales FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Livestock production policies
CREATE POLICY "All authenticated users can read livestock production" ON livestock_production FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin, managers, and staff can manage livestock production" ON livestock_production FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON crops(status);
CREATE INDEX IF NOT EXISTS idx_livestock_type ON livestock(type);
CREATE INDEX IF NOT EXISTS idx_livestock_health_status ON livestock(health_status);
CREATE INDEX IF NOT EXISTS idx_input_usage_input_id ON input_usage(input_id);
CREATE INDEX IF NOT EXISTS idx_input_usage_field_id ON input_usage(field_id);
CREATE INDEX IF NOT EXISTS idx_input_usage_date_used ON input_usage(date_used);
CREATE INDEX IF NOT EXISTS idx_harvests_crop_id ON harvests(crop_id);
CREATE INDEX IF NOT EXISTS idx_harvests_field_id ON harvests(field_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_livestock_production_livestock_id ON livestock_production(livestock_id);
CREATE INDEX IF NOT EXISTS idx_livestock_production_date ON livestock_production(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inputs_updated_at BEFORE UPDATE ON inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();