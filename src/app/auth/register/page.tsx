"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();
  
  // Get search params in useEffect to avoid SSR issues
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setRedirectTo(urlParams.get("redirect"));
    setSelectedPlan(urlParams.get("plan"));
  }, []);

  // Check registration status on component mount
  React.useEffect(() => {
    async function checkRegistrationStatus() {
      try {
        const res = await fetch('/api/settings/check-registration');
        const data = await res.json();
        setRegistrationDisabled(!data.allowRegistrations);
        setRegistrationMessage(data.message);
      } catch (err) {
        console.error('Failed to check registration status:', err);
      }
    }
    checkRegistrationStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function generateAvatar(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Enhanced validation with detailed messages
    if (!form.name.trim()) {
      setError("Please enter your full name. This will be displayed on your profile.");
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter a valid email address. This will be used for account verification and login.");
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError("Please create a strong password. Use a combination of letters, numbers, and special characters for better security.");
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long for security purposes.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match. Please make sure both password fields contain the same value.");
      setLoading(false);
      return;
    }
    
    const avatar = generateAvatar(form.name);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, location: form.location, avatar }),
    });
    const data = await res.json();
    setLoading(false);
    
    if (data.success) {
      setSuccess(true);
      setSuccessMessage(data.message || "Registration successful! Redirecting...");
      // Store user email if available
      if (data.user && data.user.email) {
        localStorage.setItem("user_email", data.user.email);
      }
      // Redirect based on the redirect parameter
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          if (redirectTo === "payment" && selectedPlan) {
            // Store the selected plan for payment page
            localStorage.setItem('selected_plan', selectedPlan);
            router.push(`/payment?plan=${selectedPlan}`);
          } else {
        router.push('/plans');
          }
        }
      }, 2000);
    } else {
      // Show the specific error message from the API
      setError(data.message || data.error || "Registration failed. Please try again or contact support if the problem persists.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#232946] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 shadow-lg flex items-center justify-center mb-4 border-2 border-blue-200">
            <img src="/favicon.ico" alt="CreatorShield Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-blue-100 mb-2 tracking-tight">Create Your Account</h1>
          <p className="text-base text-blue-200 mb-2">Sign up to access the CreatorShield dashboard</p>
        </div>
        <div className="bg-[#232946]/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-blue-900/30">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-400 mb-2">Registration Successful!</h2>
              <p className="text-blue-200 text-sm leading-relaxed max-w-md mx-auto">
                {successMessage}
              </p>
            </div>
          ) : registrationDisabled ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Registration Temporarily Disabled</h2>
              <p className="text-blue-200 text-sm leading-relaxed max-w-md mx-auto">
                {registrationMessage}
              </p>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/auth/login')}
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Full Name *</label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Email Address *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Password *</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Create a strong password (min. 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
                <p className="text-xs text-blue-300 mt-1">Use a combination of letters, numbers, and special characters</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Confirm Password *</label>
                <Input
                  name="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Location <span className="text-xs text-blue-300">(optional)</span></label>
                <Input
                  name="location"
                  placeholder="Your city or country"
                  value={form.location}
                  onChange={handleChange}
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm text-center font-medium bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md mt-2 transition-all duration-200" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
          {/* Only show "Already have an account?" when registration is enabled */}
          {!registrationDisabled && !success && (
            <div className="mt-6 text-center">
              <span className="text-blue-200 text-sm">Already have an account?</span>
              <Button variant="link" onClick={() => router.push('/auth/login')} className="ml-2 text-blue-400 font-semibold text-sm">Login</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
} 