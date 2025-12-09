import { useEffect, useState } from 'react';
import { Search, Package, Filter, ShoppingCart, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types/database';
import { useCart } from '../contexts/CartContext';
import { formatINR } from '../lib/currency';

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products from backend API...');
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000');

      const response = await api.get<{ data: Product[]; count: number }>('/api/products');
      
      if (response.data) {
        console.log('✅ Products loaded:', response.data.length);
        setProducts(response.data);
        const uniqueCategories = [...new Set(response.data.map(p => p.category))];
        setCategories(uniqueCategories);
      } else {
        console.warn('⚠️ No products returned from API');
        setProducts([]);
      }
    } catch (error) {
      console.error('💥 Error fetching products:', error);
      alert(`Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>{filteredProducts.length} products</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, description, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    {product.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatINR(product.price)}</div>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Stock:</span>
                  <span className={`ml-2 font-semibold ${
                    product.stock_quantity > 20 ? 'text-green-600' :
                    product.stock_quantity > 0 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {product.stock_quantity} units
                  </span>
                </div>

                {product.sku && (
                  <div className="text-xs text-gray-500">
                    SKU: {product.sku}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image_url: product.image_url,
                  });
                  setAddedItems((prev) => new Set(prev).add(product.id));
                  setTimeout(() => {
                    setAddedItems((prev) => {
                      const next = new Set(prev);
                      next.delete(product.id);
                      return next;
                    });
                  }, 2000);
                }}
                disabled={product.stock_quantity === 0}
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  addedItems.has(product.id)
                    ? 'bg-green-600 text-white'
                    : product.stock_quantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {addedItems.has(product.id) ? (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : product.stock_quantity === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
