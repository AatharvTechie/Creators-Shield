export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
  timestamp: Date;
  fingerprint: string;
}

export interface DeviceSession {
  userEmail: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  isConfirmed: boolean;
}

/**
 * Get device fingerprint based on multiple parameters
 */
export function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Create unique fingerprint based on multiple factors
  const fingerprintData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    canvasFingerprint: ctx ? ctx.getImageData(0, 0, 1, 1).data.toString() : '',
    webglVendor: getWebGLVendor(),
    webglRenderer: getWebGLRenderer()
  };

  // Create hash from fingerprint data
  const fingerprintString = JSON.stringify(fingerprintData);
  return btoa(fingerprintString).slice(0, 32); // Base64 encode and truncate
}

/**
 * Get WebGL vendor information
 */
function getWebGLVendor(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    }
  } catch (e) {
    return 'unknown';
  }
  return 'unknown';
}

/**
 * Get WebGL renderer information
 */
function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    }
  } catch (e) {
    return 'unknown';
  }
  return 'unknown';
}

/**
 * Get device name based on user agent
 */
export function getDeviceName(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) {
    if (userAgent.includes('Mobile')) return 'Android Phone';
    return 'Android Tablet';
  }
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

/**
 * Get browser information
 */
export function getBrowserInfo(userAgent: string): { browser: string; version: string } {
  let browser = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    const match = userAgent.match(/Edge\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes('Opera')) {
    browser = 'Opera';
    const match = userAgent.match(/Opera\/(\d+\.\d+)/);
    if (match) version = match[1];
  }

  return { browser, version };
}

/**
 * Get OS information
 */
export function getOSInfo(userAgent: string): { os: string; version: string } {
  let os = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Windows')) {
    os = 'Windows';
    if (userAgent.includes('Windows NT 10.0')) version = '10';
    else if (userAgent.includes('Windows NT 6.3')) version = '8.1';
    else if (userAgent.includes('Windows NT 6.2')) version = '8';
    else if (userAgent.includes('Windows NT 6.1')) version = '7';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+_\d+)/);
    if (match) version = match[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
    if (userAgent.includes('Ubuntu')) version = 'Ubuntu';
    else if (userAgent.includes('Fedora')) version = 'Fedora';
    else if (userAgent.includes('Debian')) version = 'Debian';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    const match = userAgent.match(/Android (\d+\.\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes('iOS')) {
    os = 'iOS';
    const match = userAgent.match(/OS (\d+_\d+)/);
    if (match) version = match[1].replace('_', '.');
  }

  return { os, version };
}

/**
 * Get public IP address
 */
export async function getPublicIP(): Promise<string> {
  try {
    // Try multiple IP services with timeout
    const timeout = 5000; // 5 seconds timeout
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch('https://api64.ipify.org?format=json', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.ip;
    } catch (primaryError) {
      console.warn('Primary IP service failed, trying fallback...');
      
      // Fallback to a different service
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.ip;
      } catch (fallbackError) {
        console.warn('Fallback IP service also failed');
        return 'unknown';
      }
    }
  } catch (error) {
    console.error('Failed to get public IP:', error);
    return 'unknown';
  }
}

/**
 * Get location from IP (placeholder - can be enhanced with geolocation API)
 */
export async function getLocationFromIP(ip: string): Promise<string> {
  try {
    // Skip location lookup if IP is unknown or local
    if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local Network';
    }

    // Try multiple IP geolocation services with timeout
    const timeout = 5000; // 5 seconds timeout
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    } catch (fetchError) {
      console.warn('Primary IP geolocation service failed, trying fallback...');
      
      // Fallback to a different service
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`https://ipinfo.io/${ip}/json`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return `${data.city || 'Unknown'}, ${data.country || 'Unknown'}`;
      } catch (fallbackError) {
        console.warn('Fallback IP geolocation service also failed');
        return 'Unknown Location';
      }
    }
  } catch (error) {
    console.error('Failed to get location:', error);
    return 'Unknown Location';
  }
}

/**
 * Generate comprehensive device info
 */
