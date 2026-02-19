import { useState, useEffect } from 'react';
import { servicesAPI, packagesAPI, ordersAPI, subscriptionsAPI } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { Palette, Video, Box, Sparkles, Check, Loader2, Clock, XCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const NewRequest = () => {
  const [selectedTab, setSelectedTab] = useState('services');
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const { addToCart, cart } = useCart();

  const iconMap = {
    graphics: Palette,
    video: Video,
    '3d': Box,
    ai: Sparkles,
  };

  const categoryLabels = {
    'graphics': 'Graphics',
    'video': 'Video',
    '3d': '3D',
    'ai': 'AI'
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
    fetchSubscriptions();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await packagesAPI.getAll();
      setPackages(data.filter(pkg => pkg.isActive));
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const data = await subscriptionsAPI.getAll();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  // Check if user has an active/pending subscription for a package
  const getSubscriptionForPackage = (packageId) => {
    return subscriptions.find(
      s => (s.package?._id || s.package) === packageId && ['pending', 'awaiting_payment', 'approved', 'active'].includes(s.status)
    );
  };

  const handleSubscribe = async (pkg) => {
    try {
      setSubscribing(pkg._id);
      await subscriptionsAPI.subscribe(pkg._id);
      toast.success('Subscription request submitted! Waiting for admin approval.');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async (subId) => {
    try {
      await subscriptionsAPI.cancel(subId, 'Customer cancelled');
      toast.success('Subscription request cancelled');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error(error.message || 'Failed to cancel');
    }
  };

  const handleAddService = (service) => {
    addToCart(service);
    toast.success(`${service.name} added to cart!`);
  };

  const handleSubmitRequest = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      const orderPromises = cart.map(item => 
        ordersAPI.create({
          service: item.serviceId,
          totalAmount: item.price,
          requirements: 'Service request from cart'
        })
      );

      await Promise.all(orderPromises);
      
      // Clear cart after successful submission
      cart.forEach(item => {
        const cartFromStorage = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = cartFromStorage.filter(c => c.id !== item.id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      });
      
      toast.success(`${cart.length} order(s) submitted successfully! Awaiting admin approval.`);
      
      // Refresh the page to update cart
      window.location.reload();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="card text-center py-12">
              <Box className="w-16 h-16 text-textGray mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Services Available</h3>
              <p className="text-textGray">Please check back later for available services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const Icon = iconMap[service.category] || Palette;
                const inCart = isInCart(service._id);

                return (
                  <div
                    key={service._id}
                    className="card hover:scale-105 transform transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        service.category === 'graphics' ? 'bg-purple-500/10' :
                        service.category === 'video' ? 'bg-blue-500/10' :
                        service.category === '3d' ? 'bg-green-500/10' :
                        'bg-pink-500/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          service.category === 'graphics' ? 'text-purple-500' :
                          service.category === 'video' ? 'text-blue-500' :
                          service.category === '3d' ? 'text-green-500' :
                          'text-pink-500'
                        }`} />
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                        {categoryLabels[service.category]}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-textGray text-sm mb-4">{service.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-textGray">Price:</span>
                        <span className="text-white font-semibold">
                          LKR {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
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
        </>
      )}

      {/* Packages Grid */}
      {selectedTab === 'packages' && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="card text-center py-12">
              <Box className="w-16 h-16 text-textGray mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Packages Available</h3>
              <p className="text-textGray">Please check back later for available packages.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
              <div
                key={pkg._id}
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
                {pkg.discount > 0 && (
                  <span className="text-textGray line-through text-sm block mb-1">
                    LKR {pkg.totalPrice?.toLocaleString()}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary">
                    LKR {(pkg.offeringPrice || pkg.price || 0).toLocaleString()}
                  </span>
                  <span className="text-textGray text-sm ml-2">/ {pkg.duration}</span>
                </div>
                {pkg.discount > 0 && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    {pkg.discount}% OFF
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {(pkg.services || []).map((s, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-textGray">
                      {s.service?.name || 'Service'} ×{s.count}
                    </span>
                  </li>
                ))}
              </ul>

              {(() => {
                const existingSub = getSubscriptionForPackage(pkg._id);
                if (existingSub) {
                  return (
                    <div className="space-y-2">
                      <div className={`w-full py-3 rounded-lg font-medium text-center flex items-center justify-center space-x-2 ${
                        existingSub.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : existingSub.status === 'awaiting_payment'
                          ? 'bg-orange-500/20 text-orange-400'
                          : existingSub.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {existingSub.status === 'pending' ? (
                          <>
                            <Clock size={18} />
                            <span>Applied — Waiting for Approval</span>
                          </>
                        ) : existingSub.status === 'awaiting_payment' ? (
                          <>
                            <CreditCard size={18} />
                            <span>Approved — Pay 25% Advance (LKR {(existingSub.advanceAmount || 0).toLocaleString()})</span>
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Subscription Active</span>
                          </>
                        )}
                      </div>
                      {existingSub.status === 'awaiting_payment' && (
                        <p className="text-xs text-orange-400 text-center">Go to My Subscriptions to make payment</p>
                      )}
                      {['pending', 'awaiting_payment'].includes(existingSub.status) && (
                        <button
                          onClick={() => handleCancelSubscription(existingSub._id)}
                          className="w-full py-2 rounded-lg font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center space-x-2 text-sm"
                        >
                          <XCircle size={16} />
                          <span>Cancel Request</span>
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    onClick={() => handleSubscribe(pkg)}
                    disabled={subscribing === pkg._id}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {subscribing === pkg._id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <span>Subscribe Now</span>
                    )}
                  </button>
                );
              })()}
              </div>
            ))}
            </div>
          )}
        </>
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
                  LKR {(item.price || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-white font-bold">Total:</span>
              <span className="text-primary font-bold text-xl">
                LKR {cart.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmitRequest}
            disabled={loading || cart.length === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewRequest;
