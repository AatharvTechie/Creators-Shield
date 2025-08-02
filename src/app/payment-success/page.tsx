"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Crown, Gem, Rocket, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function PaymentSuccessForm() {
  const router = useRouter();
  const [planId, setPlanId] = useState('monthly');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [countdown, setCountdown] = useState(5);
  
  // Get search params in useEffect to avoid SSR issues
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPlanId(urlParams.get('plan') || 'monthly');
    setSubscriptionId(urlParams.get('subscription_id') || '');
  }, []);
  
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard/overview');
    }
  }, [countdown, router]);

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
              Welcome to CreatorShield! Your subscription is now active and your plan has been updated in real-time.
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
              <Badge variant="secondary" className="text-sm bg-green-500/20 text-green-400 border-green-500/30">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Active
                </div>
              </Badge>
              </div>
              
              {subscriptionId && (
                <div className="text-sm text-gray-400">
                  Subscription ID: {subscriptionId}
                </div>
              )}
              
              {/* Real-time Update Notification */}
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Plan Updated in Real-time</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Your plan has been automatically updated in your dashboard and settings.
                </p>
              </div>
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
                onClick={() => router.push('/dashboard/overview')}
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

export default function PaymentSuccessPage() {
  return <PaymentSuccessForm />;
} 