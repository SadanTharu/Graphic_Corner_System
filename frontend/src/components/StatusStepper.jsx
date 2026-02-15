import { Check, Clock, Upload, Eye, DollarSign } from 'lucide-react';
import { statusSteps } from '../data';

const StatusStepper = ({ order, onUploadPayment, onRequestRevision, onApprove, orientation = 'horizontal' }) => {
  const currentStepIndex = order.currentStep - 1;

  const getStepIcon = (stepIndex) => {
    if (stepIndex < currentStepIndex) return Check;
    if (stepIndex === currentStepIndex) return Clock;
    return null;
  };

  const getStepColor = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'bg-green-500 border-green-500';
    if (stepIndex === currentStepIndex) return 'bg-primary border-primary';
    return 'bg-gray-700 border-gray-700';
  };

  const getLineColor = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'bg-green-500';
    return 'bg-gray-700';
  };

  const renderActionButtons = () => {
    if (order.status === 'awaiting_advance') {
      return (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onUploadPayment}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload size={18} />
            <span>Upload Payment Slip</span>
          </button>
          <div className="text-textGray text-sm">
            Amount: LKR {order.advanceAmount?.toLocaleString()} (25%)
          </div>
        </div>
      );
    }

    if (order.status === 'review' && order.files?.watermark) {
      return (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <a
              href={order.files.watermark}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye size={18} />
              <span>View Watermark</span>
            </a>
            <button
              onClick={onRequestRevision}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
            >
              Request Revision
            </button>
            <button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
            >
              Approve & Continue
            </button>
          </div>
        </div>
      );
    }

    if (order.status === 'awaiting_final') {
      return (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onUploadPayment}
            className="btn-primary flex items-center space-x-2"
          >
            <DollarSign size={18} />
            <span>Upload Final Payment</span>
          </button>
          <div className="text-textGray text-sm">
            Amount: LKR {order.finalAmount?.toLocaleString()} (75%)
          </div>
        </div>
      );
    }

    return null;
  };

  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const Icon = getStepIcon(index);
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-start">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStepColor(
                    index
                  )} transition-all ${isActive ? 'scale-110 shadow-lg' : ''}`}
                >
                  {Icon ? (
                    <Icon size={20} className="text-white" />
                  ) : (
                    <span className="text-white font-medium">{step.id}</span>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`w-0.5 h-12 ${getLineColor(index)} transition-all`} />
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1 pb-8">
                <h4
                  className={`font-semibold ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-textGray'
                  }`}
                >
                  {step.name}
                </h4>
                {isActive && (
                  <p className="text-textGray text-sm mt-1">Currently in progress...</p>
                )}
                {isCompleted && (
                  <p className="text-green-500 text-sm mt-1">✓ Completed</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        {renderActionButtons()}
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div>
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const Icon = getStepIcon(index);
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center ${getStepColor(
                    index
                  )} transition-all ${isActive ? 'scale-110 shadow-lg' : ''}`}
                >
                  {Icon ? (
                    <Icon size={18} className="text-white" />
                  ) : (
                    <span className="text-white font-medium text-sm">{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`text-xs md:text-sm mt-2 text-center font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-textGray'
                  }`}
                >
                  {step.name}
                </p>
              </div>

              {/* Connecting Line */}
              {index < statusSteps.length - 1 && (
                <div className={`h-0.5 w-full ${getLineColor(index)} transition-all -mx-2`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      {renderActionButtons()}
    </div>
  );
};

export default StatusStepper;
