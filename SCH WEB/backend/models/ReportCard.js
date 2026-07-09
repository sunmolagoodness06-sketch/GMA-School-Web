import mongoose from 'mongoose';

const reportCardSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
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
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  division: {
    type: String,
    enum: ['nursery', 'primary', 'secondary', 'college'],
    required: true
  },
  class: {
    type: String,
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
reportCardSchema.index({ division: 1, class: 1, session: 1 });
reportCardSchema.index({ uploadedAt: -1 });

// Ensure one report card per student per term per session
reportCardSchema.index(
  { studentId: 1, term: 1, session: 1 }, 
  { unique: true }
);

// Static method to find report cards for a student
reportCardSchema.statics.findByStudent = function(studentId, session = null) {
  const query = { studentId, isActive: true };
  if (session) {
    query.session = session;
  }
  return this.find(query).sort({ session: -1, term: 1 });
};

// Static method to find report cards by class
reportCardSchema.statics.findByClass = function(division, className, term, session) {
  return this.find({
    division,
    class: className,
    term,
    session,
    isActive: true
  }).populate('studentId', 'fullName regNumber').sort({ 'studentId.fullName': 1 });
};

export default mongoose.model('ReportCard', reportCardSchema);