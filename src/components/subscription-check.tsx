import { redirect } from 'next/navigation';
import { checkUserSubscription } from '@/app/actions';
import { createClient } from '../../supabase/server';
import React from 'react';

interface SubscriptionCheckProps {
    children: React.ReactNode;
    redirectTo?: string;
}

async function checkUserUsage(userId: string) {
    const supabase = await createClient();
    
    // Get current month's start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    try {
        const { data: letters, error } = await supabase
            .from('cover_letters')
            .select('id, created_at')
            .eq('user_id', userId)
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());
            
        if (error) {
            console.error('Error checking user usage:', error);
            return { usageCount: 0, hasReachedLimit: false };
        }
        
        const usageCount = letters?.length || 0;
        const hasReachedLimit = usageCount >= 2; // Free plan limit is 2 letters per month
        
        return { usageCount, hasReachedLimit };
    } catch (error) {
        console.error('Error in checkUserUsage:', error);
        return { usageCount: 0, hasReachedLimit: false };
    }
}

export async function SubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: SubscriptionCheckProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }

    const subscriptionResult = await checkUserSubscription(user?.id!);

    // If user has an active subscription, allow full access
    if (subscriptionResult.success && subscriptionResult.hasActiveSubscription) {
        if (subscriptionResult.planDetails) {
            console.log('User Plan:', subscriptionResult.planDetails.planName);
            console.log('Plan Details:', subscriptionResult.planDetails);
        }
        return <>{children}</>;
    }

    // For free users, always allow dashboard access
    // Components will handle the locked state based on usage
    const usageResult = await checkUserUsage(user.id);
    console.log(`Free user usage: ${usageResult.usageCount}/2 letters this month`);
    
    // Clone children and inject usage information
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                userUsage: usageResult,
                hasActiveSubscription: false
            });
        }
        return child;
    });

    return <>{childrenWithProps}</>;
}
