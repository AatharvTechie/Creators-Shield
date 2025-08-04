import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  sessionId: { type: String, unique: true, required: true },
  device: { type: String },
  userAgent: { type: String },
  ipAddress: { type: String },
  browser: { type: String },
  os: { type: String },
  location: { type: String },
  isCurrentSession: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  loggedOutAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: function() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }},
}, { collection: 'sessions' });

// Index for better query performance
sessionSchema.index({ user: 1, lastActive: -1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = (mongoose.models && mongoose.models.Session)
  ? mongoose.models.Session
  : mongoose.model('Session', sessionSchema);

export default Session; 