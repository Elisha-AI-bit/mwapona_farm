import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Layout } from './Layout';
import { Users, MapPin, Wheat, Cog as Cow, Package, ShoppingCart, CheckSquare, TrendingUp, AlertTriangle, Calendar, DollarSign, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    fields,
    crops,
    livestock,
    inputs,
    products,
    harvests,
    customers,
    sales,
    tasks,
  } = useData();

  // Calculate statistics
  const totalFields = fields.length;
  const activeCrops = crops.filter(c => c.status !== 'harvested').length;
  const healthyLivestock = livestock.filter(l => l.health_status === 'healthy').length;
  const lowStockInputs = inputs.filter(i => i.quantity_in_stock <= i.reorder_level).length;
  const availableProducts = products.filter(p => p.status === 'available').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const recentSales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  }).length;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Fields"
        value={totalFields}
        icon={<MapPin className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        description="Managed fields"
      />
      <StatCard
        title="Active Crops"
        value={activeCrops}
        icon={<Wheat className="h-6 w-6 text-white" />}
        color="bg-green-500"
        description="Currently growing"
      />
      <StatCard
        title="Healthy Livestock"
        value={healthyLivestock}
        icon={<Cow className="h-6 w-6 text-white" />}
        color="bg-amber-500"
        description="In good health"
      />
      <StatCard
        title="Low Stock Alerts"
        value={lowStockInputs}
        icon={<AlertTriangle className="h-6 w-6 text-white" />}
        color="bg-red-500"
        description="Need restocking"
      />
      <StatCard
        title="Available Products"
        value={availableProducts}
        icon={<Package className="h-6 w-6 text-white" />}
        color="bg-purple-500"
        description="Ready for sale"
      />
      <StatCard
        title="Total Revenue"
        value={`K${totalRevenue.toLocaleString()}`}
        icon={<DollarSign className="h-6 w-6 text-white" />}
        color="bg-emerald-500"
        description="All-time sales"
      />
      <StatCard
        title="Recent Sales"
        value={recentSales}
        icon={<ShoppingCart className="h-6 w-6 text-white" />}
        color="bg-indigo-500"
        description="Last 30 days"
      />
      <StatCard
        title="Pending Tasks"
        value={pendingTasks}
        icon={<CheckSquare className="h-6 w-6 text-white" />}
        color="bg-orange-500"
        description="Need attention"
      />
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Active Operations"
        value={activeCrops + healthyLivestock}
        icon={<Activity className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        description="Crops + Livestock"
      />
      <StatCard
        title="Task Management"
        value={pendingTasks}
        icon={<CheckSquare className="h-6 w-6 text-white" />}
        color="bg-orange-500"
        description="Pending tasks"
      />
      <StatCard
        title="Production Value"
        value={`K${totalRevenue.toLocaleString()}`}
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        color="bg-green-500"
        description="Total sales"
      />
      <StatCard
        title="Input Alerts"
        value={lowStockInputs}
        icon={<AlertTriangle className="h-6 w-6 text-white" />}
        color="bg-red-500"
        description="Low stock items"
      />
      <StatCard
        title="Available Products"
        value={availableProducts}
        icon={<Package className="h-6 w-6 text-white" />}
        color="bg-purple-500"
        description="Ready to sell"
      />
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <StatCard
        title="My Tasks"
        value={tasks.filter(t => t.assigned_to === user?.id && (t.status === 'pending' || t.status === 'in-progress')).length}
        icon={<CheckSquare className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        description="Assigned to me"
      />
      <StatCard
        title="Active Crops"
        value={tasks.filter(t => t.assigned_to === user?.id && (t.status === 'pending' || t.status === 'in-progress')).length}
        icon={<Wheat className="h-6 w-6 text-white" />}
        color="bg-green-500"
        description="Currently growing"
      />
      <StatCard
        title="Livestock Care"
        value={healthyLivestock}
        icon={<Cow className="h-6 w-6 text-white" />}
        color="bg-amber-500"
        description="Animals in care"
      />
      <StatCard
        title="Input Usage"
        value={inputs.filter(i => i.quantity_in_stock > 0).length}
        icon={<Package className="h-6 w-6 text-white" />}
        color="bg-purple-500"
        description="Available inputs"
      />
    </div>
  );

  const renderCustomerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <StatCard
        title="Available Products"
        value={availableProducts}
        icon={<Package className="h-6 w-6 text-white" />}
        color="bg-green-500"
        description="Ready to purchase"
      />
      <StatCard
        title="My Orders"
        value={sales.filter(s => s.customer_id === user?.id).length}
        icon={<ShoppingCart className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        description="Total purchases"
      />
      <StatCard
        title="Recent Sales"
        value={recentSales}
        icon={<Wheat className="h-6 w-6 text-white" />}
        color="bg-amber-500"
        description="Last 30 days"
      />
      <StatCard
        title="Product Types"
        value={new Set(products.map(p => p.type)).size}
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        color="bg-purple-500"
        description="Categories available"
      />
    </div>
  );

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'manager':
        return renderManagerDashboard();
      case 'staff':
        return renderStaffDashboard();
      case 'customer':
        return renderCustomerDashboard();
      default:
        return null;
    }
  };

  return (
    <Layout title={`${user?.role?.charAt(0).toUpperCase()}${user?.role?.slice(1)} Dashboard`}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6">
          <h2 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.fullName}!
          </h2>
          <p className="text-green-100 mb-4">
            Welcome to your farm management dashboard
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="capitalize">{user?.role} Access</span>
            </div>
          </div>
        </div>

        {/* Role-based Statistics */}
        {renderDashboardByRole()}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === 'admin' && (
              <>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <MapPin className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Field</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <Wheat className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Crop</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <Cow className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Livestock</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <Package className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Product</span>
                </button>
              </>
            )}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <CheckSquare className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Assign Task</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <TrendingUp className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">View Reports</span>
                </button>
              </>
            )}
            {user?.role === 'staff' && (
              <>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <CheckSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">My Tasks</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <Wheat className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Record Harvest</span>
                </button>
              </>
            )}
            {user?.role === 'customer' && (
              <>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <Package className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Browse Products</span>
                </button>
                <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">My Orders</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};