import { useEffect, useRef } from 'react';

export function useSessionValidation() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check session status every 30 seconds
    const checkSessionStatus = async () => {
      try {
        const token = localStorage.getItem('creator_jwt');
        if (!token) return;

        const response = await fetch('/api/auth/check-session-status', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!data.valid || data.forceLogout) {
          console.log('🔒 Session invalid, forcing logout');
          
          // Clear all auth data
          localStorage.removeItem('creator_jwt');
          localStorage.removeItem('user_email');
          sessionStorage.clear();
          
          // Redirect to login
          window.location.href = '/auth/login?message=session_logged_out';
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
    };

    // Check immediately
    checkSessionStatus();

    // Set up periodic check
    intervalRef.current = setInterval(checkSessionStatus, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
} 