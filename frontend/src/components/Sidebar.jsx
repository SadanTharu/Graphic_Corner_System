import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Wallet, 
  Settings, 
  Users, 
  ListChecks,
  ShoppingBag,
  CreditCard,
  Menu,
  X,
  Image,
  UserCircle,
  UsersRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const customerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Request', path: '/dashboard/new-request', icon: FileText },
    { name: 'My Orders', path: '/dashboard/my-orders', icon: Package },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle }
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Orders & Subscriptions', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Services & Packages', path: '/admin/catalog', icon: Settings },
    { name: 'Payments & Finance', path: '/admin/payments', icon: CreditCard },
    { name: 'Team', path: '/admin/team', icon: Users },
    { name: 'Customers', path: '/admin/customers', icon: UsersRound },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Profile', path: '/admin/profile', icon: UserCircle }
  ];

  const teamLinks = [
    { name: 'Dashboard', path: '/team/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/team/tasks', icon: ListChecks },
    { name: 'Profile', path: '/team/profile', icon: UserCircle }
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'team') return teamLinks;
    return customerLinks;
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-lightGray p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-lightGray border-r border-gray-800 w-64 transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Graphic Corner" className="w-10 h-10 rounded-lg object-contain" />
            <div>
              <h3 className="text-white font-bold">Graphic Corner</h3>
              <p className="text-xs text-textGray capitalize">{user?.role} Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-textGray hover:bg-darker hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-textGray text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
