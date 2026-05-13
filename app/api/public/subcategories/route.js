import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Subcategory from '../../../lib/models/Subcategory';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (categoryId) {
      const subcategories = await Subcategory.find({ category: categoryId })
        .populate('category', 'name')
        .sort({ createdAt: -1 });
      return NextResponse.json({ subcategories });
    }

    const subcategories = await Subcategory.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
