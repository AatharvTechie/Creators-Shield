// Voice notification service for new device alerts

export interface VoiceNotificationData {
  deviceName: string;
  browser: string;
  os: string;
  location: string;
  time: string;
  ipAddress: string;
}

export class VoiceNotificationService {
  private static instance: VoiceNotificationService;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
      this.isSupported = !!this.speechSynthesis;
    }
  }

  static getInstance(): VoiceNotificationService {
    if (!VoiceNotificationService.instance) {
      VoiceNotificationService.instance = new VoiceNotificationService();
    }
    return VoiceNotificationService.instance;
  }

  async speakNewDeviceAlert(data: VoiceNotificationData): Promise<void> {
    if (!this.isSupported || !this.speechSynthesis) {
      console.log('Speech synthesis not supported');
      return;
    }

    try {
      // Stop any existing speech
      this.speechSynthesis.cancel();

      // Create the alert message
      const message = this.createAlertMessage(data);
      
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Configure speech settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to use a female voice for alerts
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK English Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Speak the alert
      this.speechSynthesis.speak(utterance);
      
      console.log('🔊 Voice alert spoken:', message);
      
    } catch (error) {
      console.error('Error speaking voice alert:', error);
    }
  }

  private createAlertMessage(data: VoiceNotificationData): string {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `Security Alert! New device login detected. Device: ${data.deviceName}. Browser: ${data.browser}. Operating System: ${data.os}. Location: ${data.location}. Time: ${time}. If this was not you, please secure your account immediately.`;
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.speechSynthesis ? this.speechSynthesis.speaking : false;
  }
}

// Export singleton instance
export const voiceNotification = VoiceNotificationService.getInstance(); 