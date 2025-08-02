'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Send, CheckCircle, XCircle } from "lucide-react";


interface DeactivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hasReactivationRequest: boolean;
  reactivationStatus: string;
}

export function DeactivationDialog({ 
  isOpen, 
  onClose, 
  hasReactivationRequest,
  reactivationStatus
}: DeactivationDialogProps) {
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !explanation.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 Token found:', token.substring(0, 50) + '...');

      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      console.log('🔍 Extracted userId:', userId);
      console.log('🔍 Form data:', { reason: reason.trim(), explanation: explanation.trim() });

      const requestData = {
        userId,
        reason: reason.trim(),
        explanation: explanation.trim()
      };

      console.log('🔍 Sending request data:', requestData);

      const response = await fetch('/api/auth/reactivation-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('🔍 Response status:', response.status);
      const responseData = await response.json();
      console.log('🔍 Response data:', responseData);

      if (response.ok) {
        console.log('✅ Reactivation request submitted successfully');
        setSubmitted(true);
      } else {
        console.error('❌ Failed to submit reactivation request:', responseData);
        const errorMessage = responseData.message || responseData.error || 'Failed to submit reactivation request';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error submitting reactivation request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit reactivation request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitted) {
      setSubmitted(false);
      setReason('');
      setExplanation('');
    }
    onClose();
  };

  if (hasReactivationRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-yellow-600">
              Account Deactivated
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your account has been deactivated by an administrator.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Reactivation Request Submitted
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your reactivation request has been submitted and is pending admin approval. 
                You will be notified once the admin reviews your request.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">
                      Request Status
                    </h4>
                    <p className="text-sm text-green-700">
                      Your reactivation request is currently under review by our admin team. 
                      This process typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                I Understand
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-green-600">
              Request Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your reactivation request has been submitted and is pending admin approval.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">
                      Request Submitted
                    </h4>
                    <p className="text-sm text-green-700">
                      Your reactivation request has been successfully submitted. 
                      Our admin team will review your request and get back to you within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-red-600">
            Account Deactivated
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your account has been deactivated by an administrator. You must submit a reactivation request to regain access.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Reactivation Required
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              To regain access to your account, please submit a reactivation request with a valid reason.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Reason for Reactivation *
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief reason for reactivation"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="explanation" className="text-sm font-medium text-gray-700">
                Detailed Explanation *
              </Label>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Please provide a detailed explanation of why your account should be reactivated..."
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    What happens next?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Your reactivation request will be reviewed by our admin team. 
                    This process typically takes 24-48 hours. You will be notified of the decision via email.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit"
                disabled={isSubmitting || !reason.trim() || !explanation.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 