import mongoose from 'mongoose';

const gradeFromTotal = (total) => {
  if (total >= 75) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
};

const REMARK_FOR_GRADE = { A: 'Excellent', B: 'Very Good', C: 'Good', D: 'Fair', F: 'Poor' };

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
  division: {
    type: String,
    enum: ['nursery', 'primary', 'secondary', 'college'],
    required: true
  },
  class: {
    type: String,
    required: true
  },
  // 'manual' entries carry the structured fields below and render as an
  // official on-screen document; 'uploaded' ones are just a scanned/typed
  // PDF on file (the older, pre-existing flow — kept for schools that still
  // want to attach an external file instead of typing scores in directly).
  type: {
    type: String,
    enum: ['manual', 'uploaded'],
    required: true,
    default: 'uploaded'
  },

  subjects: [{
    name: { type: String, required: true, trim: true },
    ca1: { type: Number, min: 0, default: 0 },
    ca2: { type: Number, min: 0, default: 0 },
    exam: { type: Number, min: 0, default: 0 },
    total: { type: Number, default: 0 },
    grade: String,
    remark: String
  }],
  attendance: {
    daysPresent: { type: Number, min: 0 },
    daysAbsent: { type: Number, min: 0 },
    totalDays: { type: Number, min: 0 }
  },
  summary: {
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    overallGrade: String,
    position: String,
    numberInClass: Number
  },
  classTeacherComment: { type: String, trim: true },
  principalComment: { type: String, trim: true },
  nextTermBeginsDate: Date,

  // Only used by 'uploaded' report cards
  fileUrl: String,
  fileName: String,
  fileSize: Number,

  // A manually-entered report card starts as a draft so a parent/student
  // never sees half-filled-in scores — staff publish it once it's ready.
  // Uploaded files are published immediately (there's nothing to "finish").
  isPublished: {
    type: Boolean,
    default: function() { return this.type === 'uploaded'; }
  },

  uploadedBy: {
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
reportCardSchema.index({ division: 1, class: 1, session: 1 });
reportCardSchema.index({ uploadedAt: -1 });

// Ensure one report card per student per term per session
reportCardSchema.index(
  { studentId: 1, term: 1, session: 1 },
  { unique: true }
);

// Recompute each subject's total/grade/remark from its scores, and the
// overall summary from the subjects — always derived, never hand-typed, so
// the numbers on screen can't drift from what was actually entered.
reportCardSchema.pre('validate', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    this.subjects.forEach((subject) => {
      subject.total = (subject.ca1 || 0) + (subject.ca2 || 0) + (subject.exam || 0);
      subject.grade = gradeFromTotal(subject.total);
      subject.remark = REMARK_FOR_GRADE[subject.grade];
    });

    this.summary = this.summary || {};
    this.summary.totalScore = this.subjects.reduce((sum, s) => sum + s.total, 0);
    this.summary.averageScore = Math.round((this.summary.totalScore / this.subjects.length) * 10) / 10;
    this.summary.overallGrade = gradeFromTotal(this.summary.averageScore);
  }
  next();
});

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
