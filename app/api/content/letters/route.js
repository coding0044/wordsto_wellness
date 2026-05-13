import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Letter from '../../../lib/models/Letter';
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

    const { title, topic, content } = await request.json();

    if (!title || !topic || !content) {
      return NextResponse.json({ error: 'Letter title, topic, and content are required' }, { status: 400 });
    }

    const letter = new Letter({
      title: title.trim(),
      topic,
      content: content.trim(),
    });

    await letter.save();
    await letter.populate({
      path: 'topic',
      populate: {
        path: 'subcategory',
        populate: {
          path: 'category',
          select: 'name'
        }
      }
    });
    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    console.error('Error creating letter:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Letter title already exists' }, { status: 400 });
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

    const { id, title, content, topic } = await request.json();

    if (!id || !title || !content || !topic) {
      return NextResponse.json({ error: 'Letter ID, title, content, and topic are required' }, { status: 400 });
    }

    const letter = await Letter.findByIdAndUpdate(
      id,
      { title: title.trim(), content, topic },
      { new: true, runValidators: true }
    ).populate({
      path: 'topic',
      populate: {
        path: 'subcategory',
        populate: {
          path: 'category',
          select: 'name'
        }
      }
    });

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ letter });
  } catch (error) {
    console.error('Error updating letter:', error);
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
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    const letter = await Letter.findByIdAndDelete(id);

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Error deleting letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}