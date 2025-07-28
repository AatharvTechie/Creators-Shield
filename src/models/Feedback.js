import mongoose from 'mongoose';

const singleFeedbackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: {
    type: String,
    required: function() {
      return this.type === 'general';
    }
  },
  description: { type: String, required: true },
  message: { type: String }, // always optional
  type: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'admin_read', 'replied'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reply: {
    message: { type: String },
    repliedAt: { type: Date }
  },
  creatorRead: { type: Boolean, default: false },
});

const feedbackSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  feedbacks: [singleFeedbackSchema],
}, { collection: 'feedbacks' });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 