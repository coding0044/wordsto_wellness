import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Please provide email and OTP' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists and not expired
    if (!user.otp || !user.otpExpire) {
      return NextResponse.json(
        { message: 'No OTP request found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.otpExpire < Date.now()) {
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Generate reset token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpire = undefined;
    
    await user.save();

    console.log(`✅ OTP verified for: ${user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}