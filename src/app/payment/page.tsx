"use client";
import { useState, useEffect } from "react";
import { FaCrown, FaGem, FaRocket, FaCheck, FaTimes, FaExclamationTriangle, FaCalendarAlt, FaClock } from "react-icons/fa";

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

export default function PaymentPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [razorpayLoaded, setRazorpayLoaded] = useState(false);

	useEffect(() => {
		// Check if Razorpay is loaded
		const checkRazorpay = () => {
			if (typeof window !== 'undefined' && (window as any).Razorpay) {
				setRazorpayLoaded(true);
				console.log('Razorpay loaded successfully');
			} else {
				console.log('Razorpay not loaded yet, retrying...');
				setTimeout(checkRazorpay, 1000);
			}
		};
		checkRazorpay();
	}, []);

	useEffect(() => {
		const plan = searchParams?.plan;
		if (typeof plan === 'string' && PLANS.find(p => p.id === plan)) {
			setSelectedPlan(plan);
		}
	}, [searchParams]);

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

	const handlePayment = async () => {
		if (!user) {
			setError("Please log in to proceed with payment");
          return;
        }

		setLoading(true);
    setError("");

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

			if (data.subscriptionId) {
				// Check if Razorpay is loaded
				if (typeof window !== 'undefined' && (window as any).Razorpay) {
					// Redirect to Razorpay checkout
					const options = {
						key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
						subscription_id: data.subscriptionId,
						name: 'CreatorShield',
						description: `${selectedPlan} Plan`,
											handler: function (response: any) {
						console.log('Payment successful:', response);
						// Handle successful payment
						window.location.href = `/payment-success?plan=${selectedPlan}&subscription_id=${data.subscriptionId}`;
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
					setError('Payment gateway not loaded. Please refresh the page and try again.');
				}
			} else {
				setError(data.error || 'Failed to create subscription');
			}
		} catch (error: any) {
			setError(`Payment failed: ${error.message}`);
		} finally {
      setLoading(false);
    }
  };

	const handleLogin = () => {
		router.push("/auth/login");
	};

	const selectedPlanData = PLANS.find(plan => plan.id === selectedPlan);

	return (
		<div className="min-h-screen bg-slate-900 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						Choose Your <span className="text-blue-400">Plan</span>
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
							className={`relative rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
								selectedPlan === plan.id
									? "bg-blue-600 border-2 border-blue-400 shadow-2xl"
									: "bg-gray-800 border border-gray-600 hover:border-blue-400"
							}`}
							onClick={() => setSelectedPlan(plan.id)}
						>
							{/* Popular Badge */}
							{plan.id === "monthly" && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
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
									<span className="text-3xl font-bold text-blue-400">
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
										<FaCalendarAlt className="mr-1 text-blue-400" />
										{plan.duration}
									</div>
									<div className="flex items-center text-sm text-gray-300">
										<FaClock className="mr-1 text-green-400" />
										{plan.responseTime}
									</div>
								</div>

								{/* Highlight */}
								<div className="bg-blue-500 rounded-lg p-2">
									<p className="text-white text-sm font-medium">{plan.highlight}</p>
								</div>
							</div>

							{/* Features List */}
							<div className="space-y-2 mb-6">
								{plan.features.slice(0, 5).map((feature, index) => (
									<div key={index} className="flex items-center">
										<FaCheck className="text-green-400 mr-2 flex-shrink-0" />
										<span className="text-gray-200 text-sm">{feature}</span>
									</div>
										))}
								{plan.features.length > 5 && (
									<div className="text-blue-300 text-sm font-medium">
										+{plan.features.length - 5} more features
								</div>
							)}
							</div>

							{/* Select Button */}
							<button
								onClick={() => setSelectedPlan(plan.id)}
								className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-200 ${
									selectedPlan === plan.id
										? "bg-white text-blue-600 shadow-lg"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
								}`}
							>
								{selectedPlan === plan.id ? "Selected" : "Select Plan"}
							</button>
            </div>
					))}
              </div>

				{/* Selected Plan Details */}
				{selectedPlanData && (
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-gray-600/30">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-3xl font-bold text-white mb-2">
									{selectedPlanData.name} Plan Selected
								</h2>
								<p className="text-gray-300">
									${selectedPlanData.price} {selectedPlanData.period}
								</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-200">
									${selectedPlanData.price}
								</div>
								<div className="text-gray-400 text-sm">
									{selectedPlanData.period}
								</div>
              </div>
              </div>

						{/* Duration & Response Time */}
						<div className="flex justify-center space-x-8 mb-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-400">{selectedPlanData.duration}</div>
								<div className="text-gray-400 text-sm">Duration</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-400">{selectedPlanData.responseTime}</div>
								<div className="text-gray-400 text-sm">Support Response</div>
              </div>
              </div>

						{/* All Features */}
						<div className="mb-6">
							<h3 className="text-xl font-bold text-white mb-4">All Features Included</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{selectedPlanData.features.map((feature, index) => (
									<div key={index} className="flex items-center">
										<FaCheck className="text-green-400 mr-3 flex-shrink-0" />
										<span className="text-gray-200">{feature}</span>
              </div>
								))}
							</div>
          </div>

						{/* Payment Button */}
						<div className="text-center">
							<button
								onClick={handlePayment}
								disabled={loading || !razorpayLoaded}
								className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
							>
								{loading ? "Processing..." : !razorpayLoaded ? "Loading Payment..." : selectedPlanData.price === 0 ? "Start Free Trial" : "Proceed to Payment"}
							</button>
							{!razorpayLoaded && (
								<p className="text-yellow-400 text-sm mt-2">Loading payment gateway...</p>
							)}
        </div>
        </div>
				)}

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
      </div>
    </div>
  );
}