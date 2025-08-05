'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('creator_jwt');
    }
    return null;
  };

  const debugSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('No token found in localStorage');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/debug-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSessionInfo(data);
      } else {
        setError(data.error || 'Failed to debug session');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cleanupSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('No token found in localStorage');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/cleanup-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSessionInfo({ ...sessionInfo, cleanupResult: data });
      } else {
        setError(data.error || 'Failed to cleanup sessions');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('No token found in localStorage');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/check-session-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSessionInfo({ ...sessionInfo, statusCheck: data });
      } else {
        setError(data.message || 'Session check failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Session Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={debugSession} disabled={loading}>
              {loading ? 'Loading...' : 'Debug Session'}
            </Button>
            <Button onClick={cleanupSessions} disabled={loading} variant="outline">
              {loading ? 'Cleaning...' : 'Cleanup Sessions'}
            </Button>
            <Button onClick={checkSessionStatus} disabled={loading} variant="outline">
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>

          {error && (
            <Alert>
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {sessionInfo && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Session Information</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 