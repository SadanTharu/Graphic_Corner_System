import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
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
            <Mail className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white">Forgot Password?</h2>
          <p className="text-textGray mt-2">
            {sent
              ? 'Check your email for the reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          /* Success State */
          <div className="card text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mx-auto">
              <CheckCircle className="text-green-400" size={40} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Email Sent!</h3>
              <p className="text-textGray mt-2 text-sm">
                If an account exists for <span className="text-white font-medium">{email}</span>, 
                you will receive a password reset link shortly.
              </p>
              <p className="text-textGray mt-2 text-xs">
                The link will expire in 1 hour. Check your spam folder if you don't see it.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full btn-primary"
              >
                Send Again
              </button>
              <Link
                to="/login"
                className="block w-full text-center text-textGray hover:text-white text-sm transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Email Form */
          <>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
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

export default ForgotPassword;
