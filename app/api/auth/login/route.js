import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email (email is already lowercase in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare password
    console.log(`📝 Attempting password comparison for: ${email}`);
    console.log(`📝 Stored password hash length: ${user.password.length}`);
    
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      console.log(`📝 Entered password length: ${password.length}`);
      console.log(`📝 Is stored password a hash? ${user.password.startsWith('$2')}`);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token and set cookie
    const token = generateToken(user._id.toString(), user.role);
    await setAuthCookie(token);

    console.log(`✅ Login successful: ${email}`);

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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}