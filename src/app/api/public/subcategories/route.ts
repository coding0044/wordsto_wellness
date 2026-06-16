import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/lib/models/Subcategory';

function normalizeSubcategory(subcategory) {
  const categoriesValue = subcategory.categories ?? subcategory['categories'] ?? subcategory['category_ids'] ?? subcategory['`category_ids`'] ?? subcategory['categoryId'] ?? subcategory['`categoryId`'] ?? [];
  return {
    _id: subcategory._id ?? subcategory.id ?? subcategory['`id`'],
    name: subcategory.name ?? subcategory['`name`'] ?? subcategory['name'] ?? '',
    slug: subcategory.slug ?? subcategory['`slug`'] ?? subcategory['slug'] ?? '',
    description: subcategory.description ?? subcategory['`description`'] ?? subcategory['description'] ?? '',
    categories: Array.isArray(categoriesValue) ? categoriesValue.map(c => c?._id ?? c ?? c?.id ?? c?.['`id`'] ?? '') : (categoriesValue ? [categoriesValue] : []),
    createdAt: subcategory.createdAt ?? subcategory['`created_at`'] ?? subcategory['created_at'] ?? null,
  };
}

export async function GET(request) {
  try {
    await dbConnect();
    
    console.log('API called with categoryId:', categoryId);

    // Query that handles both new schema (categories array) and old/existing data (categoryId field)
    let query = {};
    if (categoryId) {
      query = {
        $or: [
          { categories: { $in: [categoryId] } },  // New schema: categories array
          { categoryId: categoryId }                // Existing data: single categoryId field
        ]
      };
    }
    console.log('Database query:', JSON.stringify(query));
    
    const subcategories = await Subcategory.find(query).sort({ createdAt: -1 }).lean();
    console.log('Found subcategories:', subcategories.length);
    
    const normalizedSubcategories = subcategories.map(normalizeSubcategory);
    return NextResponse.json({ subcategories: normalizedSubcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
