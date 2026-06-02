import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await User.findById(currentUser.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✓ Current user fetched:', {
      userId: user._id,
      planName: user.planName,
      planStatus: user.planStatus,
      usesLeft: user.usesLeft,
      resetFrequency: user.resetFrequency,
      plan: user.plan,
      subscription: user.subscription,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}