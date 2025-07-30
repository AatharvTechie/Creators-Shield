'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Gem, Rocket, Check } from 'lucide-react';
import Link from 'next/link';

interface PlanUpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userPlan?: string;
}

export function PlanUpgradePopup({ isOpen, onClose, userPlan = 'free' }: PlanUpgradePopupProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if popup should be shown (every 30 minutes)
    const lastShown = localStorage.getItem('plan_popup_last_shown');
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (!lastShown || (now - parseInt(lastShown)) > thirtyMinutes) {
      setShowPopup(true);
      localStorage.setItem('plan_popup_last_shown', now.toString());
    }
  }, []);

  if (!showPopup) return null;

  const handleClose = () => {
    setShowPopup(false);
    onClose();
  };

  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      duration: "7 Days",
      features: ["All Features", "24-48h Support", "Perfect for testing"],
      icon: <Crown className="w-6 h-6 text-purple-400" />,
      color: "purple"
    },
    {
      name: "Monthly",
      price: "$70",
      duration: "1 Month", 
      features: ["All Features", "7h Support", "Most popular choice"],
      icon: <Gem className="w-6 h-6 text-blue-400" />,
      color: "blue"
    },
    {
      name: "Yearly",
      price: "$500",
      duration: "1 Year",
      features: ["All Features", "7h Support", "Best value for long-term"],
      icon: <Rocket className="w-6 h-6 text-green-400" />,
      color: "green"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Upgrade Your CreatorShield Experience
            </h2>
            <p className="text-gray-300">
              Choose the perfect plan for your content protection needs
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
                plan.name === "Monthly" 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-gray-600 bg-gray-800 hover:border-gray-500"
              }`}
            >
              {/* Popular Badge */}
              {plan.name === "Monthly" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                {plan.icon}
                <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-blue-400 mt-2">{plan.price}</div>
                <div className="text-gray-400 text-sm">{plan.duration}</div>
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href={`/payment?plan=${plan.name.toLowerCase().replace(' ', '')}`}
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.name === "Monthly"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                }`}
              >
                {plan.name === "Free Trial" ? "Start Free Trial" : "Choose Plan"}
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            All plans include complete access to all features. Choose the duration that works best for you.
          </p>
          <Link
            href="/plans"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200"
          >
            View All Plans
          </Link>
        </div>
      </div>
    </div>
  );
} 