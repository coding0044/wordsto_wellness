const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wtw-2026:Ghanghro2024@staging.2ptpuvy.mongodb.net/';

async function migrateSubcategories() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check existing data
    console.log('\n📊 Checking subcategories...');
    const allSubs = await db.collection('subcategories').find({}).toArray();
    console.log(`Found ${allSubs.length} subcategories`);

    if (allSubs.length > 0) {
      console.log('\n🔍 Sample subcategory (before migration):');
      console.log(JSON.stringify(allSubs[0], null, 2));
    }

    // Check if migration is needed
    const needsMigration = allSubs.some(sub => sub.category && !sub.categories);
    if (!needsMigration) {
      console.log('\n✅ All subcategories already have the new schema (categories array)');
      await mongoose.connection.close();
      return;
    }

    // Run migration
    console.log('\n🔄 Running migration: category → categories array...');
    const result = await db.collection('subcategories').updateMany(
      { category: { $exists: true, $ne: null } },
      [
        {
          $set: {
            categories: {
              $cond: [
                { $isArray: '$category' },
                '$category',
                ['$category']
              ]
            }
          }
        },
        { $unset: ['category'] }
      ]
    );

    console.log(`✅ Migration complete:`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    // Verify migration
    console.log('\n📊 Checking after migration...');
    const afterSubs = await db.collection('subcategories').find({}).toArray();
    if (afterSubs.length > 0) {
      console.log('\n🔍 Sample subcategory (after migration):');
      console.log(JSON.stringify(afterSubs[0], null, 2));
    }

    console.log('\n✅ Migration successful!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSubcategories();
