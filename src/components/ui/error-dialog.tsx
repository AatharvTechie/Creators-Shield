'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface ErrorDialogProps {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
}

export function ErrorDialog({ isOpen, message, onClose }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Error</DialogTitle>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">
            Error
          </h3>
          <p className="text-gray-600 text-center mb-4">
            {message}
          </p>
          <Button 
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 