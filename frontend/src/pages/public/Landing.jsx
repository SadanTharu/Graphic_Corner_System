import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Video, Box, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { packagesAPI, bannersAPI, settingsAPI } from '../../utils/api';

const Landing = () => {
  const [packages, setPackages] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [heroTextPosition, setHeroTextPosition] = useState('below');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await packagesAPI.getAll();
        setPackages(data.filter(pkg => pkg.isActive));
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    const fetchBanners = async () => {
      try {
        const data = await bannersAPI.getActive();
        setBanners(data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    const fetchHeroPosition = async () => {
      try {
        const result = await settingsAPI.get('heroTextPosition');
        if (result.value) {
          setHeroTextPosition(result.value);
        }
      } catch (error) {
        console.error('Error fetching hero text position:', error);
      }
    };
    fetchPackages();
    fetchBanners();
    fetchHeroPosition();
  }, []);

  // Auto-advance banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const nextBanner = useCallback(() => {
    setCurrentBanner(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const features = [
    { icon: Palette, title: 'Graphics Design', desc: 'Logos, flyers, and social media posts' },
    { icon: Video, title: 'Video Editing', desc: 'Reels, YouTube videos, and thumbnails' },
    { icon: Box, title: '3D Rendering', desc: 'Product visualization and animations' },
    { icon: Sparkles, title: 'AI Services', desc: 'AI-generated content and images' }
  ];

  return (
    <div className="min-h-screen">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="relative w-full overflow-hidden bg-darker">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
                <div key={banner._id || banner.id} className="w-full flex-shrink-0 relative">
                  {banner.link && banner.link.startsWith('http') ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                      />
                    </a>
                  ) : banner.link ? (
                    <Link to={banner.link} className="block">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                      />
                    </Link>
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                    />
                  )}

                  {/* Overlay hero text on banner */}
                  {heroTextPosition === 'overlay' ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                          Creative Solutions for
                          <span className="text-primary block mt-2">Your Brand</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-6">
                          Professional graphics, video editing, 3D rendering, and AI services
                          to bring your vision to life
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
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
                  ) : (
                    /* Banner title overlay (non-hero mode) */
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                      <div className="p-6 md:p-10">
                        <h2 className="text-white text-xl md:text-3xl font-bold">{banner.title}</h2>
                        {banner.description && (
                          <p className="text-white/80 text-sm md:text-base mt-1">{banner.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentBanner ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Hero Section - shown below banner when position is 'below', or when no banners exist */}
      {(heroTextPosition === 'below' || banners.length === 0) && (
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
      )}

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
                key={pkg._id || pkg.id}
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
                  {pkg.discount > 0 && (
                    <span className="text-textGray line-through text-sm block mb-1">
                      LKR {pkg.totalPrice?.toLocaleString()}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary">
                    LKR {(pkg.offeringPrice || pkg.price || 0).toLocaleString()}
                  </span>
                  <span className="text-textGray"> / {pkg.duration}</span>
                  {pkg.discount > 0 && (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      {pkg.discount}% OFF
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {(pkg.services || []).map((s, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-textGray text-sm">
                        {s.service?.name || 'Service'} ×{s.count}
                      </span>
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
