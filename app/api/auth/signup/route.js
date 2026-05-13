import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password, role } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password, 
      role 
    });

    console.log(`📝 User created successfully`);
    console.log(`📝 Password hash starts with: ${user.password.substring(0, 10)}`);
    console.log(`📝 Password hash length: ${user.password.length}`);

    // Generate token and set cookie
    const token = generateToken(user._id.toString(), user.role);
    await setAuthCookie(token);

    console.log(`✅ Signup successful: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}