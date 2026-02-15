import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Video, Box, Sparkles, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { packagesAPI } from '../../utils/api';

const Landing = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await packagesAPI.getAll();
        setPackages(data.filter(pkg => pkg.isActive));
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    fetchPackages();
  }, []);

  const features = [
    { icon: Palette, title: 'Graphics Design', desc: 'Logos, flyers, and social media posts' },
    { icon: Video, title: 'Video Editing', desc: 'Reels, YouTube videos, and thumbnails' },
    { icon: Box, title: '3D Rendering', desc: 'Product visualization and animations' },
    { icon: Sparkles, title: 'AI Services', desc: 'AI-generated content and images' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark via-darker to-dark py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Creative Solutions for
              <span className="text-primary block mt-2">Your Brand</span>
            </h1>
            <p className="text-xl md:text-2xl text-textGray max-w-3xl mx-auto mb-8">
              Professional graphics, video editing, 3D rendering, and AI services
              to bring your vision to life
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/services" className="btn-primary text-lg flex items-center space-x-2">
                <span>Explore Services</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/register" className="btn-secondary text-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              What We Offer
            </h2>
            <p className="text-textGray text-lg">
              End-to-end creative services for businesses and individuals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card hover:scale-105 transform transition-all duration-300 text-center"
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-textGray">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      {packages.length > 0 && (
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Featured Packages
            </h2>
            <p className="text-textGray text-lg">
              Monthly plans designed for businesses and content creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`card relative ${
                  pkg.popular ? 'border-2 border-primary scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
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
                  <span className="text-textGray"> / {pkg.duration}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-textGray text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="w-full btn-primary block text-center">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join hundreds of satisfied clients and bring your creative vision to life
          </p>
          <Link to="/register" className="btn-primary bg-white text-primary hover:bg-gray-100 text-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
