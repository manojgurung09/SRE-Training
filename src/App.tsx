import { useState } from 'react';
import { Package, ShoppingCart as CartIcon, Menu, X, LogIn, LogOut, User, ShoppingBag, Shield, Truck } from 'lucide-react';
import { ProductCatalog } from './components/ProductCatalog';
import { OrderManagement } from './components/OrderManagement';
import { AuthModal } from './components/AuthModal';
import { ShoppingCart } from './components/ShoppingCart';
import { Checkout } from './components/Checkout';
import { OrderTracking } from './components/OrderTracking';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

type View = 'products' | 'orders' | 'checkout' | 'tracking' | 'admin' | 'profile';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { id: 'tracking', label: 'My Orders', icon: <Truck className="w-5 h-5" /> },
];

function App() {
  const [currentView, setCurrentView] = useState<View>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | undefined>();
  const { user, userProfile, isAdmin, signOut, loading } = useAuth();
  const { totalItems } = useCart();

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductCatalog />;
      case 'orders':
        return <OrderManagement />;
      case 'checkout':
        return (
          <Checkout
            onBack={() => setCurrentView('products')}
            onComplete={(orderId) => {
              setCompletedOrderId(orderId);
              setCurrentView('tracking');
            }}
          />
        );
      case 'tracking':
        return (
          <OrderTracking
            orderId={completedOrderId}
            onBack={() => setCurrentView('products')}
          />
        );
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <UserProfile />;
      default:
        return <ProductCatalog />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <CartIcon className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">भारतMart</h1>
                <p className="text-xs text-gray-600">Your Trusted Indian Marketplace</p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-200">
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>

                {user && (
                  <>
                    <button
                      onClick={() => setCurrentView('profile')}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="My Profile"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="flex items-center gap-2 px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Admin Panel"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-xs font-medium">Admin</span>
                      </button>
                    )}
                  </>
                )}

                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                      <User className="w-4 h-4 text-green-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-green-700">
                          {userProfile?.full_name || user.email}
                        </span>
                        {isAdmin && (
                          <span className="text-xs text-purple-600 font-medium">Admin</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-lg transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => setCurrentView('checkout')}
      />

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              E-Commerce Platform - Oracle Cloud Infrastructure Demo
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Database: Supabase</span>
              <span>•</span>
              <span>Auth: Supabase Auth</span>
              <span>•</span>
              <span>Stack: React + Express + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
