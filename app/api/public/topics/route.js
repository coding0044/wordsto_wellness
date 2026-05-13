import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Topic from '../../../lib/models/Topic';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId');

    if (subcategoryId) {
      const topics = await Topic.find({ subcategory: subcategoryId })
        .populate({
          path: 'subcategory',
          populate: {
            path: 'category',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 });
      return NextResponse.json({ topics });
    }

    const topics = await Topic.find({})
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
