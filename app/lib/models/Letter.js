import mongoose from 'mongoose';

const LetterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a letter title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide letter content'],
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Please provide a topic'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Clear existing model to prevent cache issues
const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
export default Letter;