import { useState } from 'react';
import { services, packages } from '../../data';
import { useCart } from '../../context/CartContext';
import { Palette, Video, Box, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const NewRequest = () => {
  const [selectedTab, setSelectedTab] = useState('services');
  const { addToCart, cart } = useCart();

  const iconMap = {
    Palette,
    Video,
    Box,
    Sparkles,
    Image: Palette,
    Film: Video,
    FileText: Palette,
    Monitor: Video,
    Cube: Box,
    PenTool: Sparkles
  };

  const handleAddService = (service) => {
    addToCart(service);
    toast.success(`${service.name} added to cart!`);
  };

  const isInCart = (serviceId) => {
    return cart.some(item => item.serviceId === serviceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">New Request</h2>
        <p className="text-textGray mt-2">Select services or packages for your project</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('services')}
          className={`pb-3 px-4 font-medium transition-colors ${
            selectedTab === 'services'
              ? 'border-b-2 border-primary text-primary'
              : 'text-textGray hover:text-white'
          }`}
        >
          Individual Services
        </button>
        <button
          onClick={() => setSelectedTab('packages')}
          className={`pb-3 px-4 font-medium transition-colors ${
            selectedTab === 'packages'
              ? 'border-b-2 border-primary text-primary'
              : 'text-textGray hover:text-white'
          }`}
        >
          Packages
        </button>
      </div>

      {/* Services Grid */}
      {selectedTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Palette;
            const inCart = isInCart(service.id);

            return (
              <div
                key={service.id}
                className="card hover:scale-105 transform transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    service.category === 'Graphics' ? 'bg-purple-500/10' :
                    service.category === 'Video' ? 'bg-blue-500/10' :
                    service.category === '3D' ? 'bg-green-500/10' :
                    'bg-pink-500/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      service.category === 'Graphics' ? 'text-purple-500' :
                      service.category === 'Video' ? 'text-blue-500' :
                      service.category === '3D' ? 'text-green-500' :
                      'text-pink-500'
                    }`} />
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                <p className="text-textGray text-sm mb-4">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-textGray">Price:</span>
                    <span className="text-white font-semibold">
                      LKR {service.priceRange}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-textGray">Delivery:</span>
                    <span className="text-white">{service.deliveryTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddService(service)}
                  disabled={inCart}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    inCart
                      ? 'bg-green-500/20 text-green-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {inCart ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Check size={18} />
                      <span>Added to Cart</span>
                    </span>
                  ) : (
                    'Select Service'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Packages Grid */}
      {selectedTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`card relative overflow-hidden ${
                pkg.popular ? 'border-2 border-primary' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-textGray text-sm">{pkg.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary">
                    LKR {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-textGray text-sm ml-2">/ {pkg.duration}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-textGray">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => toast.success('Package added! Our team will contact you.')}
                className="w-full btn-primary"
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="card bg-primary/10 border-2 border-primary">
          <h3 className="text-xl font-bold text-white mb-4">Cart Summary</h3>
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-white">{item.serviceName}</span>
                <span className="text-primary font-semibold">
                  LKR {item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-white font-bold">Total:</span>
              <span className="text-primary font-bold text-xl">
                LKR {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.success('Request submitted! We will contact you soon.')}
            className="w-full btn-primary"
          >
            Submit Request
          </button>
        </div>
      )}
    </div>
  );
};

export default NewRequest;
