import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, password, role } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'This email already has an account. Please login.',
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'user',
    });

    // Token
    const token = generateToken(user._id.toString(), user.role);

    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}