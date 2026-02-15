import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet = () => {
  const { wallet, addFunds } = useCart();
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'credit',
      amount: 5000,
      description: 'Top-up via Bank Transfer',
      date: '2026-02-12',
      status: 'completed'
    },
    {
      id: 2,
      type: 'debit',
      amount: 1500,
      description: 'Payment for Order #1',
      date: '2026-02-10',
      status: 'completed'
    },
    {
      id: 3,
      type: 'credit',
      amount: 10000,
      description: 'Top-up via Card',
      date: '2026-02-08',
      status: 'completed'
    }
  ];

  const handleTopUp = () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addFunds(amountNum);
    toast.success(`LKR ${amountNum.toLocaleString()} added to wallet!`);
    setAmount('');
    setShowTopUp(false);
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
                  <p className="text-textGray text-sm">{transaction.date}</p>
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
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
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
            <h3 className="text-2xl font-bold text-white mb-6">Top Up Wallet</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Amount (LKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 bg-darker text-textGray rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-medium"
                  >
                    {quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="bg-darker p-4 rounded-lg">
                <p className="text-textGray text-sm mb-2">Payment Methods</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input type="radio" name="payment" className="text-primary" defaultChecked />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="flex items-center space-x-3 text-white cursor-pointer">
                    <input type="radio" name="payment" className="text-primary" />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTopUp(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleTopUp} className="flex-1 btn-primary">
                Confirm Top Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
