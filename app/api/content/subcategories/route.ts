import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/lib/models/Subcategory';
import Topic from '@/lib/models/Topic';
import Letter from '@/lib/models/Letter';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get pagination and search parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (categoryId) {
      query = {
        ...query,
        $or: [
          { categories: { $in: [categoryId] } },  // New schema: categories array
          { categoryId: categoryId }                // Existing data: single categoryId field
        ]
      };
    }
    
    // Get total count for pagination
    const total = await Subcategory.countDocuments(query);
    
    // Get paginated subcategories
    const subcategories = await Subcategory.find(query)
      .populate('categories', 'name slug createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return paginated response
    return NextResponse.json({
      data: subcategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { name, slug, categories, description } = await request.json();

    if (!name || !categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'Subcategory name and at least one category are required' }, { status: 400 });
    }

    const subcategory = new Subcategory({
      name: name.trim(),
      slug: slug?.trim(),
      categories,
      description: description?.trim(),
    });

    await subcategory.save();
    await subcategory.populate('categories', 'name slug createdAt');
    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Subcategory name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, name, slug, categories, description } = await request.json();

    if (!id || !name || !categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'Subcategory ID, name, and at least one category are required' }, { status: 400 });
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name: name.trim(), slug: slug?.trim(), categories, description: description?.trim() },
      { new: true, runValidators: true }
    ).populate('categories', 'name slug createdAt');

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Subcategory name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    // Delete any nested letters and topics before removing the subcategory
    const topics = await Topic.find({ subcategory: id }).select('_id');
    const topicIds = topics.map((topic) => topic._id);

    if (topicIds.length > 0) {
      await Letter.deleteMany({ topic: { $in: topicIds } });
      await Topic.deleteMany({ subcategory: id });
    }

    const subcategory = await Subcategory.findByIdAndDelete(id);

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}