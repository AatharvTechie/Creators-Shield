'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Volume1, Settings, Speaker, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAudioNotification } from '@/hooks/use-audio-notification';

interface AudioNotificationProps {
  creatorName?: string;
  onNotification?: (type: string) => void;
  showControls?: boolean;
  className?: string;
}

export function AudioNotification({ 
  creatorName = 'Creator', 
  onNotification,
  showControls = true,
  className = ''
}: AudioNotificationProps) {
  const {
    isSupported,
    isEnabled,
    voices,
    toggleAudioNotifications,
    stopNotification,
    getPreferredVoice
  } = useAudioNotification();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (voices.length > 0) {
      setCurrentVoice(getPreferredVoice());
    }
  }, [voices, getPreferredVoice]);

  const handleToggle = () => {
    toggleAudioNotifications();
    if (onNotification) {
      onNotification(isEnabled ? 'disabled' : 'enabled');
    }
  };

  const handleStop = () => {
    stopNotification();
    setIsPlaying(false);
  };

  const handleTest = () => {
    if (!isEnabled || !isSupported) return;
    
    setIsPlaying(true);
    
    // Test notification
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `${creatorName}, this is a test notification from Creator Shield`;
    
    if (currentVoice) {
      utterance.voice = currentVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {showControls && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handleToggle}
                   className="h-8 w-8 p-0"
                 >
                   {isEnabled ? (
                     <Speaker className="h-4 w-4 text-green-500" />
                   ) : (
                     <X className="h-4 w-4 text-gray-400" />
                   )}
                 </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isEnabled ? 'Disable' : 'Enable'} audio notifications</p>
              </TooltipContent>
            </Tooltip>

            {isEnabled && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTest}
                      disabled={isPlaying}
                      className="h-8 w-8 p-0"
                    >
                      <Volume1 className={`h-4 w-4 ${isPlaying ? 'text-blue-500 animate-pulse' : 'text-blue-400'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test audio notification</p>
                  </TooltipContent>
                </Tooltip>

                {isPlaying && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStop}
                        className="h-8 w-8 p-0"
                      >
                        <VolumeX className="h-4 w-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop current notification</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-1 text-xs">
          <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-muted-foreground">
            Audio {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        {/* Disabled notice */}
        {!isEnabled && showControls && (
          <div className="text-xs text-yellow-500 mt-1">
            Click toggle to enable audio notifications
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Audio notification context for global state
export const AudioNotificationContext = React.createContext<{
  playEmailNotification: (creatorName: string) => void;
  playAdminApprovalNotification: (creatorName: string) => void;
  playAdminDenialNotification: (creatorName: string) => void;
  playDisconnectNotification: (creatorName: string) => void;
  playSystemAlertNotification: (creatorName: string, message: string) => void;
  isEnabled: boolean;
  toggleAudioNotifications: () => void;
}>({
  playEmailNotification: () => {},
  playAdminApprovalNotification: () => {},
  playAdminDenialNotification: () => {},
  playDisconnectNotification: () => {},
  playSystemAlertNotification: () => {},
  isEnabled: true,
  toggleAudioNotifications: () => {}
});

export function AudioNotificationProvider({ children }: { children: React.ReactNode }) {
  const audioNotification = useAudioNotification();

  return (
    <AudioNotificationContext.Provider value={audioNotification}>
      {children}
    </AudioNotificationContext.Provider>
  );
} 