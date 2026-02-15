import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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
import AdminServices from './pages/admin/AdminServices';
import AdminFinance from './pages/admin/AdminFinance';
import AdminTeam from './pages/admin/AdminTeam';
import AdminPackages from './pages/admin/AdminPackages';

// Team Pages
import TeamTasks from './pages/team/TeamTasks';

function App() {
  return (
    <AuthProvider>
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
                <Route path="overview" element={<AdminOverview />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="packages" element={<AdminPackages />} />
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
                <Route path="tasks" element={<TeamTasks />} />
              </Route>
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
    </AuthProvider>
  );
}

export default App;
