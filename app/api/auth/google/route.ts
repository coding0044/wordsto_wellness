import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, image, provider } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User already exists - DO NOT create duplicate account
      // Update provider and image to ensure Google account is linked
      user.provider = provider;
      user.image = image || user.image;
      await user.save();
      console.log(`✅ Existing user logged in with Google: ${email}`);
    } else {
      // Create new user with Google
      user = await User.create({
        name,
        email: email.toLowerCase(),
        image,
        provider,
        role: 'user',
        // No password for OAuth users
      });
      console.log(`✅ New user created with Google: ${email}`);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
