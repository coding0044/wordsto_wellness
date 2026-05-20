const mongoose = require('mongoose');
const Category = require('../app/lib/models/Category');
const dbConnect = require('../app/lib/db');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment');
  process.exit(1);
}

const seedCategories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    // Check existing categories
    const existingCategories = await Category.find({});
    console.log(`📊 Found ${existingCategories.length} existing categories`);

    if (existingCategories.length > 0) {
      console.log('📋 Existing categories:');
      existingCategories.forEach(cat => console.log(`   - ${cat.name}`));
      console.log('ℹ️  Categories already exist. No seeding needed.');
      process.exit(0);
    }

    // Seed categories
    const categories = [
      {
        name: 'Anxiety',
        slug: 'anxiety',
        description: 'Letters and resources for managing anxiety and stress'
      },
      {
        name: 'Depression',
        slug: 'depression',
        description: 'Supportive letters for dealing with depression'
      },
      {
        name: 'Relationships',
        slug: 'relationships',
        description: 'Letters for navigating relationship challenges'
      },
      {
        name: 'Self-Esteem',
        slug: 'self-esteem',
        description: 'Letters to build confidence and self-worth'
      }
    ];

    console.log('🌱 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Successfully created ${createdCategories.length} categories`);
    createdCategories.forEach(cat => console.log(`   - ${cat.name}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
