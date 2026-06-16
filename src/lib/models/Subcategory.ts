import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subcategory name'],
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    required: [true, 'Please provide at least one category'],
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

// Ensure name is unique across all categories
SubcategorySchema.index({ name: 1 }, { unique: true });
// Create an index for faster category lookups
SubcategorySchema.index({ categories: 1 });

// Clear existing model to prevent cache issues
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);
export default Subcategory;