import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';

export function useSessionActivity() {
  const { user } = useAuth();
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const updateSessionActivity = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('creator_jwt') || localStorage.getItem('admin_jwt');
      if (!token) return;

      await fetch('/api/session/activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  };

  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set new timeout to update session activity after 5 minutes of inactivity
    activityTimeoutRef.current = setTimeout(() => {
      updateSessionActivity();
    }, 5 * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    if (!user) return;

    // Update session activity immediately when user is authenticated
    updateSessionActivity();

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Update session activity every 10 minutes while user is active
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only update if user has been active in the last 15 minutes
      if (timeSinceLastActivity < 15 * 60 * 1000) {
        updateSessionActivity();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      // Clean up timeout and interval
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      clearInterval(interval);
    };
  }, [user]);

  return {
    updateSessionActivity
  };
} 