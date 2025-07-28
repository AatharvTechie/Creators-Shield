import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Platform Settings
  allowRegistrations: { type: Boolean, default: true },
  strikeThreshold: { type: Number, default: 3 },
  notificationEmail: { type: String, default: 'admin-alerts@creatorshield.com' },
  notifyOnStrikes: { type: Boolean, default: true },
  notifyOnReactivations: { type: Boolean, default: true },
  matchThreshold: { type: Number, default: 85 }, // Content monitoring threshold percentage
  
  // Timestamps
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'settings' });

// Update the updatedAt field on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Settings = (mongoose.models && mongoose.models.Settings)
  ? mongoose.models.Settings
  : mongoose.model('Settings', settingsSchema);

export default Settings; 