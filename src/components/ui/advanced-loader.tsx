'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AdvancedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'ripple' | 'orbit';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

export function AdvancedLoader({ 
  size = 'md', 
  variant = 'spinner', 
  color = 'primary',
  text,
  className 
}: AdvancedLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            colorClasses[color]
          )} />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  colorClasses[color]
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color]
          )} />
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-1 h-4 rounded-full animate-pulse',
                  colorClasses[color]
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      case 'ripple':
        return (
          <div className="relative">
            <div className={cn(
              'absolute rounded-full animate-ping',
              sizeClasses[size],
              colorClasses[color]
            )} />
            <div className={cn(
              'rounded-full',
              sizeClasses[size],
              colorClasses[color]
            )} />
          </div>
        );

      case 'orbit':
        return (
          <div className="relative">
            <div className={cn(
              'absolute rounded-full border-2 border-current border-t-transparent animate-spin',
              sizeClasses[size],
              colorClasses[color]
            )} />
            <div className={cn(
              'absolute rounded-full border-2 border-current border-b-transparent animate-spin',
              sizeClasses[size],
              colorClasses[color]
            )} 
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        );

      default:
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            colorClasses[color]
          )} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-sm font-medium animate-pulse',
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Specialized loader components
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <AdvancedLoader 
        size="xl" 
        variant="orbit" 
        color="primary"
        text="Loading..."
        className="space-y-4"
      />
    </div>
  );
}

export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <AdvancedLoader 
      size={size} 
      variant="spinner" 
      color="primary"
    />
  );
}

export function CardLoader() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <AdvancedLoader size="md" variant="pulse" color="secondary" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  );
}

export function TableLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <AdvancedLoader size="sm" variant="dots" color="secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonLoader({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export default AdvancedLoader; 