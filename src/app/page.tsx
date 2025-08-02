"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaShieldAlt, FaRegSmile, FaRocket, FaRegLightbulb, FaStar, FaHandshake, FaLock, FaUsers, FaCrown, FaGem, FaCalendar, FaClock, FaCheck } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { WhatsAppButton, WhatsAppLink } from "@/components/ui/whatsapp-button";

function useScrollFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new window.IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold: 0.2 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => { if (ref.current) observer.unobserve(ref.current); };
    }
  }, []);
  return [ref, visible] as const;
}

// Typing animation hook
function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showCS, setShowCS] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Animate CS character after short delay
  useEffect(() => {
    const timer = setTimeout(() => setShowCS(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new window.IntersectionObserver(
        ([entry]) => setHeroVisible(entry.isIntersecting),
        { threshold: 0.3 }
      );
      if (heroRef.current) observer.observe(heroRef.current);
      return () => { if (heroRef.current) observer.unobserve(heroRef.current); };
    }
  }, []);

  useEffect(() => {
    // Check for JWT or session (customize as per your auth logic)
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("creator_jwt");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handlePlanClick = () => {
    if (isLoggedIn) {
      router.push("/plans");
    } else {
      router.push("/auth/register");
    }
  };

  // Section fade-in hooks
  const [whatRef, whatVisible] = useScrollFadeIn();
  const [uniqueRef, uniqueVisible] = useScrollFadeIn();
  const [featuresRef, featuresVisible] = useScrollFadeIn();
  const [plansRef, plansVisible] = useScrollFadeIn();
  const [commitRef, commitVisible] = useScrollFadeIn();
  const [collabRef, collabVisible] = useScrollFadeIn();

  // Remove useTypingEffect and typingText

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181c2f] to-[#232946] text-white">
      {/* Hero Section - Centered, Full Width, Animated CS */}
      <div ref={heroRef} className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-24 relative bg-gradient-to-br from-[#1a223f]/80 to-[#232946]/90 overflow-hidden">
        {/* Animated CS Character/Icon */}
        <div className={`flex flex-col items-center mb-8 transition-all duration-700 ${showCS ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
          <div className="relative flex items-center justify-center">
            {/* Glowing shadow/light effect */}
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-blue-500/30 blur-3xl z-0 animate-glow" />
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-blue-500 via-light-green-500 to-red-400 shadow-2xl flex items-center justify-center animate-pulse-slow relative z-10">
              <span className="text-7xl md:text-8xl font-extrabold text-white drop-shadow-lg select-none animate-fade-in-up">CS</span>
              {/* Animated shield pulse/glow */}
              <span className="absolute inset-0 rounded-full border-4 border-blue-300/40 animate-glow" />
            </div>
            {/* Animated shield icon overlay */}
            <FaShieldAlt className="absolute bottom-2 right-2 text-4xl md:text-5xl text-blue-200 opacity-80 animate-shield-bounce z-20" />
          </div>
          <div className="mt-2 text-blue-200 text-lg font-semibold tracking-widest animate-fade-in-up delay-200">Your Content. Your Power.</div>
        </div>
        <div className={`w-full max-w-4xl text-center mx-auto transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-xl tracking-tight leading-tight animate-fade-in">
            Protect. Monetize. <span className="text-blue-400">Create.</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed animate-fade-in delay-200">
            The ultimate platform for content creators to protect their work, maximize revenue, and focus on what matters most - creating amazing content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-400">
            <Button onClick={handlePlanClick} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105">
              Start Free Trial
            </Button>
            <Button variant="outline" onClick={() => setShowDialog(true)} className="border-2 border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-white text-lg font-bold py-4 px-8 rounded-full transition-all duration-200 transform hover:scale-105">
              Watch Demo
            </Button>
            <Link href="/faq" className="text-blue-300 hover:text-blue-200 text-lg font-semibold underline">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Dialog for Get Started */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#232946] rounded-3xl shadow-2xl p-12 max-w-xl w-full text-center border-4 border-blue-500 animate-scale-in">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-blue-300 drop-shadow-xl tracking-tight">Welcome to CreatorShield!</h2>
            <div className="text-lg md:text-2xl text-gray-200 mb-8 font-medium text-center">
              CreatorShield is your all-in-one platform for content protection, copyright management, and creator monetization.<br /><br />
              Join thousands of creators who trust us to protect and grow their digital content. <br /><br />
              AI-powered copyright monitoring, instant takedowns, analytics, and more—all in one place. <b>Your content. Your power.</b>
            </div>
            <button onClick={() => { setShowDialog(false); window.location.href = '/plans'; }} className="bg-gradient-to-r from-blue-500 to-light-green-500 hover:from-blue-600 hover:to-light-green-600 text-white font-bold py-4 px-16 rounded-full text-2xl shadow-lg transition-transform transform hover:scale-105">Continue to Plans</button>
            <button onClick={() => setShowDialog(false)} className="block mx-auto mt-6 text-gray-400 hover:text-white text-base">Cancel</button>
          </div>
        </div>
      )}

      {/* What is CreatorShield? */}
      <section ref={whatRef} className={`max-w-5xl mx-auto py-16 px-8 text-left transition-all duration-700 ${whatVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-[#232946]/80 rounded-2xl shadow-2xl p-14 border border-blue-700">
          <h2 className="text-4xl font-bold mb-4 text-blue-300">What is CreatorShield?</h2>
          <p className="text-2xl text-gray-200 mb-2">
            CreatorShield is your trusted partner for content protection, copyright management, and creator monetization.
          </p>
          <p className="text-lg text-gray-300">
            We empower creators to focus on what they do best—creating—while we handle the rest.
          </p>
        </div>
      </section>

      {/* Why We're Unique - 2 columns on desktop */}
      <section ref={uniqueRef} className={`max-w-6xl mx-auto py-16 px-8 grid grid-cols-1 md:grid-cols-2 gap-14 text-left transition-all duration-700 ${uniqueVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-100">
            <FaStar className="text-6xl text-yellow-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">AI-Driven Protection</h3>
              <p className="text-gray-300 text-xl">Advanced AI to detect and stop copyright infringement across the web.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-200">
            <FaHandshake className="text-6xl text-green-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Creator-First Commitment</h3>
              <p className="text-gray-300 text-xl">We put creators first—always. Fair pricing, transparent policies, and real support.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-100">
            <FaLock className="text-6xl text-blue-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Privacy & Security</h3>
              <p className="text-gray-300 text-xl">Your data and content are protected with industry-leading security.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-200">
            <FaUsers className="text-6xl text-pink-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Global Community</h3>
              <p className="text-gray-300 text-xl">Join thousands of creators and industry partners worldwide.</p>
            </div>
                  </div>
                </div>
      </section>

      {/* Features Section - 2 columns on desktop */}
      <section ref={featuresRef} className={`max-w-7xl mx-auto py-20 px-8 grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col gap-14">
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-100">
            <FaShieldAlt className="text-7xl text-blue-400 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Content Protection</h3>
            <p className="text-gray-300 text-xl">AI-powered copyright monitoring and takedown tools for your videos, music, and more.</p>
          </div>
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-200">
            <FaRocket className="text-7xl text-light-green-400 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Growth Analytics</h3>
            <p className="text-gray-300 text-xl">Track your reach, audience, and engagement with beautiful dashboards.</p>
                  </div>
                </div>
        <div className="flex flex-col gap-14">
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-100">
            <FaRegSmile className="text-7xl text-pink-300 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Easy Monetization</h3>
            <p className="text-gray-300 text-xl">Subscriptions, tips, and more—get paid for your creativity, instantly.</p>
          </div>
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-200">
            <FaRegLightbulb className="text-7xl text-yellow-300 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Smart Automation</h3>
            <p className="text-gray-300 text-xl">Automate copyright claims, DMCA, and more with one click.</p>
          </div>
        </div>
      </section>

      {/* Subscription Plans Preview - 3 columns */}
      <section ref={plansRef} className={`max-w-6xl mx-auto py-20 px-8 text-center transition-all duration-700 ${plansVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-4xl font-bold mb-10 text-blue-300">Subscription Plans</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          All plans include complete access to all features. Choose the duration that works best for you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center mb-8">
          {[
            {
            name: "Free Trial",
            price: "$0",
              desc: "7 days access to all features",
              color: "purple",
              icon: <FaCrown className="text-4xl text-purple-400 mb-4" />,
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
            name: "Monthly",
            price: "$70",
            desc: "per month",
              color: "blue",
              icon: <FaGem className="text-4xl text-blue-400 mb-4" />,
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
            name: "Yearly",
            price: "$500",
            desc: "per year",
              color: "green",
              icon: <FaRocket className="text-4xl text-green-400 mb-4" />,
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
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative bg-gray-800 border border-gray-600 rounded-2xl p-6 flex flex-col items-center min-w-[280px] shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up delay-${i * 100} ${
                plan.name === "Monthly" ? "ring-2 ring-blue-500 bg-blue-900" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.name === "Monthly" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.icon}
                              <div className="text-2xl font-bold mb-2 text-white">{plan.name}</div>
                <div className="text-3xl font-extrabold mb-1 text-blue-400">{plan.price}</div>
                <div className="mb-3 text-gray-300 text-sm">{plan.desc}</div>
              
              {/* Duration & Response Time */}
                              <div className="flex justify-center space-x-4 mb-4">
                  <div className="flex items-center text-xs text-gray-300">
                    <FaCalendar className="mr-1 text-blue-400" />
                    {plan.duration}
                  </div>
                  <div className="flex items-center text-xs text-gray-300">
                    <FaClock className="mr-1 text-green-400" />
                    {plan.responseTime}
                  </div>
                </div>

                {/* Highlight */}
                <div className="bg-blue-500 rounded-lg p-2 mb-4 w-full">
                  <p className="text-white text-xs font-medium">{plan.highlight}</p>
                </div>
              
              {/* Features - Show only first 3 */}
              <div className="mb-4 w-full">
                <h4 className="text-xs font-semibold text-green-400 mb-2">✅ All Features Included</h4>
                <ul className="space-y-1 text-left">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-200 text-xs">
                      <FaCheck className="mr-2 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="text-blue-400 text-xs font-medium">
                    +{plan.features.length - 3} more features
                    </li>
                </ul>
              </div>

              <Link href="/plans" className={`mt-auto inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg text-sm transition-all duration-200 transform hover:scale-105`}>
                View All Features
              </Link>
            </div>
          ))}
        </div>
        <Link href="/plans" className="inline-block mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-xl shadow-lg text-xl transition-all duration-200 transform hover:scale-105">
          View All Plans
        </Link>
      </section>

      {/* Our Commitment */}
      <section ref={commitRef} className={`max-w-5xl mx-auto py-20 px-8 text-center transition-all duration-700 ${commitVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-[#232946]/80 rounded-2xl shadow-2xl p-14 border border-green-700">
          <h2 className="text-4xl font-bold mb-4 text-green-300">Our Commitment</h2>
          <p className="text-2xl text-gray-200 mb-2">
            We are committed to empowering creators with the best tools, fair pricing, and a secure, supportive community.
          </p>
          <p className="text-lg text-gray-300">
            Your success is our mission. We promise transparency, privacy, and relentless innovation for creators everywhere.
          </p>
        </div>
      </section>

      {/* Collaborators */}
      <section ref={collabRef} className={`max-w-6xl mx-auto py-16 px-8 text-center transition-all duration-700 ${collabVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl font-bold mb-10 text-yellow-200">Our Collaborators</h2>
        <div className="flex flex-wrap gap-12 justify-center items-center">
          {/* YouTube */}
          <div className="bg-white/10 rounded-xl px-8 py-6 flex items-center gap-3 shadow">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-2xl font-semibold text-white">YouTube</span>
          </div>
          
          {/* Instagram */}
          <div className="bg-white/10 rounded-xl px-8 py-6 flex items-center gap-3 shadow">
            <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="text-2xl font-semibold text-white">Instagram</span>
          </div>
          
          {/* TikTok */}
          <div className="bg-white/10 rounded-xl px-8 py-6 flex items-center gap-3 shadow">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.69-1.35 3.95-.5.84-1.31 1.5-2.15 2.06-1.31.83-2.72 1.31-4.24 1.35-1.59.05-3.08-.31-4.46-.87-1.41-.58-2.53-1.5-3.41-2.72-.88-1.22-1.36-2.62-1.42-4.12-.05-1.65.28-3.15 1.04-4.55.76-1.4 1.83-2.51 3.13-3.34 1.3-.83 2.76-1.3 4.35-1.4.01-.01.01-.01.02-.01v4.03c-.01.01-.02.01-.03.01-.99.01-1.89.35-2.68.87-.79.52-1.42 1.21-1.89 2.03-.47.82-.71 1.72-.71 2.69 0 .97.24 1.87.71 2.69.47.82 1.1 1.51 1.89 2.03.79.52 1.69.86 2.68.87.99.01 1.89-.35 2.68-.87.79-.52 1.42-1.21 1.89-2.03.47-.82.71-1.72.71-2.69 0-.97-.24-1.87-.71-2.69-.47-.82-1.1-1.51-1.89-2.03-.79-.52-1.69-.86-2.68-.87v-4.03c1.31.02 2.61.01 3.91.02z"/>
            </svg>
            <span className="text-2xl font-semibold text-white">TikTok</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto py-20 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-blue-300">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300">Everything you need to know about CreatorShield</p>
        </div>
        
        <div className="space-y-6">
          {/* First Row - 2 Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FAQ Item 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer group">
              <h3 className="text-xl font-bold mb-4 text-white">How does CreatorShield protect my content?</h3>
              <p className="text-gray-300 mb-4">
                CreatorShield uses advanced AI technology to continuously monitor multiple platforms for unauthorized use of your content. When violations are detected, we automatically generate DMCA takedown requests and provide you with detailed reports.
              </p>
              <Link href="/features/protection" className="flex items-center text-blue-300 text-sm group-hover:text-blue-200 transition-colors">
                <span>Learn more about our protection system</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {/* FAQ Item 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer group">
              <h3 className="text-xl font-bold mb-4 text-white">What platforms do you monitor?</h3>
              <p className="text-gray-300 mb-4">
                We currently monitor YouTube, Instagram, TikTok, and other major social media platforms. Our system automatically scans for reuploads, reposts, and unauthorized use of your original content across these platforms.
              </p>
              <Link href="/features/platforms" className="flex items-center text-green-300 text-sm group-hover:text-green-200 transition-colors">
                <span>View all supported platforms</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          {/* Second Row - 1 Question (Centered) */}
          <div className="flex justify-center">
            {/* FAQ Item 3 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group max-w-4xl">
              <h3 className="text-xl font-bold mb-4 text-white">How quickly can you remove unauthorized content?</h3>
              <p className="text-gray-300 mb-4">
                Our automated system typically processes takedown requests within 24-48 hours. For urgent cases, our premium plans offer expedited processing. We also provide real-time notifications so you're always informed about the status of your requests.
              </p>
              <Link href="/features/response-times" className="flex items-center text-purple-300 text-sm group-hover:text-purple-200 transition-colors">
                <span>Learn about our response times</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* View All FAQs Link */}
        <div className="text-center mt-12">
          <Link href="/faq" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors group">
            <span className="text-lg font-semibold">View All FAQs</span>
            <svg className="w-5 h-5 animate-bounce-x group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Contact Support */}
      <section className="max-w-6xl mx-auto py-20 px-8">
        <div className="text-center">
          <div className="bg-blue-600/20 backdrop-blur-lg rounded-xl p-8 border border-blue-400/30">
            <h3 className="text-2xl font-bold mb-4 text-white">Still have questions?</h3>
            <p className="text-gray-200 mb-6">Our creator support team is here to help you 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:support@creatorshield.com" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                📧 Email Support
              </a>
              <WhatsAppButton 
                className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                customMessage="I need help with CreatorShield"
              >
                Live Chat (WhatsApp)
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto py-20 px-8">
        <div className="text-center">
          <div className="bg-green-600/20 backdrop-blur-lg rounded-xl p-8 border border-green-400/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to protect your content?</h2>
            <p className="text-gray-200 mb-6">Join thousands of creators who trust CreatorShield</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/plans" className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-[#1a223f]/90 border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-blue-300 mb-4">CreatorShield</h3>
              <p className="text-gray-300 mb-4">
                Protecting creators worldwide with advanced AI-powered content protection and copyright management.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">YouTube</a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/plans" className="text-gray-300 hover:text-blue-300 transition-colors">Plans</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-blue-300 transition-colors">FAQ</Link></li>
                <li><Link href="/auth/login" className="text-gray-300 hover:text-blue-300 transition-colors">Login</Link></li>
                <li><Link href="/auth/register" className="text-gray-300 hover:text-blue-300 transition-colors">Register</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:support@creatorshield.com" className="text-gray-300 hover:text-blue-300 transition-colors">Email Support</a></li>
                <li><WhatsAppLink className="text-gray-300 hover:text-blue-300 transition-colors">
                  WhatsApp Support
                </WhatsAppLink></li>
                <li><a href="/help" className="text-gray-300 hover:text-blue-300 transition-colors">Help Center</a></li>
                <li><Link href="/contacts" className="text-gray-300 hover:text-blue-300 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <Link href="/legal/rights" className="text-gray-400 hover:text-blue-300 transition-colors">
        &copy; {new Date().getFullYear()} CreatorShield. All rights reserved.
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
