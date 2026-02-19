import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Services from './pages/public/Services';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewRequest from './pages/customer/NewRequest';
import CustomerOrdersHub from './pages/customer/CustomerOrdersHub';
import Wallet from './pages/customer/Wallet';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminCatalog from './pages/admin/AdminCatalog';
import AdminOrdersHub from './pages/admin/AdminOrdersHub';
import AdminPaymentsHub from './pages/admin/AdminPaymentsHub';
import AdminTeam from './pages/admin/AdminTeam';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminBanners from './pages/admin/AdminBanners';

// Team Pages
import TeamDashboard from './pages/team/TeamDashboard';
import TeamTasks from './pages/team/TeamTasks';

// Shared Pages
import Profile from './pages/shared/Profile';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-dark">
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/services" element={<Services />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Customer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
                <Route path="new-request" element={<NewRequest />} />
                <Route path="my-orders" element={<CustomerOrdersHub />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="orders" element={<AdminOrdersHub />} />
                <Route path="catalog" element={<AdminCatalog />} />
                <Route path="payments" element={<AdminPaymentsHub />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Team Routes */}
              <Route
                path="/team"
                element={
                  <ProtectedRoute requiredRole="team">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/team/dashboard" replace />} />
                <Route path="dashboard" element={<TeamDashboard />} />
                <Route path="tasks" element={<TeamTasks />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-dark">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <p className="text-textGray text-lg mb-6">Page not found</p>
                    <a href="/" className="btn-primary px-6 py-3">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#2A2A2A',
                  color: '#fff',
                  border: '1px solid #E63946'
                }
              }}
            />
          </div>
        </Router>
      </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
