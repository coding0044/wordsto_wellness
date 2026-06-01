import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Category from '../../../lib/models/Category';
import Subcategory from '../../../lib/models/Subcategory';
import Topic from '../../../lib/models/Topic';
import Letter from '../../../lib/models/Letter';
import { normalizeId, toSafeLowerCase, toSafeString } from '@/lib/api-utils';

function normalizeCategory(category) {
  return {
    _id: normalizeId(category._id ?? category.id ?? category['`id`']),
    name: category.name ?? category['`name`'] ?? category['name'] ?? '',
    slug: category.slug ?? category['`slug`'] ?? category['slug'] ?? '',
    description: category.description ?? category['`description`'] ?? category['description'] ?? '',
    createdAt: category.createdAt ?? category['`created_at`'] ?? category['created_at'] ?? null,
    subcategories: [],
  };
}

function normalizeSubcategory(subcategory) {
  return {
    _id: normalizeId(subcategory._id ?? subcategory.id ?? subcategory['`id`']),
    name: subcategory.name ?? subcategory['`name`'] ?? subcategory['name'] ?? '',
    slug: subcategory.slug ?? subcategory['`slug`'] ?? subcategory['slug'] ?? '',
    description: subcategory.description ?? subcategory['`description`'] ?? subcategory['description'] ?? '',
    category: normalizeId(subcategory.category?._id ?? subcategory.category ?? subcategory.category?.id ?? subcategory.category?.['`id`'] ?? subcategory['category_id'] ?? subcategory['`category_id`']),
    createdAt: subcategory.createdAt ?? subcategory['`created_at`'] ?? subcategory['created_at'] ?? null,
    topics: [],
  };
}

function normalizeTopic(topic) {
  return {
    _id: normalizeId(topic._id ?? topic.id ?? topic['`id`']),
    name: topic.name ?? topic['`name`'] ?? topic['name'] ?? '',
    slug: topic.slug ?? topic['`slug`'] ?? topic['slug'] ?? '',
    description: topic.description ?? topic['`description`'] ?? topic['description'] ?? '',
    subcategory: normalizeId(topic.subcategory?._id ?? topic.subcategory ?? topic.subcategory?.id ?? topic.subcategory?.['`id`'] ?? topic['subcategory_id'] ?? topic['`subcategory_id`']),
    createdAt: topic.createdAt ?? topic['`created_at`'] ?? topic['created_at'] ?? null,
    letters: [],
  };
}

function normalizeLetter(letter) {
  return {
    _id: normalizeId(letter._id ?? letter.id ?? letter['`id`']),
    title: letter.title ?? letter['`title`'] ?? letter['title'] ?? '',
    content: letter.content ?? letter['`content`'] ?? letter['content'] ?? '',
    topic: normalizeId(letter.topic?._id ?? letter.topic ?? letter.topic?.id ?? letter.topic?.['`id`'] ?? letter['topic_id'] ?? letter['`topic_id`']),
    letter_type: letter.letter_type ?? letter['`letter_type`'] ?? letter['letter_type'] ?? '',
    level: letter.level ?? letter['`level`'] ?? letter['level'] ?? '',
    full_code: letter.full_code ?? letter['`full_code`'] ?? letter['full_code'] ?? '',
    createdAt: letter.createdAt ?? letter['`created_at`'] ?? letter['created_at'] ?? null,
  };
}

export async function GET(request) {
  try {
    await dbConnect();

    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    const subcategories = await Subcategory.find({}).sort({ createdAt: -1 }).lean();
    const topics = await Topic.find({}).sort({ createdAt: -1 }).lean();
    const letters = await Letter.find({}).sort({ createdAt: -1 }).lean();

    const topicMap = {};
    const topicAliasMap = {};

    topics.forEach((topic) => {
      const normalizedTopic = normalizeTopic(topic);
      topicMap[normalizedTopic._id] = normalizedTopic;

      const topicSlug = toSafeLowerCase(topic.slug ?? topic['`slug`']);
      const topicName = toSafeLowerCase(topic.name ?? topic['`name`']);
      const legacyTopicId = normalizeId(topic.id ?? topic['`id`']);

      topicAliasMap[normalizedTopic._id] = normalizedTopic._id;
      if (topicSlug) topicAliasMap[topicSlug] = normalizedTopic._id;
      if (topicName) topicAliasMap[topicName] = normalizedTopic._id;
      if (legacyTopicId && legacyTopicId !== normalizedTopic._id) {
        topicAliasMap[legacyTopicId] = normalizedTopic._id;
      }
    });

    const letterMap = {};
    letters.forEach((letter) => {
      const normalizedLetter = normalizeLetter(letter);
      let topicId = normalizeId(normalizedLetter.topic);
      const lookupKey = toSafeLowerCase(topicId);
      if (!topicMap[topicId] && topicAliasMap[lookupKey]) {
        topicId = topicAliasMap[lookupKey];
      }
      letterMap[topicId] = letterMap[topicId] || [];
      letterMap[topicId].push(normalizedLetter);
    });

    Object.values(topicMap).forEach((topic) => {
      topic.letters = letterMap[topic._id] || [];
    });

    const subcategoryMap = {};
    subcategories.forEach((subcategory) => {
      const normalizedSubcategory = normalizeSubcategory(subcategory);
      subcategoryMap[normalizedSubcategory._id] = normalizedSubcategory;
    });

    Object.values(subcategoryMap).forEach((subcategory) => {
      subcategory.topics = Object.values(topicMap).filter((topic) => topic.subcategory === subcategory._id);
    });

    const categoryMap = {};
    categories.forEach((category) => {
      const normalizedCategory = normalizeCategory(category);
      categoryMap[normalizedCategory._id] = normalizedCategory;
    });

    Object.values(categoryMap).forEach((category) => {
      category.subcategories = Object.values(subcategoryMap).filter((subcategory) => subcategory.category === category._id);
    });

    const normalizedCategories = Object.values(categoryMap);
    return NextResponse.json({ categories: normalizedCategories });
  } catch (error) {
    console.error('Error fetching content tree:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
