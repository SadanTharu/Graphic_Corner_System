const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const clientSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  name: String,
  contact: String,
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  customerType: {
    type: String,
    enum: ['monthly_subscription', 'task_based'],
    default: 'task_based',
    description: 'monthly_subscription = Membership packages, task_based = Custom task packages'
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    description: 'Reference to membership package if monthly_subscription type'
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  tasksCompleted: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  paymentTracking: {
    lastAdvancePaid: Date,
    lastBalancePaid: Date,
    isAdvancePaid: { type: Boolean, default: false },
    nextPaymentDue: { type: Number, default: 0 },
    nextPaymentDate: Date
  },
  // Service entitlements granted by membership or admin (remaining counts)
  serviceEntitlements: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    remaining: { type: Number, default: 0 }
  }]
}, { timestamps: true });


clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


clientSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
}


module.exports = mongoose.model('Client', clientSchema);