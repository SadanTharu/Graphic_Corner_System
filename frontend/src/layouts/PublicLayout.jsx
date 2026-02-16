import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-lightGray border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="Graphic Corner" className="w-10 h-10 rounded-lg object-contain" />
                <span className="text-white text-xl font-bold">Graphic Corner</span>
              </Link>
              <p className="text-textGray text-sm leading-relaxed">
                Professional graphics, video editing, 3D rendering, and AI services to bring your creative vision to life.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-textGray hover:text-primary text-sm transition-colors">Home</Link></li>
                <li><Link to="/services" className="text-textGray hover:text-primary text-sm transition-colors">Services</Link></li>
                <li><Link to="/register" className="text-textGray hover:text-primary text-sm transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="text-textGray hover:text-primary text-sm transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-textGray text-sm">Colombo, Sri Lanka</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary flex-shrink-0" />
                  <a href="tel:+94771234567" className="text-textGray hover:text-primary text-sm transition-colors">+94 77 123 4567</a>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail size={18} className="text-primary flex-shrink-0" />
                  <a href="mailto:info@graphiccorner.lk" className="text-textGray hover:text-primary text-sm transition-colors">info@graphiccorner.lk</a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex items-center space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-darker rounded-lg flex items-center justify-center text-textGray hover:text-primary hover:bg-primary/10 transition-all">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-darker rounded-lg flex items-center justify-center text-textGray hover:text-primary hover:bg-primary/10 transition-all">
                  <Instagram size={20} />
                </a>
                <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-darker rounded-lg flex items-center justify-center text-textGray hover:text-primary hover:bg-primary/10 transition-all">
                  <MessageCircle size={20} />
                </a>
              </div>
              <p className="text-textGray text-sm mt-4">
                Available Mon–Sat, 9 AM – 6 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-textGray text-sm">
                &copy; {new Date().getFullYear()} Graphic Corner. All rights reserved.
              </p>
              <p className="text-textGray text-sm">
                Designed by <span className="text-primary font-medium">Tharushika Sadan</span> &mdash; <span className="text-white font-medium">3vox</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
