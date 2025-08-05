"use client";
import { useState, useEffect } from "react";
import { FaCrown, FaGem, FaRocket, FaCheck, FaTimes, FaExclamationTriangle, FaCalendarAlt, FaClock, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LoadingDialog } from "@/components/ui/loading-dialog";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { ErrorDialog } from "@/components/ui/error-dialog";

const PLANS = [
	{
		id: "free",
		name: "Free Trial",
		price: 0,
		period: "7 days",
		disabled: false,
		duration: "7 Days",
		responseTime: "24-48h",
		features: [
			"Unlimited YouTube Channels",
			"Unlimited video monitoring",
			"Unlimited violation detection",
			"Unlimited DMCA requests",
			"Advanced analytics & reports",
			"Multi-platform monitoring",
			"Real-time alerts",
			"Email templates",
			"Violation history",
			"Custom branding",
			"API access",
			"Legal consultation",
			"Bulk operations",
			"Predictive analytics",
			"Priority queue processing",
			"Custom integrations",
			"Team management",
			"Advanced AI protection"
		],
		highlight: "Perfect for testing all features"
	},
	{
		id: "monthly",
		name: "Monthly",
		price: 70,
		period: "per month",
		disabled: false,
		duration: "1 Month",
		responseTime: "7h",
		features: [
			"Unlimited YouTube Channels",
			"Unlimited video monitoring",
			"Unlimited violation detection",
			"Unlimited DMCA requests",
			"Advanced analytics & reports",
			"Multi-platform monitoring",
			"Real-time alerts",
			"Email templates",
			"Violation history",
			"Custom branding",
			"API access",
			"Legal consultation",
			"Bulk operations",
			"Predictive analytics",
			"Priority queue processing",
			"Custom integrations",
			"Team management",
			"Advanced AI protection"
		],
		highlight: "Most popular choice"
	},
	{
		id: "yearly",
		name: "Yearly",
		price: 500,
		period: "per year",
		disabled: false,
		duration: "1 Year",
		responseTime: "7h",
		features: [
			"Unlimited YouTube Channels",
			"Unlimited video monitoring",
			"Unlimited violation detection",
			"Unlimited DMCA requests",
			"Advanced analytics & reports",
			"Multi-platform monitoring",
			"Real-time alerts",
			"Email templates",
			"Violation history",
			"Custom branding",
			"API access",
			"Legal consultation",
			"Bulk operations",
			"Predictive analytics",
			"Priority queue processing",
			"Custom integrations",
			"Team management",
			"Advanced AI protection",
			"Dedicated account manager"
		],
		highlight: "Best value for long-term"
	}
];

