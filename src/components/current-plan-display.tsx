import React from 'react';
import { checkUserSubscription } from '@/app/actions';
import { createClient } from '../../supabase/server';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export async function CurrentPlanDisplay() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const subscriptionResult = await checkUserSubscription(user.id);

    if (!subscriptionResult.success || !subscriptionResult.hasActiveSubscription) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>No Active Plan</CardTitle>
                    <CardDescription>You don't have an active subscription</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const { subscription, planDetails } = subscriptionResult;

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Current Plan
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                    </Badge>
                </CardTitle>
                <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {planDetails ? (
                    <>
                        <div>
                            <p className="font-semibold text-lg">{planDetails.planName}</p>
                            {planDetails.planDescription && (
                                <p className="text-sm text-muted-foreground">{planDetails.planDescription}</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-medium">
                                ${(planDetails.priceAmount || subscription?.amount || 0) / 100} 
                                {planDetails.priceCurrency || subscription?.currency || 'USD'} 
                                / {planDetails.interval || subscription?.interval || 'month'}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="font-semibold text-lg">Active Subscription</p>
                            <p className="text-sm text-muted-foreground">Plan details unavailable</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="font-medium">
                                ${(subscription?.amount || 0) / 100} {subscription?.currency || 'USD'} / {subscription?.interval || 'month'}
                            </span>
                        </div>
                    </>
                )}
                
                {subscription && (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline">{subscription.status}</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Billing:</span>
                            <span>{subscription.interval || 'monthly'}</span>
                        </div>
                        {subscription.current_period_end && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Next billing:</span>
                                <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
} 