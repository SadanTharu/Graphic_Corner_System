import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {success ? 'Password Reset!' : 'Set New Password'}
          </h2>
          <p className="text-textGray mt-2">
            {success
              ? 'Your password has been changed successfully'
              : 'Enter your new password below'}
          </p>
        </div>

        {success ? (
          /* Success State */
          <div className="card text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mx-auto">
              <CheckCircle className="text-green-400" size={40} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">All Set!</h3>
              <p className="text-textGray mt-2 text-sm">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary"
            >
              Go to Login
            </button>
          </div>
        ) : (
          /* Reset Form */
          <>
            <form onSubmit={handleSubmit} className="card space-y-6">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="Enter new password (min 6 chars)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textGray hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-textGray hover:text-white text-sm transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
