import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await dbConnect();
    const { resetToken, password } = await req.json();

    // Validate input
    if (!resetToken || !password) {
      return NextResponse.json(
        { message: 'Please provide reset token and new password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if new password is same as old password
    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return NextResponse.json(
        { message: 'New password cannot be the same as old password' },
        { status: 400 }
      );
    }

    // Update password (the pre-save middleware will hash it automatically)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    console.log(`✅ Password reset successful for: ${user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}