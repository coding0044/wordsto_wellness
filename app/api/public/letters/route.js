import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Letter from '../../../lib/models/Letter';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (topicId) {
      const letters = await Letter.find({ topic: topicId })
        .populate({
          path: 'topic',
          populate: {
            path: 'subcategory',
            populate: {
              path: 'category',
              select: 'name'
            }
          }
        })
        .sort({ createdAt: -1 });
      return NextResponse.json({ letters });
    }

    const letters = await Letter.find({})
      .populate({
        path: 'topic',
        populate: {
          path: 'subcategory',
          populate: {
            path: 'category',
            select: 'name'
          }
        }
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ letters });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
