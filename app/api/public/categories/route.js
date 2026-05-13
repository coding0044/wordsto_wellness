import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Category from '../../../lib/models/Category';

export async function GET(request) {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
