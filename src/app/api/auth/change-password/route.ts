import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await dbConnect();
    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user from token (you'll need to implement auth middleware)
    // For now, we'll get the user ID from the request header
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (Google users might not)
    if (!user.password) {
      return NextResponse.json(
        { message: 'This account uses Google authentication. Password cannot be changed.' },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is same as old password
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { message: 'New password cannot be the same as current password' },
        { status: 400 }
      );
    }

    // Update password (pre-save middleware will hash it)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed successfully for: ${user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
