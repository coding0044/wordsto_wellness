import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import Topic from '@/lib/models/Topic';
import Letter from '@/lib/models/Letter';
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
    const letters = await Letter.find({}).lean();

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
    const subcategoryAliasMap = {};
    subcategories.forEach((subcategory, idx) => {
      const normalizedSubcategory = normalizeSubcategory(subcategory);
      subcategoryMap[normalizedSubcategory._id] = normalizedSubcategory;

      const legacyId = toSafeString(subcategory.id ?? subcategory['`id`'] ?? subcategory['subcategory_id'] ?? subcategory['`subcategory_id`']);
      const slug = toSafeLowerCase(subcategory.slug ?? subcategory['`slug`']);
      const name = toSafeLowerCase(subcategory.name ?? subcategory['`name`']);

      subcategoryAliasMap[normalizedSubcategory._id] = normalizedSubcategory._id;
      if (legacyId) subcategoryAliasMap[legacyId] = normalizedSubcategory._id;
      const positionalId = String(idx + 1);
      if (!subcategoryAliasMap[positionalId]) subcategoryAliasMap[positionalId] = normalizedSubcategory._id;
      if (slug) subcategoryAliasMap[slug] = normalizedSubcategory._id;
      if (name) subcategoryAliasMap[name] = normalizedSubcategory._id;
    });

    Object.values(subcategoryMap).forEach((subcategory) => {
      subcategory.topics = Object.values(topicMap).filter((topic) => {
        if (topic.subcategory === subcategory._id) return true;
        const aliasMatch = subcategoryAliasMap[topic.subcategory] || subcategoryAliasMap[toSafeLowerCase(topic.subcategory)];
        return aliasMatch === subcategory._id;
      });
    });

    const categoryMap = {};
    const categoryAliasMap = {}; // map legacy ids/slugs/names -> normalized id
    categories.forEach((category, idx) => {
      const normalizedCategory = normalizeCategory(category);
      categoryMap[normalizedCategory._id] = normalizedCategory;

      const legacyId = toSafeString(category.id ?? category['`id`'] ?? category['category_id'] ?? category['`category_id`']);
      const slug = toSafeLowerCase(category.slug ?? category['`slug`']);
      const name = toSafeLowerCase(category.name ?? category['`name`']);

      categoryAliasMap[normalizedCategory._id] = normalizedCategory._id;
      if (legacyId) categoryAliasMap[legacyId] = normalizedCategory._id;
      // map by position in case legacy numeric ids were lost during import
      const positionalId = String(idx + 1);
      if (!categoryAliasMap[positionalId]) categoryAliasMap[positionalId] = normalizedCategory._id;
      if (slug) categoryAliasMap[slug] = normalizedCategory._id;
      if (name) categoryAliasMap[name] = normalizedCategory._id;
    });

    Object.values(categoryMap).forEach((category) => {
      category.subcategories = Object.values(subcategoryMap).filter((subcategory) => {
        // direct match
        if (subcategory.category === category._id) return true;
        // match via alias map (legacy numeric id, slug, or name)
        const aliasMatch = categoryAliasMap[subcategory.category] || categoryAliasMap[toSafeLowerCase(subcategory.category)];
        return aliasMatch === category._id;
      });
    });

    const normalizedCategories = Object.values(categoryMap);
    return NextResponse.json({ categories: normalizedCategories });
  } catch (error) {
    console.error('Error fetching content tree:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
