// Device information parsing utilities

export interface DeviceInfo {
  device: string;
  browser: string;
  os: string;
  userAgent: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Browser detection with version
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+)/);
    if (match) browser += ` ${match[1]}`;
  }
  else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+)/);
    if (match) browser += ` ${match[1]}`;
  }
  else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+)/);
    if (match) browser += ` ${match[1]}`;
  }
  else if (ua.includes('edge')) {
    browser = 'Edge';
    const match = ua.match(/edge\/(\d+)/);
    if (match) browser += ` ${match[1]}`;
  }
  else if (ua.includes('opera')) {
    browser = 'Opera';
    const match = ua.match(/opera\/(\d+)/);
    if (match) browser += ` ${match[1]}`;
  }
  
  // OS detection with version
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) os += ' 10';
    else if (ua.includes('windows nt 6.3')) os += ' 8.1';
    else if (ua.includes('windows nt 6.2')) os += ' 8';
    else if (ua.includes('windows nt 6.1')) os += ' 7';
  }
  else if (ua.includes('mac')) {
    os = 'macOS';
    const match = ua.match(/mac os x (\d+_\d+)/);
    if (match) os += ` ${match[1].replace('_', '.')}`;
  }
  else if (ua.includes('linux')) {
    os = 'Linux';
    if (ua.includes('ubuntu')) os += ' Ubuntu';
    else if (ua.includes('fedora')) os += ' Fedora';
    else if (ua.includes('debian')) os += ' Debian';
  }
  else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android (\d+\.\d+)/);
    if (match) os += ` ${match[1]}`;
  }
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os (\d+_\d+)/);
    if (match) os += ` ${match[1].replace('_', '.')}`;
  }
  
  // Device type detection with more specific names
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
  
  // More specific device names with unique identifiers
  if (ua.includes('iphone')) {
    device = 'iPhone';
    const match = ua.match(/iphone\s+os\s+(\d+_\d+)/);
    if (match) device += ` (iOS ${match[1].replace('_', '.')})`;
  }
  else if (ua.includes('ipad')) {
    device = 'iPad';
    const match = ua.match(/os\s+(\d+_\d+)/);
    if (match) device += ` (iOS ${match[1].replace('_', '.')})`;
  }
  else if (ua.includes('android')) {
    if (ua.includes('mobile')) {
      device = 'Android Mobile';
      const match = ua.match(/android (\d+\.\d+)/);
      if (match) device += ` (Android ${match[1]})`;
    } else {
      device = 'Android Tablet';
      const match = ua.match(/android (\d+\.\d+)/);
      if (match) device += ` (Android ${match[1]})`;
    }
  }
  else if (ua.includes('windows')) {
    device = 'Windows PC';
    if (ua.includes('windows nt 10.0')) device += ' (Windows 10)';
    else if (ua.includes('windows nt 6.3')) device += ' (Windows 8.1)';
    else if (ua.includes('windows nt 6.2')) device += ' (Windows 8)';
    else if (ua.includes('windows nt 6.1')) device += ' (Windows 7)';
  }
  else if (ua.includes('mac')) {
    device = 'Mac';
    const match = ua.match(/mac os x (\d+_\d+)/);
    if (match) device += ` (macOS ${match[1].replace('_', '.')})`;
  }
  else if (ua.includes('linux')) {
    device = 'Linux PC';
    if (ua.includes('ubuntu')) device += ' (Ubuntu)';
    else if (ua.includes('fedora')) device += ' (Fedora)';
    else if (ua.includes('debian')) device += ' (Debian)';
  }
  
  return {
    device,
    browser,
    os,
    userAgent
  };
}

export function getClientIP(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'Unknown';
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isCurrentSession(sessionId: string, currentSessionId?: string): boolean {
  return sessionId === currentSessionId;
} 