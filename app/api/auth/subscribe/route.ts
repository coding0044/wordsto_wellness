import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PLANS = {
  Free: {
    planStatus: 'active',
    usesLeft: 3,
    resetFrequency: 'Weekly',
  },
  Premium: {
    planStatus: 'active',
    usesLeft: null,
    resetFrequency: 'Unlimited',
  },
  Expert: {
    planStatus: 'active',
    usesLeft: null,
    resetFrequency: 'Unlimited',
  },
};

export async function POST(req) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || typeof plan !== 'string') {
      return NextResponse.json({ message: 'Plan is required' }, { status: 400 });
    }

    const normalizedPlan = plan.trim().toLowerCase();
    const planName = normalizedPlan === 'pro' ? 'Expert' : normalizedPlan === 'expert' ? 'Expert' : normalizedPlan === 'premium' ? 'Premium' : normalizedPlan === 'free' ? 'Free' : null;

    if (!planName || !PLANS[planName]) {
      return NextResponse.json({ message: 'Invalid plan selected' }, { status: 400 });
    }

    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const planConfig = PLANS[planName];

    // Update all plan fields
    user.planName = planName;
    user.planStatus = planConfig.planStatus;
    user.usesLeft = planConfig.usesLeft;
    user.resetFrequency = planConfig.resetFrequency;
    user.plan = {
      name: planName,
      status: planConfig.planStatus,
      usesLeft: planConfig.usesLeft,
      resetFrequency: planConfig.resetFrequency,
    };
    user.subscription = {
      plan: planName,
      status: planConfig.planStatus,
      usesLeft: planConfig.usesLeft,
      resetFrequency: planConfig.resetFrequency,
    };

    console.log('📝 Before save - user state:', {
      userId: user._id,
      planName: user.planName,
      planStatus: user.planStatus,
      usesLeft: user.usesLeft,
      resetFrequency: user.resetFrequency,
      plan: user.plan,
      subscription: user.subscription,
    });

    try {
      await user.save();
      console.log('✅ User saved successfully!');
    } catch (saveError) {
      console.error('❌ Save error:', saveError.message);
      throw saveError;
    }

    // Verify the save by fetching fresh from DB
    const savedUser = await User.findById(currentUser.userId);
    console.log('✓ Plan saved to database successfully:', {
      userId: savedUser._id,
      planName: savedUser.planName,
      planStatus: savedUser.planStatus,
      usesLeft: savedUser.usesLeft,
      resetFrequency: savedUser.resetFrequency,
      plan: savedUser.plan,
      subscription: savedUser.subscription,
    });

    return NextResponse.json({
      success: true,
      message: `${planName} plan activated successfully.`,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        planName: savedUser.planName,
        planStatus: savedUser.planStatus,
        usesLeft: savedUser.usesLeft,
        resetFrequency: savedUser.resetFrequency,
        plan: savedUser.plan,
        subscription: savedUser.subscription,
      },
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
