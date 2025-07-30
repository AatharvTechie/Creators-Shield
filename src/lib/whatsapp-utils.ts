// WhatsApp integration utilities
export const WHATSAPP_NUMBER = '917042174467';

export interface WhatsAppMessageData {
  userName?: string;
  userEmail?: string;
  issue?: string;
  source?: string;
}

export function generateWhatsAppUrl(data: WhatsAppMessageData = {}): string {
  const {
    userName = '[Creator]',
    userEmail = '',
    issue = 'I need help with CreatorShield',
    source = 'Website'
  } = data;

  const message = `Hi CS Support Team,

I need help with CreatorShield.

👤 Name: ${userName}
📧 Email: ${userEmail || 'Not provided'}
🔍 Issue: ${issue}
📍 Source: ${source}

Please help me with my inquiry.`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function openWhatsAppSupport(data?: WhatsAppMessageData): void {
  const url = generateWhatsAppUrl(data);
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Function to get user data from localStorage if available
export function getUserDataForWhatsApp(): WhatsAppMessageData {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    // Try to get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        userName: parsed.name || parsed.displayName || '[Creator]',
        userEmail: parsed.email || '',
        source: 'Website'
      };
    }
  } catch (error) {
    console.log('No user data found in localStorage');
  }

  return {
    userName: '[Creator]',
    source: 'Website'
  };
} 