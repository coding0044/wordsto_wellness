import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    // If already exists
    if (user) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This email already has an account. Please login with your password.',
        },
        { status: 400 }
      );
    }

    // Create new Google user
    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      password: null,
      role: 'user',
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Google auth failed',
      },
      { status: 500 }
    );
  }
}