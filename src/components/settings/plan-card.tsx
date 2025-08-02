'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaCrown, FaGem, FaRocket, FaCheck, FaCalendar, FaClock, FaShieldAlt, FaCreditCard, FaArrowUp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface PlanCardProps {
  userPlan: string;
  planExpiry?: string;
  userEmail?: string;
}

const PLAN_DETAILS = {
  free: {
    name: "Free Trial",
    price: 0,
    desc: "7 days access to all features",
    icon: <FaCrown className="text-3xl text-purple-500" />,
    color: "purple",
    duration: "7 Days",
    features: [
      "Unlimited YouTube Channels",
      "Unlimited video monitoring",
      "Unlimited violation detection",
      "Unlimited DMCA requests"
    ],
    highlight: "Perfect for testing all features"
  },
  monthly: {
    name: "Monthly",
    price: 70,
    desc: "$70 per month",
    icon: <FaGem className="text-3xl text-blue-500" />,
    color: "blue",
    duration: "1 Month",
    features: [
      "Unlimited YouTube Channels",
      "Unlimited video monitoring",
      "Unlimited violation detection",
      "Unlimited DMCA requests",
      "Advanced analytics & reports",
      "Multi-platform monitoring"
    ],
    highlight: "Most popular choice"
  },
  yearly: {
    name: "Yearly",
    price: 500,
    desc: "$500 per year",
    icon: <FaRocket className="text-3xl text-green-500" />,
    color: "green",
    duration: "1 Year",
    features: [
      "Unlimited YouTube Channels",
      "Unlimited video monitoring",
      "Unlimited violation detection",
      "Unlimited DMCA requests",
      "Advanced analytics & reports",
      "Multi-platform monitoring",
      "Dedicated account manager"
    ],
    highlight: "Best value for long-term"
  }
};

export function PlanCard({ userPlan, planExpiry, userEmail }: PlanCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const currentPlan = PLAN_DETAILS[userPlan as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.free;

  useEffect(() => {
    if (planExpiry) {
      const updateTimeUntilExpiry = () => {
        const now = new Date();
        const expiry = new Date(planExpiry);
        const diff = expiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeUntilExpiry('Expired');
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          if (days > 0) {
            setTimeUntilExpiry(`${days} day${days > 1 ? 's' : ''} remaining`);
          } else {
            setTimeUntilExpiry(`${hours} hour${hours > 1 ? 's' : ''} remaining`);
          }
        }
      };

      updateTimeUntilExpiry();
      const interval = setInterval(updateTimeUntilExpiry, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [planExpiry]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Redirect to plans page with upgrade context
      router.push('/plans?upgrade=true');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redirect to upgrade page. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getPlanStatusColor = () => {
    if (userPlan === 'free') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (userPlan === 'monthly') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (userPlan === 'yearly') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getPlanStatusText = () => {
    if (userPlan === 'free') return 'Free Trial';
    if (userPlan === 'monthly') return 'Monthly Plan';
    if (userPlan === 'yearly') return 'Yearly Plan';
    return 'Unknown Plan';
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentPlan.icon}
            <div>
              <CardTitle className="text-lg font-bold">{currentPlan.name}</CardTitle>
              <CardDescription className="text-sm">{currentPlan.desc}</CardDescription>
            </div>
          </div>
          <Badge className={`${getPlanStatusColor()} border`}>
            {getPlanStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FaCalendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-xs text-muted-foreground">{currentPlan.duration}</p>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FaClock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {planExpiry ? timeUntilExpiry : 'Active'}
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium mb-2">Plan Features</h4>
          <div className="space-y-1">
            {currentPlan.features.slice(0, showAllFeatures ? currentPlan.features.length : 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <FaCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
            {currentPlan.features.length > 4 && (
              <button
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
              >
                {showAllFeatures ? 'Show Less' : `Show ${currentPlan.features.length - 4} More Features`}
              </button>
            )}
          </div>
        </div>

        {/* Upgrade Section */}
        {userPlan === 'free' && (
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FaArrowUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">Upgrade to Premium</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get unlimited access to all features and priority support
            </p>
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full text-xs h-8"
            >
              {isUpgrading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Upgrading...
                </>
              ) : (
                <>
                  <FaCreditCard className="w-3 h-3 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Plan Expiry Warning */}
        {planExpiry && new Date(planExpiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs font-medium text-yellow-600">Plan Expiring Soon</p>
                <p className="text-xs text-muted-foreground">{timeUntilExpiry}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FaShieldAlt className="w-3 h-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FaCreditCard className="w-3 h-3" />
            <span>Protected</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FaCheck className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 