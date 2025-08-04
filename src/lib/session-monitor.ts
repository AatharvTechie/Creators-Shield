// Session monitoring system for detecting device logouts

export interface SessionMonitorConfig {
  checkInterval: number; // milliseconds
  userEmail: string;
  currentSessionId: string;
}

export class SessionMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private config: SessionMonitorConfig;
  private onLogout: (deviceInfo: any) => void;

  constructor(config: SessionMonitorConfig, onLogout: (deviceInfo: any) => void) {
    this.config = config;
    this.onLogout = onLogout;
  }

  start() {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      await this.checkSession();
    }, this.config.checkInterval);

    console.log('🔍 Session monitor started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🔍 Session monitor stopped');
    }
  }

  getConfig() {
    return this.config;
  }

  private async checkSession() {
    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) {
        console.log('🔍 No token found for session check');
        return;
      }

      const response = await fetch(`/api/settings/devices?email=${encodeURIComponent(this.config.userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('🔍 Session check failed:', response.status);
        // Don't logout on network errors, just log them
        return;
      }

      const data = await response.json();
      const currentSession = data.devices?.find((device: any) => device.id === this.config.currentSessionId);

      if (!currentSession) {
        console.log('🔍 Current session not found - device may have been logged out');
        this.onLogout({
          device: 'Current Device',
          browser: 'Unknown',
          os: 'Unknown',
          location: 'Unknown',
          ipAddress: 'Unknown'
        });
        this.stop();
      }
    } catch (error) {
      console.error('🔍 Session check error:', error);
      // Don't logout on network errors, just log them
    }
  }
}

// Global session monitor instance
let globalSessionMonitor: SessionMonitor | null = null;

export function startSessionMonitoring(config: SessionMonitorConfig, onLogout: (deviceInfo: any) => void) {
  // Check if we already have a session monitor with the same config
  if (globalSessionMonitor) {
    // Only restart if the config has changed
    const currentConfig = globalSessionMonitor.getConfig();
    if (currentConfig.userEmail === config.userEmail && 
        currentConfig.currentSessionId === config.currentSessionId) {
      console.log('🔍 Session monitor already running with same config, skipping...');
      return;
    }
    globalSessionMonitor.stop();
  }

  globalSessionMonitor = new SessionMonitor(config, onLogout);
  globalSessionMonitor.start();
}

export function stopSessionMonitoring() {
  if (globalSessionMonitor) {
    globalSessionMonitor.stop();
    globalSessionMonitor = null;
  }
} 