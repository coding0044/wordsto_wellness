import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a topic name'],
    trim: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: [true, 'Please provide a subcategory'],
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique topic names within a subcategory
TopicSchema.index({ name: 1, subcategory: 1 }, { unique: true });

// Clear existing model to prevent cache issues
const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
export default Topic;