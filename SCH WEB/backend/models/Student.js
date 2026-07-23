import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  regNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  division: {
    type: String,
    enum: ['nursery', 'primary', 'secondary', 'college'],
    required: true
  },
  session: {
    type: String,
    required: true,
    default: '2024/2025'
  },
  photoUrl: {
    type: String,
    default: null
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
  parentInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      enum: ['father', 'mother', 'guardian'],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  medicalInfo: {
    bloodGroup: String,
    allergies: [String],
    medications: [String],
    specialNeeds: String
  },
  academicInfo: {
    admissionDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    previousSchool: String,
    subjects: [String],
    house: String // School house system
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'graduated'],
    default: 'active'
  },
  graduatedAt: {
    type: Date,
    default: null
  },
  notes: [String] // Admin notes about the student
}, {
  timestamps: true
});

// Indexes for performance
studentSchema.index({ division: 1, class: 1 });
studentSchema.index({ session: 1 });
studentSchema.index({ 'parentInfo.email': 1 });
studentSchema.index({ fullName: 'text' }); // Text search

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
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

// Static method to generate registration number
studentSchema.statics.generateRegNumber = async function(division) {
  const divisionCode = {
    'nursery': 'NUR',
    'primary': 'PRI',
    'secondary': 'SEC',
    'college': 'COL'
  }[division];

  // Find the last student in this division, regardless of session — the
  // number no longer resets each year
  const lastStudent = await this.findOne({
    division,
    regNumber: { $regex: `^GMA/${divisionCode}/` }
  }).sort({ regNumber: -1 });

  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.regNumber.split('/').pop());
    nextNumber = lastNumber + 1;
  }

  return `GMA/${divisionCode}/${nextNumber.toString().padStart(4, '0')}`;
};

// Static method to find students currently enrolled in a division/class —
// used for things like billing, where "who's in this class right now"
// matters, not what session string happens to be on their own record (that
// field is independently editable per student and drifts out of sync with
// whatever a fee schedule's session is labelled, so it's deliberately not
// part of this filter).
studentSchema.statics.findByDivisionAndClass = function(division, className) {
  return this.find({
    division,
    class: className,
    // $ne (not the stricter 'active' equality) so student records that
    // predate the status field — which have no status key stored at all —
    // still match; only explicitly graduated students are excluded.
    status: { $ne: 'graduated' },
    isActive: true
  }).populate('userId', 'email isActive').sort({ fullName: 1 });
};

// Method to get student's full info with user data
studentSchema.methods.getFullInfo = function() {
  return this.populate('userId', 'email role isActive lastLogin');
};

export default mongoose.model('Student', studentSchema);