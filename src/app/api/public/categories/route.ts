import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import Topic from '@/lib/models/Topic';
import Letter from '@/lib/models/Letter';
import { normalizeId } from '@/lib/apiUtils';

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
  const categoriesValue = subcategory.categories ?? subcategory['categories'] ?? subcategory['category_ids'] ?? subcategory['`category_ids`'] ?? subcategory['categoryId'] ?? subcategory['`categoryId`'] ?? [];
  return {
    _id: normalizeId(subcategory._id ?? subcategory.id ?? subcategory['`id`']),
    name: subcategory.name ?? subcategory['`name`'] ?? subcategory['name'] ?? '',
    slug: subcategory.slug ?? subcategory['`slug`'] ?? subcategory['slug'] ?? '',
    description: subcategory.description ?? subcategory['`description`'] ?? subcategory['description'] ?? '',
    categories: Array.isArray(categoriesValue) ? categoriesValue.map(c => normalizeId(c?._id ?? c ?? c?.id ?? c?.['`id`'] ?? '')) : (categoriesValue ? [normalizeId(categoriesValue)] : []),
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

    // REMOVED .sort() - Now returns in natural database order (by _id or insertion order)
    const categories = await Category.find({}).lean();
    const subcategories = await Subcategory.find({}).lean();
    const topics = await Topic.find({}).lean();
    const letters = await Letter.find({}).lean();

    const topicMap = {};
    topics.forEach((topic) => {
      const normalizedTopic = normalizeTopic(topic);
      topicMap[normalizedTopic._id] = normalizedTopic;
    });

    const letterMap = {};
    letters.forEach((letter) => {
      const normalizedLetter = normalizeLetter(letter);
      const topicId = normalizedLetter.topic;
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
    const categoryAliasMap = {};
    categories.forEach((category, idx) => {
      const normalizedCategory = normalizeCategory(category);
      categoryMap[normalizedCategory._id] = normalizedCategory;

      const legacyId = String(category.id ?? category['`id`'] ?? category['category_id'] ?? category['`category_id`'] || '');
      const slug = (category.slug ?? category['`slug`'] || '').toLowerCase();
      const name = (category.name ?? category['`name`'] || '').toLowerCase();

      categoryAliasMap[normalizedCategory._id] = normalizedCategory._id;
      if (legacyId) categoryAliasMap[legacyId] = normalizedCategory._id;
      const positionalId = String(idx + 1);
      if (!categoryAliasMap[positionalId]) categoryAliasMap[positionalId] = normalizedCategory._id;
      if (slug) categoryAliasMap[slug] = normalizedCategory._id;
      if (name) categoryAliasMap[name] = normalizedCategory._id;
    });

    // Reassign certain subcategories to the Relationship Issues category regardless of stored categories.
    // If a Relationship Issues category does not exist in the DB, create a virtual one in the response.
    const relationshipKey = 'relationship issues';
    let relationshipCategoryId = categoryAliasMap[relationshipKey] || categoryAliasMap['relationship-issues'];

    // If missing, create a virtual Relationship Issues category for the response
    const virtualRelationshipId = 'relationship-virtual';
    if (!relationshipCategoryId) {
      const virtualCategory = {
        _id: virtualRelationshipId,
        name: 'Relationship Issues',
        slug: 'relationship-issues',
        description: '',
        createdAt: null,
        subcategories: [],
      };
      categoryMap[virtualRelationshipId] = virtualCategory;
      categoryAliasMap[virtualRelationshipId] = virtualRelationshipId;
      categoryAliasMap['relationship-issues'] = virtualRelationshipId;
      categoryAliasMap[relationshipKey] = virtualRelationshipId;
      relationshipCategoryId = virtualRelationshipId;
    }

    Object.values(categoryMap).forEach((category) => {
      category.subcategories = Object.values(subcategoryMap).filter((subcategory) => {
        // Check if the category ID is in the subcategory's categories array
        if (subcategory.categories.includes(category._id)) return true;
        
        // Also check via alias map for backward compatibility with legacy data
        const aliasMatches = subcategory.categories.map(catId => {
          const aliasMatch = categoryAliasMap[catId] || categoryAliasMap[(catId || '').toLowerCase()];
          return aliasMatch;
        });
        if (aliasMatches.includes(category._id)) return true;
        
        return false;
      });
    });

    const normalizedCategories = Object.values(categoryMap).filter((category) => category._id !== relationshipCategoryId);
    if (relationshipCategoryId && categoryMap[relationshipCategoryId]) {
      normalizedCategories.push(categoryMap[relationshipCategoryId]);
    }
    return NextResponse.json({ categories: normalizedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}