export async function generateDeviceInfo(): Promise<DeviceInfo> {
  try {
    const userAgent = navigator.userAgent;
    const fingerprint = getDeviceFingerprint();
    
    // Get IP address with error handling
    let ipAddress = 'unknown';
    try {
      ipAddress = await getPublicIP();
    } catch (error) {
      console.warn('Failed to get IP address:', error);
    }
    
    // Get location with error handling
    let location = 'Unknown Location';
    try {
      location = await getLocationFromIP(ipAddress);
    } catch (error) {
      console.warn('Failed to get location:', error);
    }
    
    const { browser, version: browserVersion } = getBrowserInfo(userAgent);
    const { os, version: osVersion } = getOSInfo(userAgent);
    
    return {
      deviceId: fingerprint,
      deviceName: getDeviceName(userAgent),
      browser,
      browserVersion,
      os,
      osVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      userAgent,
      ipAddress,
      location,
      timestamp: new Date(),
      fingerprint
    };
  } catch (error) {
    console.error('Error generating device info:', error);
    
    // Return fallback device info
    const userAgent = navigator.userAgent;
    const fingerprint = getDeviceFingerprint();
    
    return {
      deviceId: fingerprint,
      deviceName: getDeviceName(userAgent),
      browser: 'Unknown',
      browserVersion: 'Unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      userAgent,
      ipAddress: 'unknown',
      location: 'Unknown Location',
      timestamp: new Date(),
      fingerprint
    };
  }
}

/**
 * Check if device is new by comparing with stored devices
 */
export async function isNewDevice(userEmail: string, deviceInfo: DeviceInfo): Promise<boolean> {
  try {
    const token = localStorage.getItem('creator_jwt');
    if (!token) {
      console.warn('No JWT token found, skipping device check');
      return false;
    }

    const response = await fetch('/api/auth/check-device-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userEmail,
        deviceInfo
      })
    });

    if (!response.ok) {
      console.warn('Device check failed:', response.status);
      return false; // Don't assume new device on API failure
    }

    const data = await response.json();
    return data.isNewDevice || false;
  } catch (error) {
    console.error('Error checking device:', error);
    return false; // Don't assume new device if check fails
  }
}

/**
 * Save device session to database
 */
export async function saveDeviceSession(userEmail: string, deviceInfo: DeviceInfo): Promise<void> {
  try {
    const token = localStorage.getItem('creator_jwt');
    if (!token) {
      console.warn('No JWT token found, skipping device session save');
      return;
    }

    const response = await fetch('/api/auth/save-device-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userEmail,
        deviceInfo
      })
    });

    if (!response.ok) {
      console.warn('Failed to save device session:', response.status);
    }
  } catch (error) {
    console.error('Error saving device session:', error);
  }
}

/**
 * Send login alert via email
 */
export async function sendLoginAlert(userEmail: string, deviceInfo: DeviceInfo): Promise<void> {
  try {
    const token = localStorage.getItem('creator_jwt');
    if (!token) {
      console.warn('No JWT token found, skipping login alert');
      return;
    }

    const response = await fetch('/api/auth/send-login-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userEmail,
        deviceInfo
      })
    });

    if (!response.ok) {
      console.warn('Failed to send login alert:', response.status);
    }
  } catch (error) {
    console.error('Error sending login alert:', error);
  }
}

/**
 * Trigger Web Speech API notification
 */
export function speakNotification(message: string): void {
  if ('speechSynthesis' in window) {
    // Stop any existing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Main device detection function
 */
export async function detectNewDevice(userEmail: string): Promise<{
  isNewDevice: boolean;
  deviceInfo: DeviceInfo | null;
  shouldAlert: boolean;
}> {
  try {
    // Check if user is logged in
    const token = localStorage.getItem('creator_jwt');
    if (!token) {
      console.warn('No JWT token found, skipping device detection');
      return {
        isNewDevice: false,
        deviceInfo: null,
        shouldAlert: false
      };
    }

    const deviceInfo = await generateDeviceInfo();
    const isNew = await isNewDevice(userEmail, deviceInfo);
    
    if (isNew) {
      try {
        // Save the new device session
        await saveDeviceSession(userEmail, deviceInfo);
        
        // Send alerts
        await sendLoginAlert(userEmail, deviceInfo);
        // Voice alert is now handled by the hook for better timing control
        
        return {
          isNewDevice: true,
          deviceInfo,
          shouldAlert: true
        };
      } catch (alertError) {
        console.error('Error sending alerts:', alertError);
        // Still return new device info even if alerts fail
        return {
          isNewDevice: true,
          deviceInfo,
          shouldAlert: false
        };
      }
    }
    
    return {
      isNewDevice: false,
      deviceInfo: null,
      shouldAlert: false
    };
  } catch (error) {
    console.error('Device detection error:', error);
    
    // Return safe fallback - don't trigger alerts on error
    return {
      isNewDevice: false,
      deviceInfo: null,
      shouldAlert: false
    };
  }
} 