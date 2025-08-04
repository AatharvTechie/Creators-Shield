// Location service for device location detection

export interface LocationData {
  city: string;
  country: string;
  region: string;
  ip: string;
}

export async function getLocationFromIP(ipAddress: string): Promise<LocationData> {
  try {
    // Skip for localhost or private IPs
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return {
        city: 'Local Network',
        country: 'Unknown',
        region: 'Unknown',
        ip: ipAddress
      };
    }

    // Use ipapi.co for location detection
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || 'Location detection failed');
    }

    return {
      city: data.city || 'Unknown',
      country: data.country_name || 'Unknown',
      region: data.region || 'Unknown',
      ip: ipAddress
    };

  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      ip: ipAddress
    };
  }
}

export function formatLocation(location: LocationData): string {
  if (location.city === 'Local Network') {
    return 'Local Network';
  }
  
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
} 