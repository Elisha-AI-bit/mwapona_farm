import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type Database } from '../lib/supabase';

type Field = Database['public']['Tables']['fields']['Row'];
type Crop = Database['public']['Tables']['crops']['Row'];
type Livestock = Database['public']['Tables']['livestock']['Row'];
type Input = Database['public']['Tables']['inputs']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Harvest = Database['public']['Tables']['harvests']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

// Extended types for joins
interface CropWithField extends Crop {
  fields?: { name: string } | null;
}

interface TaskWithProfiles extends Task {
  assigned_to_profile?: { full_name: string } | null;
  assigned_by_profile?: { full_name: string } | null;
}

interface SaleWithProduct extends Sale {
  products?: { name: string; unit: string } | null;
}

interface HarvestWithCropAndField extends Harvest {
  crops?: { name: string } | null;
  fields?: { name: string } | null;
  harvested_by_profile?: { full_name: string } | null;
}
interface DataContextType {
  // Fields
  fields: Field[];
  addField: (field: Omit<Field, 'id' | 'created_at' | 'updated_at'>) => void;
  updateField: (id: string, field: Partial<Field>) => void;
  deleteField: (id: string) => void;

  // Crops
  crops: Crop[];
  addCrop: (crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCrop: (id: string, crop: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;

  // Livestock
  livestock: Livestock[];
  addLivestock: (animal: Omit<Livestock, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLivestock: (id: string, animal: Partial<Livestock>) => void;
  deleteLivestock: (id: string) => void;

  // Inputs
  inputs: Input[];
  addInput: (input: Omit<Input, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInput: (id: string, input: Partial<Input>) => void;
  deleteInput: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Harvests
  harvests: HarvestWithCropAndField[];
  addHarvest: (harvest: Omit<Harvest, 'id' | 'created_at'>) => void;
  updateHarvest: (id: string, harvest: Partial<Harvest>) => void;
  deleteHarvest: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Tasks
  tasks: TaskWithProfiles[];
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Sales
  sales: SaleWithProduct[];
  addSale: (sale: Omit<Sale, 'id' | 'created_at'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<CropWithField[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [harvests, setHarvests] = useState<HarvestWithCropAndField[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<TaskWithProfiles[]>([]);
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFields(),
        loadCrops(),
        loadLivestock(),
        loadInputs(),
        loadProducts(),
        loadHarvests(),
        loadCustomers(),
        loadTasks(),
        loadSales(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async () => {
    const { data, error } = await supabase.from('fields').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setFields(data || []);
  };

  const loadCrops = async () => {
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        fields:field_id (name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setCrops(data || []);
  };

  const loadLivestock = async () => {
    const { data, error } = await supabase.from('livestock').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setLivestock(data || []);
  };

  const loadInputs = async () => {
    const { data, error } = await supabase.from('inputs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setInputs(data || []);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setProducts(data || []);
  };

  const loadHarvests = async () => {
    const { data, error } = await supabase
      .from('harvests')
      .select(`
        *,
        crops:crop_id (name),
        fields:field_id (name),
        harvested_by_profile:harvested_by (full_name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setHarvests(data || []);
  };

  const loadCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setCustomers(data || []);
  };
  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_profile:assigned_to (full_name),
        assigned_by_profile:assigned_by (full_name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setTasks(data || []);
  };

  const loadSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        products:product_id (name, unit)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setSales(data || []);
  };

  // Field operations
  const addField = async (field: Omit<Field, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('fields').insert([field]).select().single();
    if (error) throw error;
    setFields(prev => [data, ...prev]);
  };

  const updateField = async (id: string, field: Partial<Field>) => {
    const { data, error } = await supabase.from('fields').update(field).eq('id', id).select().single();
    if (error) throw error;
    setFields(prev => prev.map(f => f.id === id ? data : f));
  };

  const deleteField = async (id: string) => {
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) throw error;
    setFields(prev => prev.filter(f => f.id !== id));
  };

  // Crop operations
  const addCrop = async (crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('crops').insert([crop]).select(`
      *,
      fields:field_id (name)
    `).single();
    if (error) throw error;
    setCrops(prev => [data, ...prev]);
  };

  const updateCrop = async (id: string, crop: Partial<Crop>) => {
    const { data, error } = await supabase.from('crops').update(crop).eq('id', id).select(`
      *,
      fields:field_id (name)
    `).single();
    if (error) throw error;
    setCrops(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCrop = async (id: string) => {
    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (error) throw error;
    setCrops(prev => prev.filter(c => c.id !== id));
  };

  // Livestock operations
  const addLivestock = async (animal: Omit<Livestock, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('livestock').insert([animal]).select().single();
    if (error) throw error;
    setLivestock(prev => [data, ...prev]);
  };

  const updateLivestock = async (id: string, animal: Partial<Livestock>) => {
    const { data, error } = await supabase.from('livestock').update(animal).eq('id', id).select().single();
    if (error) throw error;
    setLivestock(prev => prev.map(l => l.id === id ? data : l));
  };

  const deleteLivestock = async (id: string) => {
    const { error } = await supabase.from('livestock').delete().eq('id', id);
    if (error) throw error;
    setLivestock(prev => prev.filter(l => l.id !== id));
  };

  // Input operations
  const addInput = async (input: Omit<Input, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('inputs').insert([input]).select().single();
    if (error) throw error;
    setInputs(prev => [data, ...prev]);
  };

  const updateInput = async (id: string, input: Partial<Input>) => {
    const { data, error } = await supabase.from('inputs').update(input).eq('id', id).select().single();
    if (error) throw error;
    setInputs(prev => prev.map(i => i.id === id ? data : i));
  };

  const deleteInput = async (id: string) => {
    const { error } = await supabase.from('inputs').delete().eq('id', id);
    if (error) throw error;
    setInputs(prev => prev.filter(i => i.id !== id));
  };

  // Product operations
  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    setProducts(prev => [data, ...prev]);
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? data : p));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Harvest operations
  const addHarvest = async (harvest: Omit<Harvest, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('harvests').insert([harvest]).select(`
      *,
      crops:crop_id (name),
      fields:field_id (name),
      harvested_by_profile:harvested_by (full_name)
    `).single();
    if (error) throw error;
    setHarvests(prev => [data, ...prev]);
  };

  const updateHarvest = async (id: string, harvest: Partial<Harvest>) => {
    const { data, error } = await supabase.from('harvests').update(harvest).eq('id', id).select(`
      *,
      crops:crop_id (name),
      fields:field_id (name),
      harvested_by_profile:harvested_by (full_name)
    `).single();
    if (error) throw error;
    setHarvests(prev => prev.map(h => h.id === id ? data : h));
  };

  const deleteHarvest = async (id: string) => {
    const { error } = await supabase.from('harvests').delete().eq('id', id);
    if (error) throw error;
    setHarvests(prev => prev.filter(h => h.id !== id));
  };

  // Customer operations
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('customers').insert([customer]).select().single();
    if (error) throw error;
    setCustomers(prev => [data, ...prev]);
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select().single();
    if (error) throw error;
    setCustomers(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    setCustomers(prev => prev.filter(c => c.id !== id));
  };
  // Task operations
  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select(`
      *,
      assigned_to_profile:assigned_to (full_name),
      assigned_by_profile:assigned_by (full_name)
    `).single();
    if (error) throw error;
    setTasks(prev => [data, ...prev]);
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(task).eq('id', id).select(`
      *,
      assigned_to_profile:assigned_to (full_name),
      assigned_by_profile:assigned_by (full_name)
    `).single();
    if (error) throw error;
    setTasks(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Sale operations
  const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('sales').insert([sale]).select(`
      *,
      products:product_id (name, unit)
    `).single();
    if (error) throw error;
    setSales(prev => [data, ...prev]);
  };

  const updateSale = async (id: string, sale: Partial<Sale>) => {
    const { data, error } = await supabase.from('sales').update(sale).eq('id', id).select(`
      *,
      products:product_id (name, unit)
    `).single();
    if (error) throw error;
    setSales(prev => prev.map(s => s.id === id ? data : s));
  };

  const deleteSale = async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) throw error;
    setSales(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        fields,
        addField,
        updateField,
        deleteField,
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        livestock,
        addLivestock,
        updateLivestock,
        deleteLivestock,
        inputs,
        addInput,
        updateInput,
        deleteInput,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        harvests,
        addHarvest,
        updateHarvest,
        deleteHarvest,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        sales,
        addSale,
        updateSale,
        deleteSale,
        loading,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};