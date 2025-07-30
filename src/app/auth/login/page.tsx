"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuspensionDialog } from "@/components/ui/suspension-dialog";
import { DeactivationDialog } from "@/components/ui/deactivation-dialog";
import { ReactivationPendingDialog } from "@/components/ui/reactivation-pending-dialog";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false);
  const [showReactivationPendingDialog, setShowReactivationPendingDialog] = useState(false);
  const [suspensionData, setSuspensionData] = useState({
    timeRemaining: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [deactivationData, setDeactivationData] = useState({
    hasReactivationRequest: false,
    reactivationStatus: 'none'
  });
  const [reactivationPendingData, setReactivationPendingData] = useState({
    timeRemaining: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    
    if (data.token) {
      // Store JWT in localStorage for backward compatibility
      localStorage.setItem("creator_jwt", data.token);
      // Store user email for API calls
      if (data.user && data.user.email) {
        localStorage.setItem("user_email", data.user.email);
      }
      
      // Post-auth redirect logic
      const postAuthRedirect = typeof window !== 'undefined' ? localStorage.getItem('postAuthRedirect') : null;
      if (postAuthRedirect) {
        localStorage.removeItem('postAuthRedirect');
        router.push(postAuthRedirect);
      } else if (data.user && data.user.role === 'admin') {
        router.push("/admin");
      } else {
        // All users go to dashboard after login
        router.push("/dashboard/overview");
      }
    } else if (data.error === 'Account Suspended') {
      // Show suspension dialog
      console.log('🔍 Suspension data received:', data);
      setSuspensionData({
        timeRemaining: data.timeRemaining || 0,
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0
      });
      console.log('📝 Set suspension data:', {
        timeRemaining: data.timeRemaining || 0,
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0
      });
      setShowSuspensionDialog(true);
      setError(""); // Clear any previous error
    } else if (data.error === 'Account Reactivation Pending') {
      // Show reactivation pending dialog
      setReactivationPendingData({
        timeRemaining: data.timeRemaining || 0,
        hours: data.hours || 0,
        minutes: data.minutes || 0,
        seconds: data.seconds || 0
      });
      setShowReactivationPendingDialog(true);
      setError(""); // Clear any previous error
    } else if (data.error === 'Account Deactivated') {
      // Show deactivation dialog
      setDeactivationData({
        hasReactivationRequest: data.hasReactivationRequest || false,
        reactivationStatus: data.reactivationStatus || 'none'
      });
      setShowDeactivationDialog(true);
      setError(""); // Clear any previous error
    } else {
      setError(data.message || data.error || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#232946] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 shadow-lg flex items-center justify-center mb-4 border-2 border-blue-200">
            <img src="/favicon.ico" alt="CreatorShield Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-blue-100 mb-2 tracking-tight">Login to CreatorShield</h1>
          <p className="text-base text-blue-200 mb-2">Access your dashboard</p>
        </div>
        <div className="bg-[#232946]/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-blue-900/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-blue-100 mb-1">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-100 mb-1">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
              />
            </div>
            {error && <div className="text-red-400 text-xs text-center font-semibold">{error}</div>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md mt-2 transition-all duration-200" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="my-4 text-center text-blue-200 font-semibold text-sm">or</div>
          <Button onClick={handleGoogleLogin} className="w-full bg-white text-black border border-blue-200 hover:bg-blue-50 flex items-center justify-center gap-2 py-3 text-base font-semibold rounded-md shadow-sm">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" width={24} height={24} className="inline-block align-middle" />
            Sign in with Google
          </Button>
          <div className="mt-6 text-center">
            <span className="text-blue-200 text-sm">Don't have an account?</span>
            <Button variant="link" onClick={() => router.push('/auth/register')} className="ml-2 text-blue-400 font-semibold text-sm">Register</Button>
          </div>
        </div>
      </div>
      
      <SuspensionDialog
        isOpen={showSuspensionDialog}
        onClose={() => setShowSuspensionDialog(false)}
        timeRemaining={suspensionData.timeRemaining}
        hours={suspensionData.hours}
        minutes={suspensionData.minutes}
        seconds={suspensionData.seconds}
      />
      
      <DeactivationDialog
        isOpen={showDeactivationDialog}
        onClose={() => setShowDeactivationDialog(false)}
        hasReactivationRequest={deactivationData.hasReactivationRequest}
        reactivationStatus={deactivationData.reactivationStatus}
      />
      
      <ReactivationPendingDialog
        isOpen={showReactivationPendingDialog}
        onClose={() => setShowReactivationPendingDialog(false)}
        timeRemaining={reactivationPendingData.timeRemaining}
        hours={reactivationPendingData.hours}
        minutes={reactivationPendingData.minutes}
        seconds={reactivationPendingData.seconds}
      />
    </div>
  );
}