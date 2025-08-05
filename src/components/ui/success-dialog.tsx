'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

interface SuccessDialogProps {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
}

export function SuccessDialog({ isOpen, message, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Success</DialogTitle>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">
            Success!
          </h3>
          <p className="text-gray-600 text-center">
            {message}
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 