"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Crown, Gem, Rocket, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const planId = searchParams?.get('plan') || 'monthly';
  const subscriptionId = searchParams?.get('subscription_id') || '';
  
  const planDetails = {
    free: { name: 'Free Trial', icon: Crown, color: 'text-purple-400', duration: '7 Days' },
    monthly: { name: 'Monthly Plan', icon: Gem, color: 'text-blue-400', duration: '1 Month' },
    yearly: { name: 'Yearly Plan', icon: Rocket, color: 'text-green-400', duration: '1 Year' }
  };
  
  const currentPlan = planDetails[planId as keyof typeof planDetails] || planDetails.monthly;
  const PlanIcon = currentPlan.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="bg-white/10 backdrop-blur-lg border-gray-600/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Welcome to CreatorShield! Your subscription is now active.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Subscription Details */}
            <div className="bg-white/5 rounded-lg p-6 border border-gray-600/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <PlanIcon className={`w-8 h-8 ${currentPlan.color} mr-3`} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentPlan.name}</h3>
                    <p className="text-gray-400">Duration: {currentPlan.duration}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  Active
                </Badge>
              </div>
              
              {subscriptionId && (
                <div className="text-sm text-gray-400">
                  Subscription ID: {subscriptionId}
                </div>
              )}
            </div>

            {/* Features Included */}
            <div className="bg-white/5 rounded-lg p-6 border border-gray-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">What's Included:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited YouTube Channels
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited Video Monitoring
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Advanced Analytics
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Real-time Alerts
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  DMCA Protection
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Priority Support
                </div>
              </div>
            </div>

            {/* Promise Message */}
            <div className="bg-blue-500/20 rounded-lg p-6 border border-blue-500/30">
              <h4 className="text-lg font-semibold text-white mb-2">
                🚀 We Promise to Deliver Excellence
              </h4>
              <p className="text-gray-300">
                Thank you for choosing CreatorShield! We're committed to providing you with the best content protection experience. Our team is dedicated to ensuring your content remains safe and secure.
              </p>
            </div>

            {/* Redirect Countdown */}
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-300 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                Redirecting to dashboard in {countdown} seconds...
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                Go to Dashboard Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 