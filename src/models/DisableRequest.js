import mongoose from 'mongoose';

const disableRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'tiktok'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: String, // admin email
  adminNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

const DisableRequest = mongoose.models.DisableRequest || mongoose.model('DisableRequest', disableRequestSchema);

export default DisableRequest; 