'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface ReactivationPendingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeRemaining: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function ReactivationPendingDialog({ 
  isOpen, 
  onClose, 
  timeRemaining, 
  hours, 
  minutes, 
  seconds 
}: ReactivationPendingDialogProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining);
  const [displayHours, setDisplayHours] = useState(hours);
  const [displayMinutes, setDisplayMinutes] = useState(minutes);
  const [displaySeconds, setDisplaySeconds] = useState(seconds);

  // Reset timer when dialog opens or timeRemaining changes
  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      setTimeLeft(timeRemaining);
      setDisplayHours(hours);
      setDisplayMinutes(minutes);
      setDisplaySeconds(seconds);
    }
  }, [isOpen, timeRemaining, hours, minutes, seconds]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setDisplayHours(0);
      setDisplayMinutes(0);
      setDisplaySeconds(0);
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    setDisplayHours(hours);
    setDisplayMinutes(minutes);
    setDisplaySeconds(seconds);
  }, [timeLeft]);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-green-600">
            Reactivation Approved!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your reactivation request has been approved by our admin team. Your account will be activated shortly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Activation Countdown
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your account will be automatically activated after the countdown expires.
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Time Remaining
                </span>
              </div>
              <div className="flex justify-center items-center gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(displayHours)}
                  </div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(displayMinutes)}
                  </div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(displaySeconds)}
                  </div>
                  <div className="text-xs text-gray-500">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">
                  What happens next?
                </h4>
                <p className="text-sm text-blue-700">
                  Your account will be automatically activated after 24 hours from approval. 
                  You'll be able to login normally once the countdown reaches zero.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={onClose}
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