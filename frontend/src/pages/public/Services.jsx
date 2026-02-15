import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, packagesAPI } from '../../utils/api';
import { Palette, Video, Box, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Services = () => {
  const iconMap = {
    graphics: Palette,
    video: Video,
    '3d': Box,
    ai: Sparkles,
  };

  const categories = ['All', 'graphics', 'video', '3d', 'ai'];
  const categoryLabels = {
    'All': 'All',
    'graphics': 'Graphics',
    'video': 'Video',
    '3d': '3D',
    'ai': 'AI'
  };

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchServices();
    fetchPackages();
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

  const filteredServices = services.filter(
    service => selectedCategory === 'All' || service.category === selectedCategory
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-textGray max-w-2xl mx-auto">
            Choose from our wide range of creative services tailored to your needs
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-lightGray text-textGray hover:text-white'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-20">
            <Box className="w-16 h-16 text-textGray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Services Found</h3>
            <p className="text-textGray">
              {selectedCategory === 'All' 
                ? 'No services are available yet.' 
                : `No ${categoryLabels[selectedCategory]} services available.`}
            </p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredServices.map(service => {
              const Icon = iconMap[service.category] || Palette;
              const categoryLabel = categoryLabels[service.category] || service.category;
              
              return (
                <div
                  key={service._id}
                  className="card hover:scale-105 transform transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        service.category === 'graphics'
                          ? 'bg-purple-500/10'
                          : service.category === 'video'
                          ? 'bg-blue-500/10'
                          : service.category === '3d'
                          ? 'bg-green-500/10'
                          : 'bg-pink-500/10'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          service.category === 'graphics'
                            ? 'text-purple-500'
                            : service.category === 'video'
                            ? 'text-blue-500'
                            : service.category === '3d'
                            ? 'text-green-500'
                            : 'text-pink-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
                  <p className="text-textGray text-sm mb-4">{service.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-textGray text-sm">Starting from</span>
                      <span className="text-primary font-bold text-lg">
                        LKR {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-textGray text-sm">Delivery Time</span>
                      <span className="text-white font-medium text-sm">
                        {service.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:bg-red-600"
                  >
                    <span>Select Service</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Packages Section */}
        {packages.length > 0 && (
          <div className="border-t border-gray-800 pt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Monthly Packages
              </h2>
              <p className="text-lg text-textGray">
                Subscribe to our packages for better value and priority service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`card relative ${
                  pkg.popular ? 'border-2 border-primary scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      POPULAR CHOICE
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-textGray text-sm">{pkg.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-primary">
                    LKR {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-textGray text-sm block mt-1">per {pkg.duration}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check size={18} className="text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-textGray text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/register" className="w-full btn-primary text-center block">
                  Subscribe Now
                </Link>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Services;
