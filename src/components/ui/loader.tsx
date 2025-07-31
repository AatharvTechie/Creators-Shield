import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loader({ message = 'Loading...', size = 'md', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      {message && (
        <p className="mt-2 text-sm text-gray-500 text-center">{message}</p>
      )}
    </div>
  );
}

export function FullScreenLoader({ message = 'Loading your dashboard...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <Loader message={message} size="lg" />
      </div>
    </div>
  );
}

export function AutoConnectLoader({ message = 'Connecting your channel...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
            {message}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            This may take a few moments...
          </p>
        </div>
      </div>
    </div>
  );
} 