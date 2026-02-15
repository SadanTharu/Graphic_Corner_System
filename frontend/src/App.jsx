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

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewRequest from './pages/customer/NewRequest';
import MyOrders from './pages/customer/MyOrders';
import Wallet from './pages/customer/Wallet';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminOrders from './pages/admin/AdminOrders';
import AdminServices from './pages/admin/AdminServices';
import AdminFinance from './pages/admin/AdminFinance';
import AdminPayments from './pages/admin/AdminPayments';
import AdminTeam from './pages/admin/AdminTeam';
import AdminPackages from './pages/admin/AdminPackages';

// Team Pages
import TeamTasks from './pages/team/TeamTasks';

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
                <Route path="my-orders" element={<MyOrders />} />
                <Route path="wallet" element={<Wallet />} />
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
                <Route path="orders" element={<AdminOrders />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="team" element={<AdminTeam />} />
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
                <Route index element={<Navigate to="/team/tasks" replace />} />
                <Route path="tasks" element={<TeamTasks />} />
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
