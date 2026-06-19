// import mongoose from 'mongoose';
// // import * as dotenv from 'dotenv';

// // dotenv.config({ path: '.env.local' });
// import { config } from 'dotenv';
// import { resolve } from 'path';
// config({ path: resolve(process.cwd(), '.env.local') });

// // const MONGODB_URI = process.env.MONGODB_URI || '';
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wtw-2026:Ghanghro2024@staging.2ptpuvy.mongodb.net/';

// if (!MONGODB_URI) {
//   console.error('❌ MONGODB_URI not found in .env.local');
//   process.exit(1);
// }

// const LetterSchema = new mongoose.Schema({
//   title: String,
//   content: String,
//   topic: mongoose.Schema.Types.ObjectId,
//   letter_type: String,
//   level: String,
//   full_code: String,
//   embedding: { type: [Number], default: [] },
//   createdAt: Date,
// });

// async function main() {
//   console.log('🔌 Connecting to MongoDB...');
//   await mongoose.connect(MONGODB_URI);
//   console.log('✅ Connected\n');

//   const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);

//   const { pipeline } = await import('@xenova/transformers');
//   console.log('⏳ Loading embedding model (first run downloads the model, may take a minute)...');
//   const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
//   console.log('✅ Model loaded\n');

//   const letters = await Letter.find({}).lean();
//   console.log(`📚 Found ${letters.length} letters to process\n`);

//   let updated = 0;
//   let skipped = 0;
//   let failed = 0;

//   for (const letter of letters as any[]) {
//     const hasEmbedding = Array.isArray(letter.embedding) && letter.embedding.length > 0;
//     if (hasEmbedding) {
//       skipped++;
//       continue;
//     }

//     try {
//       const text = [
//         letter.title || '',
//         letter.content || '',
//         letter.letter_type || '',
//         letter.level || '',
//       ].filter(Boolean).join(' ').slice(0, 512);

//       const output = await embedder(text, { pooling: 'mean', normalize: true });
//       const embedding = Array.from(output.data) as number[];

//       await Letter.updateOne({ _id: letter._id }, { $set: { embedding } });

//       updated++;
//       if (updated % 10 === 0) {
//         console.log(`  ✅ Processed ${updated} letters...`);
//       }
//     } catch (err) {
//       console.error(`  ❌ Failed for letter ${letter._id}:`, err);
//       failed++;
//     }
//   }

//   console.log('\n📊 Backfill complete:');
//   console.log(`  ✅ Updated: ${updated}`);
//   console.log(`  ⏭️  Skipped (already had embedding): ${skipped}`);
//   console.log(`  ❌ Failed: ${failed}`);

//   await mongoose.disconnect();
//   process.exit(0);
// }

// main().catch((err) => {
//   console.error('Fatal error:', err);
//   process.exit(1);
// });import mongoose from 'mongoose';
// import mongoose from 'mongoose';
// import { config } from 'dotenv';
// import { resolve } from 'path';
// // import { generateEmbedding } from '../src/lib/embeddings';
// import { generateEmbedding } from '../src/lib/embeddings.ts';

// config({ path: resolve(process.cwd(), '.env.local') });

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wtw-2026:Ghanghro2024@staging.2ptpuvy.mongodb.net/';

// if (!MONGODB_URI) {
//   console.error('❌ MONGODB_URI not found in .env.local');
//   process.exit(1);
// }

// const LetterSchema = new mongoose.Schema({
//   title: String,
//   content: String,
//   topic: mongoose.Schema.Types.ObjectId,
//   letter_type: String,
//   level: String,
//   full_code: String,
//   embedding: { type: [Number], default: [] },
//   createdAt: Date,
// });

// async function main() {
//   console.log('🔌 Connecting to MongoDB...');
//   await mongoose.connect(MONGODB_URI);
//   console.log('✅ Connected\n');

//   const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);

//   console.log('⏳ Using OpenAI embeddings (text-embedding-3-small)...\n');

//   const letters = await Letter.find({}).lean();
//   console.log(`📚 Found ${letters.length} letters to process\n`);

//   let updated = 0;
//   let skipped = 0;
//   let failed = 0;

//   for (const letter of letters as any[]) {
//     const hasEmbedding = Array.isArray(letter.embedding) && letter.embedding.length > 0;
//     if (hasEmbedding) {
//       skipped++;
//       continue;
//     }

//     try {
//       const text = [
//         letter.title || '',
//         letter.content || '',
//         letter.letter_type || '',
//         letter.level || '',
//       ].filter(Boolean).join(' ').slice(0, 2000);

//       const embedding = await generateEmbedding(text);

//       await Letter.updateOne({ _id: letter._id }, { $set: { embedding } });

//       updated++;
//       if (updated % 10 === 0) {
//         console.log(`  ✅ Processed ${updated} letters...`);
//       }
//     } catch (err) {
//       console.error(`  ❌ Failed for letter ${letter._id}:`, err);
//       failed++;
//     }
//   }

//   console.log('\n📊 Backfill complete:');
//   console.log(`  ✅ Updated: ${updated}`);
//   console.log(`  ⏭️  Skipped (already had embedding): ${skipped}`);
//   console.log(`  ❌ Failed: ${failed}`);

//   await mongoose.disconnect();
//   process.exit(0);
// }

// main().catch((err) => {
//   console.error('Fatal error:', err);
//   process.exit(1);
// });



import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wtw-2026:Ghanghro2024@staging.2ptpuvy.mongodb.net/';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI embedding request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

const LetterSchema = new mongoose.Schema({
  title: String,
  content: String,
  topic: mongoose.Schema.Types.ObjectId,
  letter_type: String,
  level: String,
  full_code: String,
  embedding: { type: [Number], default: [] },
  createdAt: Date,
});

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');

  const Letter = mongoose.models.Letter || mongoose.model('Letter', LetterSchema);

  console.log('⏳ Using OpenAI embeddings (text-embedding-3-small)...\n');

  const letters = await Letter.find({}).lean();
  console.log(`📚 Found ${letters.length} letters to process\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const letter of letters as any[]) {
    const hasEmbedding = Array.isArray(letter.embedding) && letter.embedding.length > 0;
    if (hasEmbedding) {
      skipped++;
      continue;
    }

    try {
      const text = [
        letter.title || '',
        letter.content || '',
        letter.letter_type || '',
        letter.level || '',
      ].filter(Boolean).join(' ').slice(0, 2000);

      const embedding = await generateEmbedding(text);

      await Letter.updateOne({ _id: letter._id }, { $set: { embedding } });

      updated++;
      if (updated % 10 === 0) {
        console.log(`  ✅ Processed ${updated} letters...`);
      }
    } catch (err) {
      console.error(`  ❌ Failed for letter ${letter._id}:`, err);
      failed++;
    }
  }

  console.log('\n📊 Backfill complete:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⏭️  Skipped (already had embedding): ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});