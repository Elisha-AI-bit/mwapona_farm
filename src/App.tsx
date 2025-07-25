import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';
import { FieldsView } from './components/views/FieldsView';
import { CropsView } from './components/views/CropsView';
import { LivestockView } from './components/views/LivestockView';
import { InputsView } from './components/views/InputsView';
import { ProductsView } from './components/views/ProductsView';
import { HarvestsView } from './components/views/HarvestsView';
import { SalesView } from './components/views/SalesView';
import { TasksView } from './components/views/TasksView';
import { ReportsView } from './components/views/ReportsView';
import { CustomersView } from './components/views/CustomersView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { MyOrdersView } from './components/views/MyOrdersView';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'fields':
        return <FieldsView />;
      case 'crops':
        return <CropsView />;
      case 'livestock':
        return <LivestockView />;
      case 'inputs':
        return <InputsView />;
      case 'products':
        return <ProductsView />;
      case 'harvests':
        return <HarvestsView />;
      case 'sales':
        return <SalesView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <ReportsView />;
      case 'customers':
        return <CustomersView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'my-orders':
        return <MyOrdersView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {renderView()}
      </main>

      {/* Mobile Navigation Overlay */}
      <div className="lg:hidden">
        {/* Mobile navigation can be implemented here */}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;