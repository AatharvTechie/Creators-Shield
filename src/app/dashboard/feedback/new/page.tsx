"use client";

import { useSession } from "next-auth/react";

export default function NewFeedbackPage() {
  const { data: session } = useSession();
  // Use session.user.email for all feedback logic
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Feedback</h1>
      <p>Feedback form will be implemented here.</p>
    </div>
  );
} 