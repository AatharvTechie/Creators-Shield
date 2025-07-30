import { NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email-templates';

export async function GET() {
  const testData = {
    creatorName: 'Test Creator',
    suspensionTime: new Date().toLocaleString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
    deactivationTime: new Date().toLocaleString()
  };

  const templates = {
    suspend: {
      friendly: emailTemplates.suspension(testData.creatorName, testData.suspensionTime),
      professional: emailTemplates.suspension(testData.creatorName, testData.suspensionTime),
      direct: {
        subject: 'Account Suspended - 24 Hours',
        html: emailTemplates.suspension(testData.creatorName, testData.suspensionTime).html
      }
    },
    deactivate: {
      friendly: emailTemplates.deactivation(testData.creatorName, testData.deactivationTime),
      professional: emailTemplates.deactivation(testData.creatorName, testData.deactivationTime),
      direct: {
        subject: 'Account Deactivated',
        html: emailTemplates.deactivation(testData.creatorName, testData.deactivationTime).html
      }
    }
  };

  return NextResponse.json({
    success: true,
    message: 'Email dialog templates are working!',
    templates,
    testData
  });
} 