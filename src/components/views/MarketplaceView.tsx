import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import type { Database } from '../../lib/supabase';
import { ShoppingCart, Package, Calendar, Star, Filter, Search } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

export const MarketplaceView: React.FC = () => {
  const { user } = useAuth();
  const { products, addSale } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
    address: ''
  });
  const [showOrderModal, setShowOrderModal] = useState(false);

  const availableProducts = products.filter(p => 
    p.status === 'available' && 
    p.quantity_available > 0 &&
    (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedType === '' || p.type === selectedType)
  );

  const productTypes = [...new Set(products.map(p => p.type))];

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const submitOrder = async () => {
    if (!selectedProduct) return;

    try {
      const saleData = {
        product_id: selectedProduct.id,
        customer_id: null, // For demo, we're not linking to customer table
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        quantity: orderQuantity,
        price_per_unit: selectedProduct.price_per_unit,
        total_amount: orderQuantity * selectedProduct.price_per_unit,
        sale_date: new Date().toISOString().split('T')[0],
        payment_method: 'pending' as const,
        payment_status: 'pending' as const,
        delivery_status: 'pending' as const,
        notes: `Order from marketplace by ${customerInfo.name}`
      };

      await addSale(saleData);
      setShowOrderModal(false);
      setSelectedProduct(null);
      alert('Order placed successfully! You will be contacted for payment and delivery details.');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const getProductImage = (type: string) => {
    // Using placeholder images from Pexels
    const imageMap: Record<string, string> = {
      'crop': 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=300',
      'livestock': 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=300',
      'processed': 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=300'
    };
    return imageMap[type] || imageMap['crop'];
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <Layout title="Marketplace">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Fresh Farm Products</h2>
          <p className="text-green-100">
            Browse and order fresh produce directly from local farms
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {productTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={getProductImage(product.type)}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {isExpiringSoon(product.expiry_date) && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Expires Soon
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {product.type}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-500 ml-1">(4.0)</span>
                  </div>
                  {product.harvest_date && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Harvested {new Date(product.harvest_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      K{product.price_per_unit.toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-sm">/{product.unit}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="font-medium">{product.quantity_available} {product.unit}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleOrder(product)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {availableProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType 
                ? 'Try adjusting your search or filter criteria'
                : 'No products are currently available'
              }
            </p>
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order {selectedProduct.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity ({selectedProduct.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.quantity_available}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your delivery address"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        K{(orderQuantity * selectedProduct.price_per_unit).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={!customerInfo.name || !customerInfo.phone}
                    className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};