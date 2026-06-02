import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findById(currentUser.userId).select('-password');
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    // Fetch all users
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
