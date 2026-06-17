import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Letter from '@/lib/models/Letter';
import Topic from '@/lib/models/Topic';
import Subcategory from '@/lib/models/Subcategory';
import Category from '@/lib/models/Category';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query: string = (body.query || '').trim();
    const limit: number = Math.min(body.limit || 10, 30);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    const queryEmbedding = await generateEmbedding(query);

    const letters = await Letter.find({ embedding: { $exists: true, $not: { $size: 0 } } }).lean();

    if (letters.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No embeddings found. Please run the backfill script first.',
      });
    }

    const scored = letters
      .map((letter: any) => ({
        letter,
        score: cosineSimilarity(queryEmbedding, letter.embedding || []),
      }))
      .filter((item) => item.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const topicIds = [...new Set(scored.map((s) => s.letter.topic?.toString()).filter(Boolean))];
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const topicMap: Record<string, any> = {};
    topics.forEach((t: any) => { topicMap[t._id.toString()] = t; });

    const subcategoryIds = [...new Set(topics.map((t: any) => t.subcategory?.toString()).filter(Boolean))];
    const subcategories = await Subcategory.find({ _id: { $in: subcategoryIds } }).lean();
    const subcategoryMap: Record<string, any> = {};
    subcategories.forEach((s: any) => { subcategoryMap[s._id.toString()] = s; });

    const categoryIds = [...new Set(subcategories.map((s: any) => s.category?.toString()).filter(Boolean))];
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap: Record<string, any> = {};
    categories.forEach((c: any) => { categoryMap[c._id.toString()] = c; });

    const results = scored.map(({ letter, score }) => {
      const topic = topicMap[letter.topic?.toString()] || null;
      const subcategory = topic ? subcategoryMap[topic.subcategory?.toString()] || null : null;
      const category = subcategory ? categoryMap[subcategory.category?.toString()] || null : null;

      return {
        _id: letter._id,
        title: letter.title || '',
        content: letter.content || '',
        letter_type: letter.letter_type || '',
        level: letter.level || '',
        createdAt: letter.createdAt || null,
        score: Math.round(score * 100) / 100,
        topic: topic ? { _id: topic._id, name: topic.name } : null,
        subcategory: subcategory ? { _id: subcategory._id, name: subcategory.name } : null,
        category: category ? { _id: category._id, name: category.name } : null,