export default function PlansPage() {
	const [selectedPlan, setSelectedPlan] = useState("monthly");
	const [expandedFeatures, setExpandedFeatures] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Dialog states
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		// Get plan from URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const plan = urlParams.get('plan');
		if (plan && PLANS.find(p => p.id === plan)) {
			setSelectedPlan(plan);
		}
	}, []);

  useEffect(() => {
    async function fetchUser() {
			try {
        const token = localStorage.getItem("creator_jwt");
				if (!token) {
					setError("Please log in to proceed with payment");
        return;
      }

				const userEmail = localStorage.getItem('user_email');
				
				if (!userEmail) {
					setError("User email not found");
					return;
				}

				const res = await fetch(`/api/get-user?email=${encodeURIComponent(userEmail)}`, {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				});
				const data = await res.json();
				console.log("get-user success data:", data);

				if (data._id) {
					// API returns user data directly
					setUser(data);
					console.log("User set successfully:", data.email);
				} else {
					console.error("get-user returned no user data:", data);
					setError("Please log in to proceed with payment");
				}
			} catch (error: any) {
				console.error("Error fetching user:", error);
				setError("Please log in to proceed with payment");
			}
		}

    // Add a small delay to ensure localStorage is updated after registration
    // Also retry a few times in case user just registered
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptFetchUser = () => {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (token && userEmail) {
    fetchUser();
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptFetchUser, 1000);
      } else {
        setError("Please log in to proceed with payment");
      }
    };

    const timer = setTimeout(attemptFetchUser, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check if user already has the selected plan
  const checkExistingPlan = (planId: string) => {
    if (!user) return false;
    
    const userPlan = user.plan;
    
    // If user has yearly plan, they can't upgrade further
    if (userPlan === "yearly") {
      return "yearly";
    }
    
    // If user has monthly plan, they can only upgrade to yearly
    if (userPlan === "monthly") {
      if (planId === "monthly") return "monthly";
      if (planId === "free") return "monthly"; // Can't downgrade to free
    }
    
    // If user has free plan, they can upgrade to monthly or yearly
    if (userPlan === "free") {
      if (planId === "free") return "free";
    }
    
    // If user has used free trial before (check freeTrialUsed field)
    if (user.freeTrialUsed && planId === "free") {
      return "free_used";
    }
    
    // If user currently has free plan and tries to activate free again
    if (userPlan === "free" && planId === "free") {
      return "free_active";
    }
    
    return false;
  };

  // Get appropriate message for existing plan
  const getExistingPlanMessage = (existingPlan: string) => {
    switch (existingPlan) {
      case "yearly":
        return "You already have the yearly plan activated. This is our highest tier plan.";
      case "monthly":
        return "You already have the monthly plan activated. Consider upgrading to yearly for better value.";
      case "free":
        return "You already have the free trial activated.";
      case "free_active":
        return "You already have the free trial activated. Please choose a paid plan to continue.";
      case "free_used":
        return "You have already used your free trial. Please choose a paid plan to continue.";
      default:
        return "This plan is already activated for your account.";
    }
  };

  // Get upgrade suggestion
  const getUpgradeSuggestion = (currentPlan: string) => {
    switch (currentPlan) {
      case "free":
        return "Try our monthly or yearly plans for full access.";
      case "monthly":
        return "Try our yearly plan for better value and savings.";
      case "yearly":
        return "You already have our highest tier plan.";
      case "free_active":
        return "Try our monthly or yearly plans for full access.";
      case "free_used":
        return "Try our monthly or yearly plans for full access.";
      default:
        return "Choose a plan that suits your needs.";
    }
  };

	const handlePayment = async () => {
		if (!user) {
			setError("Please log in to proceed with payment");
          return;
        }

    // Check if user already has this plan
    const existingPlan = checkExistingPlan(selectedPlan);
    if (existingPlan) {
      const message = getExistingPlanMessage(existingPlan);
      const suggestion = getUpgradeSuggestion(existingPlan);
      setErrorMessage(`${message} ${suggestion}`);
      setShowErrorDialog(true);
      return;
    }

		setLoading(true);
    setError("");

    // Show loading dialog
    setLoadingMessage(selectedPlan === "free" ? "Starting your free trial..." : "Processing your payment...");
    setShowLoadingDialog(true);

    try {
			const token = localStorage.getItem("creator_jwt");
			console.log('Creating subscription for plan:', selectedPlan, 'user:', user._id);

			const response = await fetch('/api/create-subscription', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					planId: selectedPlan,
					userId: user._id,
				}),
			});

			const data = await response.json();
			console.log('Subscription response:', data);

			if (data.success || data.subscriptionId) {
				// Hide loading dialog
				setShowLoadingDialog(false);

        // For free plan, show success dialog directly
        if (selectedPlan === "free") {
          const successMsg = "Your free trial has been activated successfully!";
          setSuccessMessage(successMsg);
          setShowSuccessDialog(true);

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            window.location.href = "/dashboard/overview";
          }, 3000);
        } else {
          // For paid plans (monthly/yearly), open Razorpay payment window
          if (typeof window !== 'undefined' && (window as any).Razorpay) {
            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
              subscription_id: data.subscriptionId,
              name: 'CreatorShield',
              description: `${selectedPlan} Plan`,
              handler: function (response: any) {
                console.log('Payment successful:', response);
                // Show success dialog after payment
                const successMsg = "Your payment has been processed successfully!";
                setSuccessMessage(successMsg);
                setShowSuccessDialog(true);

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                  window.location.href = "/dashboard/overview";
                }, 3000);
              },
              prefill: {
                name: user.name,
                email: user.email,
              },
              theme: {
                color: '#3B82F6',
              },
            };

            console.log('Opening Razorpay with options:', options);
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          } else {
            console.error('Razorpay not loaded');
            setErrorMessage('Payment gateway not loaded. Please refresh the page and try again.');
            setShowErrorDialog(true);
          }
        }

			} else {
				// Hide loading dialog
				setShowLoadingDialog(false);
				setErrorMessage(data.error || 'Failed to create subscription');
				setShowErrorDialog(true);
			}
		} catch (error: any) {
			// Hide loading dialog
			setShowLoadingDialog(false);
			setErrorMessage(`Payment failed: ${error.message}`);
			setShowErrorDialog(true);
		} finally {
      setLoading(false);
    }
  };

	const handleLogin = () => {
		window.location.href = "/auth/login";
	};

	const toggleFeatures = (planId: string) => {
		setExpandedFeatures(prev => ({
			...prev,
			[planId]: !prev[planId]
		}));
	};

	const selectedPlanData = PLANS.find(plan => plan.id === selectedPlan);

	return (
		<div className="min-h-screen bg-slate-900 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						Choose Your <span className="text-white">Plan</span>
					</h1>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						All plans include complete access to all features. Choose the duration that works best for you.
					</p>
				</div>

				{/* Plans Selection */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{PLANS.map((plan) => (
						<div
							key={plan.id}
							className={`plan-card relative rounded-2xl p-6 transition-all duration-500 ease-in-out transform ${
								selectedPlan === plan.id
									? "bg-gray-800 border-2 border-gray-400 shadow-lg scale-105"
									: "bg-gray-800 border border-gray-600"
							}`}
							onClick={() => setSelectedPlan(plan.id)}
						>
							{/* Popular Badge */}
							{plan.id === "monthly" && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse-slow">
										Most Popular
									</span>
								</div>
							)}

							{/* Plan Header */}
							<div className="text-center mb-6">
								<div className="flex justify-center mb-4">
									{plan.id === "free" && <FaCrown className="text-4xl text-purple-400" />}
									{plan.id === "monthly" && <FaGem className="text-4xl text-blue-400" />}
									{plan.id === "yearly" && <FaRocket className="text-4xl text-green-400" />}
								</div>
								<h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
								<div className="mb-3">
									<span className="text-3xl font-bold text-white">
										${plan.price}
									</span>
									{plan.price === 0 ? (
										<span className="text-gray-300 ml-2">Free</span>
									) : (
										<span className="text-gray-300 ml-2">
											{plan.id === "yearly" ? "/year" : "/month"}
										</span>
									)}
								</div>
								
								{/* Duration & Response Time */}
								<div className="flex justify-center space-x-4 mb-3">
									<div className="flex items-center text-sm text-gray-300">
										<FaCalendarAlt className="mr-1 text-gray-400" />
										{plan.duration}
									</div>
									<div className="flex items-center text-sm text-gray-300">
										<FaClock className="mr-1 text-gray-400" />
										{plan.responseTime}
									</div>
								</div>

								{/* Highlight */}
								<div className="bg-gray-700 rounded-lg p-2">
									<p className="text-white text-sm font-medium">{plan.highlight}</p>
								</div>
							</div>

							{/* Features List */}
							<div className="space-y-2 mb-6">
								{plan.features.slice(0, 5).map((feature, index) => (
									<div key={index} className="flex items-center animate-fadeIn">
										<FaCheck className="text-green-400 mr-2 flex-shrink-0" />
										<span className="text-gray-200 text-sm">{feature}</span>
									</div>
								))}
								
								{/* Expandable Features */}
								{plan.features.length > 5 && (
									<div className="space-y-2">
										<div className={`feature-expand ${expandedFeatures[plan.id] ? 'expanded' : 'collapsed'}`}>
											{expandedFeatures[plan.id] && (
												<div className="space-y-2 animate-slideDown">
													{plan.features.slice(5).map((feature, index) => (
														<div key={index + 5} className="flex items-center animate-fadeIn">
															<FaCheck className="text-green-400 mr-2 flex-shrink-0" />
															<span className="text-gray-200 text-sm">{feature}</span>
														</div>
													))}
												</div>
											)}
										</div>
										
										<button
											onClick={(e) => {
												e.stopPropagation();
												toggleFeatures(plan.id);
											}}
											className="flex items-center justify-center w-full text-purple-300 text-sm font-medium transition-all duration-200 rounded-lg py-2"
										>
											{expandedFeatures[plan.id] ? (
												<>
													<FaChevronUp className="mr-1" />
													Show Less
												</>
											) : (
												<>
													<FaChevronDown className="mr-1" />
													+{plan.features.length - 5} more features
												</>
											)}
										</button>
									</div>
								)}
							</div>

							{/* Dynamic Button */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									if (selectedPlan === plan.id) {
										handlePayment();
									} else {
										setSelectedPlan(plan.id);
									}
								}}
								className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ease-in-out transform ${
									selectedPlan === plan.id
										? "bg-gray-700 text-white shadow-lg"
										: "bg-gray-700 text-gray-300 border border-gray-600"
								}`}
							>
								{selectedPlan === plan.id 
									? (plan.price === 0 ? "Start Free Trial" : "Proceed to Payment")
									: "Select Plan"
								}
							</button>
						</div>
					))}
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<FaExclamationTriangle className="text-red-400 mr-3" />
								<span className="text-red-200">{error}</span>
							</div>
							{error.includes("Please log in") && (
								<button
									onClick={handleLogin}
									className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
								>
									Login
								</button>
							)}
						</div>
					</div>
				)}

        {/* Dialogs */}
        <LoadingDialog 
          isOpen={showLoadingDialog} 
          message={loadingMessage} 
        />
        
        <SuccessDialog 
          isOpen={showSuccessDialog} 
          message={successMessage} 
        />
        
        <ErrorDialog 
          isOpen={showErrorDialog} 
          message={errorMessage} 
          onClose={() => setShowErrorDialog(false)}
        />
			</div>
		</div>
	);
}
