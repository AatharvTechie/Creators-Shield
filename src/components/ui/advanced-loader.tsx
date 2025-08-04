'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle, Shield, Zap, BarChart3, Activity } from 'lucide-react';

interface AdvancedLoaderProps {
  type?: 'default' | 'success' | 'error' | 'action' | 'data' | 'analytics' | 'monitoring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
  action?: string;
}

const loaderConfigs = {
  default: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  action: {
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  data: {
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  analytics: {
    icon: BarChart3,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  monitoring: {
    icon: Activity,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  }
};

const sizeConfigs = {
  sm: {
    container: 'p-3',
    icon: 'h-4 w-4',
    text: 'text-sm',
    subtext: 'text-xs'
  },
  md: {
    container: 'p-4',
    icon: 'h-5 w-5',
    text: 'text-base',
    subtext: 'text-sm'
  },
  lg: {
    container: 'p-6',
    icon: 'h-6 w-6',
    text: 'text-lg',
    subtext: 'text-base'
  },
  xl: {
    container: 'p-8',
    icon: 'h-8 w-8',
    text: 'text-xl',
    subtext: 'text-lg'
  }
};

export function AdvancedLoader({
  type = 'default',
  size = 'md',
  text,
  subtext,
  className,
  showProgress = false,
  progress = 0,
  action
}: AdvancedLoaderProps) {
  const config = loaderConfigs[type];
  const sizeConfig = sizeConfigs[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-lg border transition-all duration-300',
      config.bgColor,
      config.borderColor,
      sizeConfig.container,
      className
    )}>
      {/* Icon with animation */}
      <div className="relative mb-4">
        <Icon className={cn(
          sizeConfig.icon,
          config.color,
          type === 'default' && 'animate-spin'
        )} />
        
        {/* Success checkmark animation */}
        {type === 'success' && (
          <div className="absolute inset-0 animate-ping">
            <CheckCircle className={cn(sizeConfig.icon, 'text-green-400')} />
          </div>
        )}
      </div>

      {/* Text content */}
      {text && (
        <div className="text-center space-y-1">
          <p className={cn('font-semibold', config.color, sizeConfig.text)}>
            {text}
          </p>
          {subtext && (
            <p className={cn('text-muted-foreground', sizeConfig.subtext)}>
              {subtext}
            </p>
          )}
        </div>
      )}

      {/* Action text */}
      {action && (
        <div className="mt-2 text-center">
          <p className={cn('text-muted-foreground font-medium', sizeConfig.subtext)}>
            {action}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Loading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn('h-2 rounded-full transition-all duration-300', config.color.replace('text-', 'bg-'))}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pulsing dots for loading states */}
      {type === 'default' && !text && (
        <div className="flex space-x-1 mt-2">
          <div className={cn('w-2 h-2 rounded-full animate-pulse', config.color.replace('text-', 'bg-'))} />
          <div className={cn('w-2 h-2 rounded-full animate-pulse', config.color.replace('text-', 'bg-'))} style={{ animationDelay: '0.2s' }} />
          <div className={cn('w-2 h-2 rounded-full animate-pulse', config.color.replace('text-', 'bg-'))} style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}

// Specialized loader components
export function DataLoader({ size = 'md', text = 'Loading data...', ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="data" size={size} text={text} {...props} />;
}

export function AnalyticsLoader({ size = 'md', text = 'Loading analytics...', ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="analytics" size={size} text={text} {...props} />;
}

export function MonitoringLoader({ size = 'md', text = 'Loading monitoring data...', ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="monitoring" size={size} text={text} {...props} />;
}

export function ActionLoader({ size = 'md', text = 'Processing...', action, ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="action" size={size} text={text} action={action} {...props} />;
}

export function SuccessLoader({ size = 'md', text = 'Success!', ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="success" size={size} text={text} {...props} />;
}

export function ErrorLoader({ size = 'md', text = 'Error occurred', ...props }: Omit<AdvancedLoaderProps, 'type'>) {
  return <AdvancedLoader type="error" size={size} text={text} {...props} />;
} 