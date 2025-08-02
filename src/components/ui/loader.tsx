import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Zap, Shield, Rocket, Brain, Sparkles } from 'lucide-react';

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

interface InteractiveLoaderProps {
  show: boolean;
  messages?: string[];
  type?: 'default' | 'success' | 'error' | 'processing';
  progress?: number;
  showProgress?: boolean;
}

export function InteractiveLoader({ 
  show, 
  messages = ['Initializing...', 'Loading data...', 'Almost ready...'], 
  type = 'default',
  progress,
  showProgress = false
}: InteractiveLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!show) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [show, messages.length]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />;
      case 'processing':
        return <Zap className="h-8 w-8 text-yellow-500 animate-bounce" />;
      default:
  return (
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-100 animate-ping"></div>
          </div>
        );
    }
  };

  const getBackgroundGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20';
      case 'error':
        return 'from-red-500/20 to-pink-500/20';
      case 'processing':
        return 'from-yellow-500/20 to-orange-500/20';
      default:
        return 'from-blue-500/20 to-purple-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 overflow-hidden`}>
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} opacity-50`}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Main icon */}
          <div className="mb-6">
            {getIcon()}
          </div>

          {/* Progress bar */}
          {showProgress && progress !== undefined && (
            <div className="w-full mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">{Math.round(progress)}% Complete</p>
            </div>
          )}

          {/* Dynamic message */}
          <div className="text-center mb-4">
            <p className={`text-sm text-gray-600 dark:text-gray-300 font-medium transition-all duration-500 ${
              isAnimating ? 'scale-105 opacity-80' : 'scale-100 opacity-100'
            }`}>
              {messages[currentMessageIndex]}
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentMessageIndex % 3 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>

          {/* Status indicators */}
          <div className="flex items-center space-x-4 mt-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Rocket className="w-3 h-3" />
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Smart</span>
            </div>
          </div>

          {/* Sparkle effects */}
          <div className="absolute top-4 right-4">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced loader with multiple stages
interface MultiStageLoaderProps {
  show: boolean;
  stages: Array<{
    message: string;
    icon: React.ReactNode;
    duration: number;
  }>;
  onComplete?: () => void;
}

export function MultiStageLoader({ show, stages, onComplete }: MultiStageLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStage < stages.length - 1) {
            setCurrentStage(prev => prev + 1);
            return 0;
          } else {
            onComplete?.();
            return 100;
          }
        }
        return prev + 2;
      });
    }, stages[currentStage]?.duration || 50);

    return () => clearInterval(interval);
  }, [show, currentStage, stages, onComplete]);

  if (!show) return null;

  const currentStageData = stages[currentStage];
  const overallProgress = ((currentStage + progress / 100) / stages.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Stage icon */}
          <div className="mb-6 text-blue-500">
            {currentStageData?.icon}
          </div>

          {/* Overall progress */}
          <div className="w-full mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Stage {currentStage + 1} of {stages.length} - {Math.round(overallProgress)}% Complete
            </p>
          </div>

          {/* Current stage message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-4">
            {currentStageData?.message}
          </p>

          {/* Stage indicators */}
          <div className="flex space-x-2">
            {stages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStage 
                    ? 'bg-green-500' 
                    : index === currentStage 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 