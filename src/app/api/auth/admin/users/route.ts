import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const users = await User.find({}).select('-password');
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    return NextResponse.json(
      { message: 'User created successfully', user: { ...user.toObject(), password: undefined } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const { name, email, password, role } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData = { name, email, role };
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User updated successfully', user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
