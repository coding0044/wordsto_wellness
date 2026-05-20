import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Subcategory from '../../../lib/models/Subcategory';

function normalizeSubcategory(subcategory) {
  const categoryValue = subcategory.category ?? subcategory['category'] ?? subcategory['category_id'] ?? subcategory['`category_id`'];
  return {
    _id: subcategory._id ?? subcategory.id ?? subcategory['`id`'],
    name: subcategory.name ?? subcategory['`name`'] ?? subcategory['name'] ?? '',
    slug: subcategory.slug ?? subcategory['`slug`'] ?? subcategory['slug'] ?? '',
    description: subcategory.description ?? subcategory['`description`'] ?? subcategory['description'] ?? '',
    category: categoryValue?._id ?? categoryValue ?? categoryValue?.id ?? categoryValue?.['`id`'] ?? '',
    createdAt: subcategory.createdAt ?? subcategory['`created_at`'] ?? subcategory['created_at'] ?? null,
  };
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    console.log('API called with categoryId:', categoryId);

    // Log all subcategories and their category IDs for debugging
    const allSubcategories = await Subcategory.find({}).sort({ createdAt: -1 }).lean();
    console.log('All subcategories in database:', allSubcategories.map(sub => ({
      name: sub.name,
      category: sub.category,
      categoryType: typeof sub.category
    })));

    const query = categoryId ? { category: categoryId } : {};
    console.log('Database query:', query);
    
    const subcategories = await Subcategory.find(query).sort({ createdAt: -1 }).lean();
    console.log('Found subcategories:', subcategories.length);
    
    const normalizedSubcategories = subcategories.map(normalizeSubcategory);
    return NextResponse.json({ subcategories: normalizedSubcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
