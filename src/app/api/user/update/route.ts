import dbConnect from '@/lib/db';
import User from '../../../lib/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await dbConnect();
    
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, dateOfBirth } = await req.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: currentUser.userId }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email is already taken' }, { status: 400 });
    }

    // Update user details
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        image: user.image
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
