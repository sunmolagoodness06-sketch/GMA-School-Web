import mongoose from 'mongoose';

const feeScheduleSchema = new mongoose.Schema({
  division: {
    type: String,
    enum: ['nursery', 'primary', 'secondary', 'college'],
    required: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: String,
    enum: ['first', 'second', 'third'],
    required: true
  },
  session: {
    type: String,
    required: true
  },
  feeItems: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['tuition', 'registration', 'uniform', 'books', 'transport', 'feeding', 'development', 'other'],
      default: 'other'
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  latePaymentFee: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentPlan: {
    allowInstallments: {
      type: Boolean,
      default: false
    },
    numberOfInstallments: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    installmentAmount: Number,
    installmentDates: [Date]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
feeScheduleSchema.index({ dueDate: 1 });
feeScheduleSchema.index({ isActive: 1 });

// Ensure one fee schedule per class per term per session
feeScheduleSchema.index(
  { division: 1, class: 1, term: 1, session: 1 }, 
  { unique: true }
);

// Calculate total amount before saving
feeScheduleSchema.pre('save', function(next) {
  if (this.feeItems && this.feeItems.length > 0) {
    this.totalAmount = this.feeItems.reduce((total, item) => {
      return total + (item.isOptional ? 0 : item.amount);
    }, 0);
  }
  next();
});

// Static method to find fee schedules for a division and term
feeScheduleSchema.statics.findByDivisionAndTerm = function(division, term, session, className = null) {
  const query = { division, term, session, isActive: true };
  if (className) {
    query.class = className;
  }
  return this.find(query).sort({ class: 1 });
};

// Static method to get current active fee schedules
feeScheduleSchema.statics.getCurrentFees = function(division, className, session) {
  return this.find({
    division,
    class: className,
    session,
    isActive: true,
    dueDate: { $gte: new Date() }
  }).sort({ dueDate: 1 });
};

// Method to calculate total with optional items
feeScheduleSchema.methods.calculateTotal = function(includeOptional = false) {
  return this.feeItems.reduce((total, item) => {
    if (item.isOptional && !includeOptional) {
      return total;
    }
    return total + item.amount;
  }, 0);
};

export default mongoose.model('FeeSchedule', feeScheduleSchema);