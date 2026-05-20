import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Letter from '../../../lib/models/Letter';
import Topic from '../../../lib/models/Topic';

function getId(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return String(value);
}

function normalizeLetter(letter) {
  const topicValue = letter.topic ?? letter['topic'] ?? letter['topic_id'] ?? letter['`topic_id`'];
  return {
    _id: letter._id ?? letter.id ?? letter['`id`'],
    title: letter.title ?? letter['`title`'] ?? letter['title'] ?? '',
    content: letter.content ?? letter['`content`'] ?? letter['content'] ?? '',
    topic: topicValue?._id ?? topicValue ?? topicValue?.id ?? topicValue?.['`id`'] ?? '',
    letter_type: letter.letter_type ?? letter['`letter_type`'] ?? letter['letter_type'] ?? '',
    level: letter.level ?? letter['`level`'] ?? letter['level'] ?? '',
    full_code: letter.full_code ?? letter['`full_code`'] ?? letter['full_code'] ?? '',
    createdAt: letter.createdAt ?? letter['`created_at`'] ?? letter['created_at'] ?? null,
  };
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    const letters = await Letter.find({}).sort({ createdAt: -1 }).lean();
    const normalizedLetters = letters.map(normalizeLetter);

    const topicAliasMap = {};
    if (topicId) {
      const topics = await Topic.find({}).lean();
      topics.forEach((topic) => {
        const normalizedTopicId = getId(topic._id ?? topic.id ?? topic['`id`']);
        const legacyTopicId = getId(topic.id ?? topic['`id`']);
        if (legacyTopicId && legacyTopicId !== normalizedTopicId) {
          topicAliasMap[legacyTopicId] = normalizedTopicId;
        }
        topicAliasMap[normalizedTopicId] = normalizedTopicId;
      });
    }

    const filtered = topicId
      ? normalizedLetters.filter((letter) => {
          const expectedTopicId = topicAliasMap[topicId] || topicId;
          const letterTopicId = letter.topic;
          const normalizedLetterTopicId = topicAliasMap[letterTopicId] || letterTopicId;
          return normalizedLetterTopicId === expectedTopicId;
        })
      : normalizedLetters;
    return NextResponse.json({ letters: filtered });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
