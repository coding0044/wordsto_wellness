// import mongoose from 'mongoose';

// const LetterSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Please provide a letter title'],
//     trim: true,
//   },
//   content: {
//     type: String,
//     required: [true, 'Please provide letter content'],
//   },
//   topic: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Topic',
//     required: [true, 'Please provide a topic'],
//   },
//   letter_type: {
//     type: String,
//     trim: true,
//   },
//   level: {
//     type: String,
//     trim: true,
//   },
//   full_code: {
//     type: String,
//     trim: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Clear existing model to prevent cache issues
// const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
// export default Letter;


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
  letter_type: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    trim: true,
  },
  full_code: {
    type: String,
    trim: true,
  },
  // Milestone 4: semantic search embedding vector
  embedding: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LetterSchema.index({ createdAt: -1 });

const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
export default Letter;