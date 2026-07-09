import mongoose from 'mongoose';

const careerApplicationSchema = new mongoose.Schema({
  fullName: {
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
  position: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true
  },
  education: {
    type: String,
    trim: true
  },
  coverLetter: {
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

careerApplicationSchema.index({ status: 1 });
careerApplicationSchema.index({ position: 1 });
careerApplicationSchema.index({ createdAt: -1 });

export default mongoose.model('CareerApplication', careerApplicationSchema);