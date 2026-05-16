import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
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

    // ✅ CHECK IF USER ALREADY EXISTS
    let user = await User.findOne({ email: normalizedEmail });

    // 👉 If user already exists → show error (don't auto-login)
    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: 'This email already has an account. Please login with your password.',
        },
        { status: 400 }
      );
    }

    // 👉 If NOT exists → create new user
    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      password: null, // Google users don't need password
      role: 'user',
    });

    // ✅ Login new user
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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Google auth failed',
      },
      { status: 500 }
    );
  }
}