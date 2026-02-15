import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin/overview');
      } else if (result.user.role === 'team') {
        navigate('/team/tasks');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const quickLogin = (role) => {
    let credentials = {};
    if (role === 'admin') {
      credentials = { email: 'admin@graphiccorner.lk', password: 'admin123' };
    } else if (role === 'team') {
      credentials = { email: 'nimal@graphiccorner.lk', password: 'team123' };
    } else {
      credentials = { email: 'kasun@example.com', password: 'customer123' };
    }
    
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-white font-bold text-2xl">GC</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-textGray mt-2">Sign in to your account</p>
        </div>

        {/* Quick Login Demo Buttons */}
        <div className="mb-6 p-4 bg-lightGray/50 rounded-lg border border-gray-700">
          <p className="text-textGray text-xs mb-3 text-center">Quick Login (Demo)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('customer')}
              className="text-xs py-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
            >
              Customer
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="text-xs py-2 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('team')}
              className="text-xs py-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
            >
              Team
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-textGray text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-red-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
