'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface LoadingDialogProps {
  isOpen: boolean;
  message: string;
  onComplete?: () => void;
}

export function LoadingDialog({ isOpen, message, onComplete }: LoadingDialogProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Loading</DialogTitle>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">
            {message}
          </h3>
          <p className="text-gray-600 text-center">
            Please wait while we process your request{dots}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 