import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/lib/models/Topic';

function normalizeTopic(topic) {
  const subcategoryValue = topic.subcategory ?? topic['subcategory'] ?? topic['subcategory_id'] ?? topic['`subcategory_id`'];
  return {
    _id: topic._id ?? topic.id ?? topic['`id`'],
    name: topic.name ?? topic['`name`'] ?? topic['name'] ?? '',
    slug: topic.slug ?? topic['`slug`'] ?? topic['slug'] ?? '',
    description: topic.description ?? topic['`description`'] ?? topic['description'] ?? '',
    subcategory: subcategoryValue?._id ?? subcategoryValue ?? subcategoryValue?.id ?? subcategoryValue?.['`id`'] ?? '',
    createdAt: topic.createdAt ?? topic['`created_at`'] ?? topic['created_at'] ?? null,
  };
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId');

    const topics = await Topic.find({}).sort({ createdAt: -1 }).lean();
    const normalizedTopics = topics.map(normalizeTopic);
    const filtered = subcategoryId
      ? normalizedTopics.filter((topic) => {
          const topicSubId = topic.subcategory?._id ? String(topic.subcategory._id) : String(topic.subcategory);
          return topicSubId === String(subcategoryId);
        })
      : normalizedTopics;
    return NextResponse.json({ topics: filtered });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
