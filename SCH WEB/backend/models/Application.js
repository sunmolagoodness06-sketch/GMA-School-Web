import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true
  },
  applicantName: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    }
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  divisionApplied: {
    type: String,
    enum: ['nursery', 'primary', 'secondary', 'college'],
    required: true
  },
  classApplied: {
    type: String,
    required: true,
    trim: true
  },
  sessionApplied: {
    type: String,
    required: true
  },
  parentInfo: {
    father: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      occupation: String,
      phone: {
        type: String,
        required: true
      },
      email: {
        type: String,
        lowercase: true
      },
      address: String
    },
    mother: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      occupation: String,
      phone: {
        type: String,
        required: true
      },
      email: {
        type: String,
        lowercase: true
      },
      address: String
    },
    guardian: {
      name: String,
      relationship: String,
      phone: String,
      email: {
        type: String,
        lowercase: true
      },
      address: String
    }
  },
  previousSchool: {
    name: String,
    address: String,
    lastClass: String,
    reasonForLeaving: String
  },
  medicalInfo: {
    bloodGroup: String,
    genotype: String,
    allergies: [String],
    medications: [String],
    disabilities: String,
    doctorName: String,
    doctorPhone: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['birth_certificate', 'passport_photo', 'medical_report', 'previous_result', 'immunization_record', 'other'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  applicationFee: {
    amount: {
      type: Number,
      required: true,
      default: 5000
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    paystackReference: String
  },
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    attended: {
      type: Boolean,
      default: false
    }
  },
  admissionDecision: {
    decision: {
      type: String,
      enum: ['pending', 'admitted', 'rejected', 'waitlisted']
    },
    decisionDate: Date,
    decisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: String,
    conditions: [String]
  },
  communicationHistory: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'phone', 'in_person'],
      required: true
    },
    subject: String,
    message: {
      type: String,
      required: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    delivered: {
      type: Boolean,
      default: false
    }
  }],
  notes: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  linkedStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
applicationSchema.index({ status: 1 });
applicationSchema.index({ divisionApplied: 1, sessionApplied: 1 });
applicationSchema.index({ 'parentInfo.father.email': 1 });
applicationSchema.index({ 'parentInfo.mother.email': 1 });
applicationSchema.index({ createdAt: -1 });

// Text search index
applicationSchema.index({
  'applicantName.firstName': 'text',
  'applicantName.lastName': 'text',
  'parentInfo.father.name': 'text',
  'parentInfo.mother.name': 'text'
});

// Virtual for full name
applicationSchema.virtual('fullName').get(function() {
  const { firstName, middleName, lastName } = this.applicantName;
  return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
});

// Virtual for age calculation
applicationSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Static method to generate application number
applicationSchema.statics.generateApplicationNumber = async function() {
  const count = await this.countDocuments({
    applicationNumber: { $regex: '^APP/' }
  });

  return `APP/${(count + 1).toString().padStart(5, '0')}`;
};

// Static method to find applications by status
applicationSchema.statics.findByStatus = function(status, division = null, session = null) {
  const query = { status, isActive: true };
  if (division) query.divisionApplied = division;
  if (session) query.sessionApplied = session;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find applications requiring action
applicationSchema.statics.findRequiringAction = function() {
  return this.find({
    status: { $in: ['pending', 'under_review'] },
    'applicationFee.paid': true,
    isActive: true
  }).sort({ createdAt: 1 });
};

// Method to add communication record
applicationSchema.methods.addCommunication = function(communicationData) {
  this.communicationHistory.push(communicationData);
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, userId, remarks = null, conditions = []) {
  this.status = newStatus;

  if (['approved', 'rejected', 'waitlisted'].includes(newStatus)) {
    this.admissionDecision = {
      decision: newStatus === 'approved' ? 'admitted' : newStatus,
      decisionDate: new Date(),
      decisionBy: userId,
      remarks,
      conditions
    };
  }

  return this.save();
};

export default mongoose.model('Application', applicationSchema);