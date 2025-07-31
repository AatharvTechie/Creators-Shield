import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
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
    enum: ['connected', 'pending_disable', 'disabled'],
    default: 'disabled'
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  data: {
    channelId: String,
    accountId: String,
    subscribers: Number,
    followers: Number,
    views: Number,
    posts: Number,
    videos: Number
  },
  accessToken: String,
  refreshToken: String
}, {
  timestamps: true
});

// Compound index to ensure one platform per user
platformSchema.index({ userId: 1, platform: 1 }, { unique: true });

const Platform = mongoose.models.Platform || mongoose.model('Platform', platformSchema);

export default Platform; 