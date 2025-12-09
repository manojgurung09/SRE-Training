import { useState } from 'react';
import { Shield, Package, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminProducts } from './admin/AdminProducts';
import { AdminOrders } from './admin/AdminOrders';
import { UserManagement } from './admin/UserManagement';

type AdminView = 'products' | 'orders' | 'users' | 'analytics';

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
];

export function AdminPanel() {
  const { isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('products');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Analytics Coming Soon</p>
            <p className="text-gray-400 text-sm mt-2">Track metrics, performance, and insights</p>
          </div>
        );
      default:
        return <AdminProducts />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-300">Manage your e-commerce platform</p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  currentView === item.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
