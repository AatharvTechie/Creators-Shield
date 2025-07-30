"use client";
import { useState } from "react";
import { FaCrown, FaGem, FaRocket, FaExclamationTriangle, FaCheck, FaTimes, FaInfinity, FaClock, FaShieldAlt, FaChartLine, FaFilePdf, FaGlobe, FaBell, FaEnvelope, FaHistory, FaPalette, FaCode, FaGavel, FaUsers, FaCogs, FaBrain, FaCalendar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PLANS = [
	{
		id: "free",
		name: "Free Trial",
		price: 0,
		desc: "7 days access to all features",
		icon: <FaCrown className="text-5xl text-purple-500 mb-4" />,
		color: "purple",
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
		desc: "$70 per month, billed monthly",
		icon: <FaGem className="text-5xl text-blue-500 mb-4" />,
		color: "blue",
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
		desc: "$500 per year, billed yearly",
		icon: <FaRocket className="text-5xl text-green-500 mb-4" />,
		color: "green",
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

const FEATURE_COMPARISON = [
	{
		feature: "Duration",
		free: "7 Days",
		monthly: "1 Month",
		yearly: "1 Year"
	},
	{
		feature: "Support Response",
		free: "24-48h",
		monthly: "7h",
		yearly: "7h"
	},
	{
		feature: "Unlimited YouTube Channels",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Unlimited Video Monitoring",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Unlimited Violation Detection",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Unlimited DMCA Requests",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Advanced Analytics & Reports",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Multi-Platform Monitoring",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Real-Time Alerts",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Email Templates",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Violation History",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Custom Branding",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "API Access",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Legal Consultation",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Bulk Operations",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Predictive Analytics",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Priority Queue Processing",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Custom Integrations",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Team Management",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Advanced AI Protection",
		free: "✅",
		monthly: "✅",
		yearly: "✅"
	},
	{
		feature: "Dedicated Account Manager",
		free: "❌",
		monthly: "❌",
		yearly: "✅"
	}
];

export default function PlansPage() {
	const router = useRouter();
	const [selectedPlan, setSelectedPlan] = useState("monthly");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);

	useEffect(() => {
		// Check if user is logged in
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("creator_jwt");
			const email = localStorage.getItem("user_email");
			setIsLoggedIn(!!token);
			setUserEmail(email);
			}
	}, []);

	const handlePlanSelect = (planId: string) => {
		setSelectedPlan(planId);
	};

	const handleGetStarted = async () => {
		if (isLoggedIn && userEmail) {
			// User is logged in, proceed to payment
			router.push(`/payment?plan=${selectedPlan}`);
		} else {
			// User is not logged in, redirect to register with plan info
			router.push(`/auth/register?plan=${selectedPlan}&redirect=payment`);
		}
	};

	const handleLogin = () => {
		router.push(`/auth/login?redirect=plans&plan=${selectedPlan}`);
	};

	return (
		<div className="min-h-screen bg-slate-900">
			{/* Header */}
			<div className="text-center py-16 px-4">
				<h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
					Choose Your <span className="text-blue-500">Plan</span>
				</h1>
				<p className="text-xl text-gray-300 max-w-3xl mx-auto">
					All plans include complete access to all features. Choose the duration that works best for you.
				</p>
			</div>

			{/* Plans Grid */}
			<div className="max-w-7xl mx-auto px-4 pb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{PLANS.map((plan) => (
					<div
						key={plan.id}
							className={`relative rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${
								selectedPlan === plan.id
									? "bg-blue-600 border-2 border-blue-400 shadow-2xl"
									: "bg-gray-800 border border-gray-600 hover:border-blue-400"
						}`}
							onClick={() => handlePlanSelect(plan.id)}
					>
						{/* Popular Badge */}
						{plan.id === "monthly" && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
										Most Popular
									</span>
							</div>
						)}

							{/* Plan Header */}
							<div className="text-center mb-8">
								<div className="flex justify-center mb-4">{plan.icon}</div>
								<h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
								<div className="mb-4">
									<span className="text-4xl font-bold text-blue-400">
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
								<p className="text-gray-300 text-sm mb-4">{plan.desc}</p>
								
								{/* Duration & Response Time */}
								<div className="flex justify-center space-x-4 mb-4">
									<div className="flex items-center text-sm text-gray-300">
										<FaCalendar className="mr-2 text-blue-400" />
										{plan.duration}
									</div>
									<div className="flex items-center text-sm text-gray-300">
										<FaClock className="mr-2 text-green-400" />
										{plan.responseTime}
									</div>
								</div>

								{/* Highlight */}
								<div className="bg-blue-500 rounded-lg p-3">
									<p className="text-white text-sm font-medium">{plan.highlight}</p>
								</div>
							</div>

							{/* Features List - Show only 4 key features */}
							<div className="space-y-3 mb-8">
								{plan.features.slice(0, 4).map((feature, index) => (
									<div key={index} className="flex items-center">
										<FaCheck className="text-green-400 mr-3 flex-shrink-0" />
										<span className="text-gray-200 text-sm">{feature}</span>
						</div>
								))}
								<div className="text-blue-300 text-sm font-medium">
										+{plan.features.length - 4} more features
						</div>
							</div>

							{/* Select Button */}
						<button
								onClick={() => handlePlanSelect(plan.id)}
								className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
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

				{/* Comparison Table */}
				<div className="mt-16">
					<h2 className="text-3xl font-bold text-white text-center mb-8">
						Complete Feature Comparison
					</h2>
					<div className="bg-white rounded-2xl p-8 border border-gray-300 overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-300">
									<th className="text-left py-4 px-4 font-semibold text-gray-700">Feature</th>
									<th className="text-center py-4 px-4 font-semibold text-purple-600">Free Trial</th>
									<th className="text-center py-4 px-4 font-semibold text-blue-600">Monthly</th>
									<th className="text-center py-4 px-4 font-semibold text-green-600">Yearly</th>
								</tr>
							</thead>
							<tbody>
								{FEATURE_COMPARISON.map((item, index) => (
									<tr key={index} className="border-b border-gray-200">
										<td className="py-3 px-4 text-gray-700 font-medium">{item.feature}</td>
										<td className="py-3 px-4 text-center text-purple-600">{item.free}</td>
										<td className="py-3 px-4 text-center text-blue-600">{item.monthly}</td>
										<td className="py-3 px-4 text-center text-green-600">{item.yearly}</td>
									</tr>
								))}
							</tbody>
						</table>
				</div>
			</div>

				{/* CTA Section */}
				<div className="mt-16 text-center">
					<div className="bg-blue-600 rounded-2xl p-8 border border-blue-500">
						<h3 className="text-2xl font-bold text-white mb-4">
							Ready to Protect Your Content?
						</h3>
						<p className="text-gray-200 mb-6 max-w-2xl mx-auto">
							{isLoggedIn 
								? "You're all set! Click below to proceed with payment and start protecting your content."
								: "Register now to get started, or login if you already have an account."
							}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onClick={handleGetStarted}
								className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
							>
								{isLoggedIn ? "Proceed to Payment" : "Register & Continue"}
							</button>
							{!isLoggedIn && (
								<button
									onClick={handleLogin}
									className="bg-gray-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg border border-gray-600"
								>
									Login
								</button>
							)}
					</div>
					</div>
				</div>
			</div>
		</div>
	);
}