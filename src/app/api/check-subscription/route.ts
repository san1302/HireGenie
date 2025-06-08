import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check for active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, polar_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error('Error checking subscription:', subError);
      return NextResponse.json(
        { error: 'Error checking subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasActiveSubscription: !!subscription,
      subscriptionId: subscription?.polar_id || null
    });

  } catch (error) {
    console.error('Unexpected error in check-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 