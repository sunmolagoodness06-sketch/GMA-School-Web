import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
      required: true,
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
studentSchema.statics.generateRegNumber = async function(division, session) {
  const year = session.split('/')[0];
  const divisionCode = {
    'nursery': 'NUR',
    'primary': 'PRI',
    'secondary': 'SEC',
    'college': 'COL'
  }[division];
  
  // Find the last student in this division for this session
  const lastStudent = await this.findOne({
    division,
    session,
    regNumber: { $regex: `^GMA/${divisionCode}/${year}/` }
  }).sort({ regNumber: -1 });
  
  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.regNumber.split('/').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `GMA/${divisionCode}/${year}/${nextNumber.toString().padStart(4, '0')}`;
};

// Static method to find students by division and class
studentSchema.statics.findByDivisionAndClass = function(division, className, session) {
  return this.find({
    division,
    class: className,
    session,
    isActive: true
  }).populate('userId', 'email isActive').sort({ fullName: 1 });
};

// Method to get student's full info with user data
studentSchema.methods.getFullInfo = function() {
  return this.populate('userId', 'email role isActive lastLogin');
};

export default mongoose.model('Student', studentSchema);