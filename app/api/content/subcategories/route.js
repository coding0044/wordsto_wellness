import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Subcategory from '../../../lib/models/Subcategory';
import Topic from '../../../lib/models/Topic';
import { verifyToken } from '../../../lib/auth';

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

    const subcategories = await Subcategory.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ subcategories });
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

    const { name, category, description } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ error: 'Subcategory name and category are required' }, { status: 400 });
    }

    const subcategory = new Subcategory({
      name: name.trim(),
      category,
      description: description?.trim(),
    });

    await subcategory.save();
    await subcategory.populate('category', 'name');
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

    const { id, name, category, description } = await request.json();

    if (!id || !name || !category) {
      return NextResponse.json({ error: 'Subcategory ID, name, and category are required' }, { status: 400 });
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name: name.trim(), category, description: description?.trim() },
      { new: true, runValidators: true }
    ).populate('category', 'name');

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

    // Check if subcategory has topics
    const topicsCount = await Topic.countDocuments({ subcategory: id });
    if (topicsCount > 0) {
      return NextResponse.json({ error: 'Cannot delete subcategory with existing topics' }, { status: 400 });
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