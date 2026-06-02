import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '../../../lib/models/Subcategory';
import Topic from '../../../lib/models/Topic';
import Letter from '../../../lib/models/Letter';
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
      query.category = categoryId;
    }
    
    // Get total count for pagination
    const total = await Subcategory.countDocuments(query);
    
    // Get paginated subcategories
    const subcategories = await Subcategory.find(query)
      .populate('category', 'name slug createdAt')
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

    const { name, slug, category, description } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ error: 'Subcategory name and category are required' }, { status: 400 });
    }

    const subcategory = new Subcategory({
      name: name.trim(),
      slug: slug?.trim(),
      category,
      description: description?.trim(),
    });

    await subcategory.save();
    await subcategory.populate('category', 'name slug createdAt');
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

    const { id, name, slug, category, description } = await request.json();

    if (!id || !name || !category) {
      return NextResponse.json({ error: 'Subcategory ID, name, and category are required' }, { status: 400 });
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name: name.trim(), slug: slug?.trim(), category, description: description?.trim() },
      { new: true, runValidators: true }
    ).populate('category', 'name slug createdAt');

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Subcategory name already exists in this category' }, { status: 400 });
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
