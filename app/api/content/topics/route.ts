import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
    const subcategoryId = searchParams.get('subcategoryId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (subcategoryId) {
      query.subcategory = subcategoryId;
    }
    
    // Get total count for pagination
    const total = await Topic.countDocuments(query);
    
    // Get paginated topics with populated fields
    const topics = await Topic.find(query)
      .populate({
        path: 'subcategory',
        select: 'name slug description createdAt category',
        populate: {
          path: 'category',
          select: 'name slug createdAt'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return paginated response
    return NextResponse.json({
      data: topics,
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
    console.error('Error fetching topics:', error);
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

    const { name, slug, subcategory, description } = await request.json();

    if (!name || !subcategory) {
      return NextResponse.json({ error: 'Topic name and subcategory are required' }, { status: 400 });
    }

    const topic = new Topic({
      name: name.trim(),
      slug: slug?.trim(),
      subcategory,
      description: description?.trim(),
    });

    await topic.save();
    await topic.populate({
      path: 'subcategory',
      select: 'name slug description createdAt category',
      populate: {
        path: 'category',
        select: 'name slug createdAt'
      }
    });
    
    return NextResponse.json({ 
      data: topic,
      message: 'Topic created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Topic name already exists' }, { status: 400 });
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

    const { id, name, slug, subcategory, description } = await request.json();

    if (!id || !name || !subcategory) {
      return NextResponse.json({ error: 'Topic ID, name, and subcategory are required' }, { status: 400 });
    }

    const topic = await Topic.findByIdAndUpdate(
      id,
      { name: name.trim(), slug: slug?.trim(), subcategory, description: description?.trim() },
      { new: true, runValidators: true }
    ).populate({
      path: 'subcategory',
      select: 'name slug description createdAt category',
      populate: {
        path: 'category',
        select: 'name slug createdAt'
      }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      data: topic,
      message: 'Topic updated successfully' 
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Topic name already exists in this subcategory' }, { status: 400 });
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
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Check if topic has letters
    const lettersCount = await Letter.countDocuments({ topic: id });
    if (lettersCount > 0) {
      return NextResponse.json({ error: 'Cannot delete topic with existing letters' }, { status: 400 });
    }

    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}