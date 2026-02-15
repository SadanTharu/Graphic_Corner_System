import { useState } from 'react';
import { Upload, X, File, Loader, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentUploadModal = ({ isOpen, onClose, onSubmit, paymentDetails, walletBalance = 0, onWalletPay }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a payment slip');
      return;
    }

    setUploading(true);

    try {
      // Upload file to backend
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

      // Call the parent submit handler with the uploaded file URL
      await onSubmit({
        slip: uploadData.file.url,
        reference: reference || `PAY-${Date.now()}`
      });

      toast.success('Payment slip uploaded successfully');
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload payment slip');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setReference('');
    setPaymentMethod('bank');
    onClose();
  };

  const handleWalletPay = async () => {
    if (!onWalletPay) return;
    if (walletBalance < (paymentDetails?.amount || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setUploading(true);
    try {
      await onWalletPay();
      // Parent handler manages toast, modal close, and data refresh
    } catch (error) {
      console.error('Wallet payment error:', error);
      toast.error(error.message || 'Wallet payment failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-lightGray rounded-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Make Payment</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-darker rounded-lg transition-colors"
            disabled={uploading}
          >
            <X size={20} className="text-textGray" />
          </button>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-darker p-4 rounded-lg space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-textGray">Payment Type:</span>
              <span className="text-white font-semibold capitalize">
                {paymentDetails.type?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-textGray">Amount:</span>
              <span className="text-primary font-bold text-lg">
                LKR {paymentDetails.amount?.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method Tabs */}
        {onWalletPay && (
          <div className="flex space-x-2 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                paymentMethod === 'bank'
                  ? 'bg-primary text-white'
                  : 'bg-darker text-textGray hover:text-white'
              }`}
            >
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                paymentMethod === 'wallet'
                  ? 'bg-primary text-white'
                  : 'bg-darker text-textGray hover:text-white'
              }`}
            >
              <Wallet size={16} />
              <span>Pay with Wallet</span>
            </button>
          </div>
        )}

        {paymentMethod === 'wallet' && onWalletPay ? (
          /* Wallet Payment */
          <div className="space-y-4">
            <div className="bg-darker p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-textGray">Wallet Balance:</span>
                <span className={`text-lg font-bold ${walletBalance >= (paymentDetails?.amount || 0) ? 'text-green-500' : 'text-red-500'}`}>
                  LKR {walletBalance?.toLocaleString()}
                </span>
              </div>
              {walletBalance < (paymentDetails?.amount || 0) && (
                <p className="text-red-400 text-sm">
                  Insufficient balance. You need LKR {((paymentDetails?.amount || 0) - walletBalance).toLocaleString()} more.
                </p>
              )}
              {walletBalance >= (paymentDetails?.amount || 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-textGray">After payment:</span>
                  <span className="text-white font-semibold">
                    LKR {(walletBalance - (paymentDetails?.amount || 0)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
              <p className="text-green-400 text-sm">
                Wallet payments are instant and auto-verified — no admin approval needed!
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWalletPay}
                className="flex-1 btn-primary flex items-center justify-center"
                disabled={uploading || walletBalance < (paymentDetails?.amount || 0)}
              >
                {uploading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet size={18} className="mr-2" />
                    Pay LKR {paymentDetails?.amount?.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Bank Transfer Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reference Number (Optional) */}
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

            {/* Bank Instructions */}
            <div className="bg-darker p-4 rounded-lg">
              <p className="text-white font-semibold mb-2">Bank Transfer Details:</p>
              <div className="text-sm text-textGray space-y-1">
                <p>Bank: Commercial Bank of Ceylon</p>
                <p>Account Name: Graphic Corner (Pvt) Ltd</p>
                <p>Account Number: 1234567890</p>
                <p>Branch: Colombo Main Branch</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary flex items-center justify-center"
                disabled={uploading || !selectedFile}
              >
                {uploading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Uploading...
                  </>
                ) : (
                  'Submit Payment'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentUploadModal;
