import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subcategory name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category'],
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

// Compound index to ensure unique subcategory names within a category
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

// Clear existing model to prevent cache issues
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);
export default Subcategory;