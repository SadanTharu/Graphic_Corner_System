import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, CreditCard, Upload, X, File, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet = () => {
  const { wallet, setWalletBalance } = useCart();
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState('');

  // Fetch wallet data on component mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // Fetch balance
      const balanceRes = await fetch('/api/wallet/balance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setWalletBalance(balanceData.balance);
      }

      // Fetch transactions
      const transactionsRes = await fetch('/api/wallet/transactions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleTopUp = async () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedFile) {
      toast.error('Please upload a payment slip');
      return;
    }

    setUploading(true);

    try {
      // Upload payment slip first
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload payment slip');
      }

      const uploadData = await uploadRes.json();

      // Submit top-up request
      const topUpRes = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: 'bank_transfer',
          reference: reference || `TOPUP-${Date.now()}`,
          slip: uploadData.file.url
        })
      });

      if (!topUpRes.ok) {
        throw new Error('Failed to submit top-up request');
      }

      const topUpData = await topUpRes.json();
      
      toast.success('Top-up request submitted successfully!');
      setShowTopUp(false);
      setAmount('');
      setSelectedFile(null);
      setPreview(null);
      setReference('');
      
      // Refresh wallet data
      fetchWalletData();
    } catch (error) {
      console.error('Top-up error:', error);
      toast.error(error.message || 'Failed to process top-up');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Wallet</h2>
        <p className="text-textGray mt-2">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary to-red-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/80 text-sm">Available Balance</p>
            <h3 className="text-4xl font-bold text-white mt-2">
              LKR {wallet.toLocaleString()}
            </h3>
          </div>
          <div className="p-4 bg-white/20 rounded-full">
            <CreditCard size={32} className="text-white" />
          </div>
        </div>
        <button
          onClick={() => setShowTopUp(true)}
          className="w-full bg-white text-primary font-semibold py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Top Up Wallet</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-textGray text-sm mb-2">Total Credits</p>
          <p className="text-2xl font-bold text-green-500">
            LKR {transactions
              .filter(t => t.type === 'credit')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Total Debits</p>
          <p className="text-2xl font-bold text-red-500">
            LKR {transactions
              .filter(t => t.type === 'debit')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Transactions</p>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-darker rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${
                    transaction.type === 'credit'
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}
                >
                  {transaction.type === 'credit' ? (
                    <ArrowDownCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-textGray text-sm">{formatDate(transaction.createdAt || transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-lg ${
                    transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'} LKR{' '}
                  {transaction.amount.toLocaleString()}
                </p>
                <span className={`text-xs px-2 py-1 rounded capitalize ${
                  transaction.status === 'completed' 
                    ? 'bg-green-500/20 text-green-500'
                    : transaction.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Top Up Wallet</h3>
              <button
                onClick={() => {
                  setShowTopUp(false);
                  setSelectedFile(null);
                  setPreview(null);
                  setAmount('');
                  setReference('');
                }}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
                disabled={uploading}
              >
                <X size={20} className="text-textGray" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Amount (LKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 bg-darker text-textGray rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-medium"
                    disabled={uploading}
                  >
                    {quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Reference Number */}
              <div>
                <label className="label">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter bank reference number"
                  className="input-field"
                  disabled={uploading}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="label">Payment Slip *</label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="payment-slip"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="payment-slip"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      selectedFile
                        ? 'border-primary bg-primary/10'
                        : 'border-textGray hover:border-primary bg-darker hover:bg-darker/50'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-36 object-contain rounded"
                      />
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center">
                        <File size={40} className="text-primary mb-2" />
                        <p className="text-white text-sm">{selectedFile.name}</p>
                        <p className="text-textGray text-xs mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={40} className="text-textGray mb-2" />
                        <p className="text-white text-sm">Click to upload payment slip</p>
                        <p className="text-textGray text-xs mt-1">
                          JPG, PNG or PDF (Max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-darker p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">Bank Transfer Details:</p>
                <div className="text-sm text-textGray space-y-1">
                  <p>Bank: Commercial Bank of Ceylon</p>
                  <p>Account Name: Graphic Corner (Pvt) Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Branch: Colombo Main Branch</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTopUp(false);
                  setSelectedFile(null);
                  setPreview(null);
                  setAmount('');
                  setReference('');
                }}
                className="flex-1 btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleTopUp} 
                className="flex-1 btn-primary flex items-center justify-center"
                disabled={uploading || !selectedFile || !amount}
              >
                {uploading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Uploading...
                  </>
                ) : (
                  'Confirm Top Up'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
