import { NextResponse } from 'next/server';
import { checkEmailConfiguration } from '@/lib/email-config-checker';

export async function GET() {
  const config = checkEmailConfiguration();
  
  return NextResponse.json({
    isConfigured: config.isConfigured,
    missingFields: config.missingFields,
    hasBrevoUsername: !!config.brevoUsername,
    hasBrevoPassword: !!config.brevoPassword,
    hasSenderEmail: !!config.senderEmail,
    message: config.isConfigured 
      ? 'Email configuration looks good!' 
      : `Missing configuration: ${config.missingFields.join(', ')}`
  });
} 