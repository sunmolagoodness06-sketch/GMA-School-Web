import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeSchedule',
    required: true
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
      required: true
    },
    description: String,
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ['tuition', 'registration', 'uniform', 'books', 'transport', 'feeding', 'development', 'other']
    },
    // Optional items (e.g. uniform) are listed for visibility but excluded
    // from amountDue — carried over from the fee schedule's own isOptional
    // flag so the invoice can display them distinctly, not as owed charges.
    isOptional: {
      type: Boolean,
      default: false
    },
    // Whether this item currently counts toward amountDue. Mandatory items
    // are always true; optional items start false and a parent (or staff)
    // can opt in via the optional-items toggle route, which recomputes
    // amountDue from whichever items are currently included.
    included: {
      type: Boolean,
      default: true
    }
  }],
  amountDue: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'paystack', 'other'],
      default: 'paystack'
    },
    paystackReference: String,
    transactionId: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  latePaymentFee: {
    type: Number,
    default: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notes: String,
  // Which installment this invoice represents, when a fee schedule allows
  // splitting the total across multiple invoices. Plain (non-installment)
  // invoices are always installment 1 of 1.
  installmentNumber: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
invoiceSchema.index({ studentId: 1, term: 1, session: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ 'paymentHistory.paystackReference': 1 });

// Calculate balance before saving
invoiceSchema.pre('save', function(next) {
  this.balance = this.amountDue - this.amountPaid;
  
  // Update status based on payment
  if (this.amountPaid === 0) {
    this.status = this.dueDate < new Date() ? 'overdue' : 'pending';
  } else if (this.amountPaid >= this.amountDue) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }
  
  next();
});

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function(session) {
  const year = session.split('/')[0];
  const count = await this.countDocuments({
    invoiceNumber: { $regex: `^INV/${year}/` }
  });
  
  return `INV/${year}/${(count + 1).toString().padStart(6, '0')}`;
};

// Static method to find invoices for a student
invoiceSchema.statics.findByStudent = function(studentId, session = null) {
  const query = { studentId, isActive: true };
  if (session) {
    query.session = session;
  }
  return this.find(query)
    .populate('feeScheduleId', 'division class term')
    .sort({ dueDate: -1 });
};

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function(division = null) {
  const query = {
    status: { $in: ['pending', 'partial'] },
    dueDate: { $lt: new Date() },
    isActive: true
  };
  
  return this.find(query)
    .populate('studentId', 'fullName regNumber division class parentInfo.email parentInfo.phone')
    .populate('feeScheduleId', 'division class')
    .sort({ dueDate: 1 });
};

// Method to add payment
invoiceSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push(paymentData);
  this.amountPaid += paymentData.amount;
  return this.save();
};

// Method to apply discount
invoiceSchema.methods.applyDiscount = function(amount, reason, authorizedBy) {
  this.discount = {
    amount,
    reason,
    authorizedBy
  };
  this.amountDue -= amount;
  return this.save();
};

export default mongoose.model('Invoice', invoiceSchema);