import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Letter from '@/lib/models/Letter';
import Topic from '@/lib/models/Topic';
import Subcategory from '@/lib/models/Subcategory';
import Category from '@/lib/models/Category';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';

const MAX_LIMIT = 30;

function requireLimit(value: unknown): number {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit < 1) return 10;
  return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

function mapEntities<T extends { _id: any }>(items: T[]) {
  return items.reduce<Record<string, T>>((map, item) => {
    map[item._id.toString()] = item;
    return map;
  }, {});
}

function normalizeField(letter: any, key: string) {
  return letter[key] ?? letter[`\`${key}\``] ?? '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body.query || '').trim();
    const limit = requireLimit(body.limit);

    if (!query) {
      return NextResponse.json(
        { error: 'Query must be at least 1 character' },
        { status: 400 }
      );
    }

    await dbConnect();

    const queryEmbedding = await generateEmbedding(query);
    if (queryEmbedding.length === 0) {
      return NextResponse.json(
        { error: 'Unable to generate embedding for query' },
        { status: 500 }
      );
    }

    const letters = await Letter.find({ embedding: { $exists: true, $not: { $size: 0 } } })
      .select('_id title content letter_type level embedding topic createdAt')
      .lean();

    if (letters.length === 0) {
      return NextResponse.json({ results: [], message: 'No embeddings found. Please run the backfill script first.' });
    }

    const scoredAll = letters
      .map((letter: any) => ({ letter, score: cosineSimilarity(queryEmbedding, letter.embedding || []) }))
      .sort((a, b) => b.score - a.score);

    const threshold = 0.05;
    let scored = scoredAll.filter((item) => item.score >= threshold).slice(0, limit);
    if (scored.length === 0) {
      scored = scoredAll.slice(0, limit);
    }

    const topicIds = [...new Set(scored.map((s) => s.letter.topic?.toString()).filter(Boolean))];
    const topics = topicIds.length ? await Topic.find({ _id: { $in: topicIds } }).lean() : [];
    const topicMap = mapEntities(topics);

    const subcategoryIds = [...new Set(topics.map((t: any) => t.subcategory?.toString()).filter(Boolean))];
    const subcategories = subcategoryIds.length ? await Subcategory.find({ _id: { $in: subcategoryIds } }).lean() : [];
    const subcategoryMap = mapEntities(subcategories);

    const categoryIds = [...new Set(subcategories.map((s: any) => s.category?.toString()).filter(Boolean))];
    const categories = categoryIds.length ? await Category.find({ _id: { $in: categoryIds } }).lean() : [];
    const categoryMap = mapEntities(categories);

    const results = scored.map(({ letter, score }) => {
      const topic = topicMap[letter.topic?.toString()] || null;
      const subcategory = topic ? subcategoryMap[topic.subcategory?.toString()] || null : null;
      const category = subcategory ? categoryMap[subcategory.category?.toString()] || null : null;

      return {
        _id: letter._id,
        title: normalizeField(letter, 'title'),
        content: normalizeField(letter, 'content'),
        letter_type: normalizeField(letter, 'letter_type'),
        level: normalizeField(letter, 'level'),
        createdAt: letter.createdAt || null,
        score: Math.round(score * 100) / 100,
        topic: topic ? { _id: topic._id, name: topic.name } : null,
        subcategory: subcategory ? { _id: subcategory._id, name: subcategory.name } : null,
        category: category ? { _id: category._id, name: category.name } : null,
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('semantic-search error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || url.searchParams.get('query') || '').trim();
    const limit = requireLimit(url.searchParams.get('limit'));

    if (!q) {
      await dbConnect();
      const recent = await Letter.find({})
        .select('_id title content letter_type level topic createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const topicIds = [...new Set(recent.map((l: any) => l.topic?.toString()).filter(Boolean))];
      const topics = topicIds.length ? await Topic.find({ _id: { $in: topicIds } }).lean() : [];
      const topicMap = mapEntities(topics);

      const subcategoryIds = [...new Set(topics.map((t: any) => t.subcategory?.toString()).filter(Boolean))];
      const subcategories = subcategoryIds.length ? await Subcategory.find({ _id: { $in: subcategoryIds } }).lean() : [];
      const subcategoryMap = mapEntities(subcategories);

      const categoryIds = [...new Set(subcategories.map((s: any) => s.category?.toString()).filter(Boolean))];
      const categories = categoryIds.length ? await Category.find({ _id: { $in: categoryIds } }).lean() : [];
      const categoryMap = mapEntities(categories);

      const results = recent.map((letter: any) => {
        const topic = topicMap[letter.topic?.toString()] || null;
        const subcategory = topic ? subcategoryMap[topic.subcategory?.toString()] || null : null;
        const category = subcategory ? categoryMap[subcategory.category?.toString()] || null : null;

        return {
          _id: letter._id,
          title: normalizeField(letter, 'title'),
          content: normalizeField(letter, 'content'),
          letter_type: normalizeField(letter, 'letter_type'),
          level: normalizeField(letter, 'level'),
          createdAt: letter.createdAt || null,
          score: 1,
          topic: topic ? { _id: topic._id, name: topic.name } : null,
          subcategory: subcategory ? { _id: subcategory._id, name: subcategory.name } : null,
          category: category ? { _id: category._id, name: category.name } : null,
        };
      });

      return NextResponse.json({ results });
    }

    const newReq = new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: q, limit }),
    });

    return await POST(newReq);
  } catch (err: any) {
    console.error('semantic-search GET error', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
