'use client';

import { useState, useEffect } from 'react';

interface SuspensionStatus {
  isSuspended: boolean;
  timeRemaining: number | null;
  hours: number;
  minutes: number;
  seconds: number;
  message: string;
}

export function useSuspensionCheck() {
  const [suspensionStatus, setSuspensionStatus] = useState<SuspensionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSuspension = async () => {
    const token = localStorage.getItem('creator_jwt');
    if (!token) {
      setSuspensionStatus(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/check-suspension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        console.log('Suspension check failed:', response.status);
        setSuspensionStatus({
          isSuspended: false,
          timeRemaining: null,
          hours: 0,
          minutes: 0,
          seconds: 0,
          message: '',
        });
        return;
      }

      const data = await response.json();
      
      if (data.isSuspended) {
        setSuspensionStatus({
          isSuspended: true,
          timeRemaining: data.timeRemaining,
          hours: data.hours,
          minutes: data.minutes,
          seconds: data.seconds,
          message: data.message,
        });
      } else {
        setSuspensionStatus({
          isSuspended: false,
          timeRemaining: null,
          hours: 0,
          minutes: 0,
          seconds: 0,
          message: '',
        });
      }
    } catch (error) {
      console.error('Error checking suspension status:', error);
      // Don't set suspension status to null on error, just log it
      // This prevents the UI from breaking when there are network issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSuspension();
    
    // Check every minute
    const interval = setInterval(checkSuspension, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    suspensionStatus,
    loading,
    checkSuspension,
  };
} 