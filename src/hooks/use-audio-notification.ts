'use client';

import { useCallback, useEffect, useState } from 'react';

interface AudioNotificationOptions {
  enabled?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface NotificationData {
  creatorName: string;
  action: string;
  message?: string;
}

export function useAudioNotification(options: AudioNotificationOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      setIsSupported(true);

      // Load voices
      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
      };

      // Handle voice loading
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  // Get preferred voice (English, female if available)
  const getPreferredVoice = useCallback(() => {
    if (!voices.length) return null;
    
    // Try to find a female English voice
    const femaleVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      voice.name.toLowerCase().includes('female')
    );
    
    if (femaleVoice) return femaleVoice;
    
    // Fallback to any English voice
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en')
    );
    
    return englishVoice || voices[0];
  }, [voices]);

  // Play notification sound
  const playNotification = useCallback(async (data: NotificationData) => {
    if (!isSupported || !isEnabled || !speechSynthesis) {
      return;
    }

    // Check if user is on the dashboard (active tab)
    if (document.hidden) {
      return; // Don't play if tab is not active
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance();
    
    // Set voice
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Configure speech parameters
    utterance.text = `${data.creatorName}, you have received a new notification from Creator Shield`;
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 0.8;

    // Add action-specific message if provided
    if (data.message) {
      utterance.text += `. ${data.message}`;
    }

    // Play the notification
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing audio notification:', error);
    }
  }, [isSupported, isEnabled, speechSynthesis, getPreferredVoice, options]);

  // Play different types of notifications
  const playEmailNotification = useCallback((creatorName: string) => {
    playNotification({
      creatorName,
      action: 'email_sent',
      message: 'An important email has been sent to your account.'
    });
  }, [playNotification]);

  const playAdminApprovalNotification = useCallback((creatorName: string) => {
    playNotification({
      creatorName,
      action: 'admin_approval',
      message: 'Your request has been approved by the admin team.'
    });
  }, [playNotification]);

  const playAdminDenialNotification = useCallback((creatorName: string) => {
    playNotification({
      creatorName,
      action: 'admin_denial',
      message: 'Your request has been reviewed by the admin team.'
    });
  }, [playNotification]);

  const playDisconnectNotification = useCallback((creatorName: string) => {
    playNotification({
      creatorName,
      action: 'disconnect',
      message: 'Your channel has been disconnected from the system.'
    });
  }, [playNotification]);

  const playSystemAlertNotification = useCallback((creatorName: string, alertMessage: string) => {
    playNotification({
      creatorName,
      action: 'system_alert',
      message: alertMessage
    });
  }, [playNotification]);

  // Toggle audio notifications
  const toggleAudioNotifications = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  // Stop current notification
  const stopNotification = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  }, [speechSynthesis]);

  return {
    isSupported,
    isEnabled,
    voices,
    playNotification,
    playEmailNotification,
    playAdminApprovalNotification,
    playAdminDenialNotification,
    playDisconnectNotification,
    playSystemAlertNotification,
    toggleAudioNotifications,
    stopNotification,
    getPreferredVoice
  };
} 