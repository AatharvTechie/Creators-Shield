'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface SecureAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecureAccountDialog({ isOpen, onClose }: SecureAccountDialogProps) {
  const [step, setStep] = useState<'initial' | 'verification' | 'success'>('initial');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();

  const handleStartPasswordChange = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Send verification code to email
      const codeResponse = await fetch('/api/auth/send-password-reset-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email
        })
      });

      if (codeResponse.ok) {
        setStep('verification');
      } else {
        const errorData = await codeResponse.json();
        setError(errorData.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email) {
      setError('Email not found');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('creator_jwt')}`
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
          verificationCode: verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setSuccess('Password changed successfully! You will be logged out.');
        
        // Logout after 3 seconds
        setTimeout(() => {
          localStorage.removeItem('creator_jwt');
          localStorage.removeItem('user_email');
          window.location.href = '/auth/login';
        }, 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('initial');
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setError('');
    setSuccess('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const renderInitialStep = () => (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-sm font-medium text-red-300">Security Alert</span>
        </div>
        <p className="text-sm text-red-200">
          If you suspect unauthorized access to your account, changing your password will secure your account and log out all active sessions.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="pr-10"
          />
        </div>

        <Button 
          onClick={handleStartPasswordChange}
          disabled={!email || loading}
          className="w-full"
        >
          {loading ? 'Sending Code...' : 'Send Verification Code'}
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Verification Code Sent</span>
        </div>
        <p className="text-sm text-blue-200">
          We've sent a 6-digit verification code to your email address. Please check your inbox and enter the code below.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <div>
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleVerifyCode}
          disabled={!verificationCode || !newPassword || !confirmPassword || loading}
          className="w-full"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Password Changed Successfully</span>
        </div>
        <p className="text-sm text-green-200">
          Your password has been updated and all active sessions have been logged out for security.
        </p>
      </div>
      
      <p className="text-sm text-muted-foreground">
        You will be redirected to the login page in a few seconds...
      </p>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'initial':
        return renderInitialStep();
      case 'verification':
        return renderVerificationStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderInitialStep();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'initial':
        return 'Secure Your Account';
      case 'verification':
        return 'Verify Your Identity';
      case 'success':
        return 'Password Changed';
      default:
        return 'Secure Your Account';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{getStepTitle()}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {step === 'initial' && 'Change your password to secure your account'}
                {step === 'verification' && 'Enter the verification code sent to your email'}
                {step === 'success' && 'Your account is now secure'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-sm text-green-200">{success}</p>
          </div>
        )}

        {getStepContent()}

        {step !== 'success' && (
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {step === 'verification' && (
              <Button 
                variant="outline"
                onClick={() => setStep('initial')}
                className="flex-1"
              >
                Back
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 