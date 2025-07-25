import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Wheat, Cog as Cow, Package, ShoppingCart, CheckSquare, TrendingUp, Users, Home, FileText, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff', 'customer']
  },
  {
    id: 'fields',
    label: 'Field Management',
    icon: <MapPin className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff'],
    children: [
      { id: 'fields', label: 'Fields', icon: <MapPin className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
      { id: 'crops', label: 'Crops', icon: <Wheat className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
    ]
  },
  {
    id: 'livestock',
    label: 'Livestock',
    icon: <Cow className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff']
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Package className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff'],
    children: [
      { id: 'inputs', label: 'Inputs', icon: <Package className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
      { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
      { id: 'harvests', label: 'Harvests', icon: <Wheat className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff']
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <CheckSquare className="h-5 w-5" />,
    roles: ['admin', 'manager', 'staff']
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <TrendingUp className="h-5 w-5" />,
    roles: ['admin', 'manager']
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin', 'manager']
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ['customer']
  },
  {
    id: 'my-orders',
    label: 'My Orders',
    icon: <FileText className="h-5 w-5" />,
    roles: ['customer']
  }
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['fields', 'inventory']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemAccessible = (item: NavItem) => {
    return user?.role && item.roles.includes(user.role);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!isItemAccessible(item)) return null;

    const isActive = currentView === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onViewChange(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
            isActive
              ? 'bg-green-100 text-green-800 border-r-2 border-green-600'
              : 'text-gray-700 hover:bg-gray-100'
          } ${depth > 0 ? 'ml-4 text-sm' : ''}`}
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <div className="text-gray-400">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <div className="space-y-2">
          {navigationItems.map(item => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );
};