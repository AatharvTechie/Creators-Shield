import { sendCreatorNotification } from './email-service';
import { emailTemplates } from './email-templates';

// Comprehensive email notification service
export class ComprehensiveEmailService {
  
  // Admin Actions
  static async sendMarkAsReadNotification(creatorEmail: string, creatorName: string, feedbackTitle: string, readTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'mark-as-read',
        readTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send mark as read notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendSuspendNotification(creatorEmail: string, creatorName: string, suspensionTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'suspend',
        suspensionTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send suspend notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendDeactivateNotification(creatorEmail: string, creatorName: string, deactivationTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'deactivate',
        deactivationTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send deactivate notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendDisconnectApproveNotification(creatorEmail: string, creatorName: string, approvalTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'disconnect-approved',
        approvalTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send disconnect approve notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendDisconnectDenyNotification(creatorEmail: string, creatorName: string, denialTime: string, reason: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'disconnect-denied',
        denialTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send disconnect deny notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendReactivationApproveNotification(creatorEmail: string, creatorName: string, approvalTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'reactivation-approved',
        approvalTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send reactivation approve notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendReactivationDenyNotification(creatorEmail: string, creatorName: string, denialTime: string, reason: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'reactivation-rejected',
        denialTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send reactivation deny notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Platform Actions
  static async sendPlatformConnectNotification(creatorEmail: string, creatorName: string, platform: string, connectTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'platform-connected',
        connectTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send platform connect notification:', error);
      return { success: false, error: error.message };
    }
  }

  // 2FA Actions
  static async send2FASetupNotification(creatorEmail: string, creatorName: string, setupTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        '2fa-setup',
        setupTime
      );
      
      if (result.success) {
        // Voice notification removed - future implementation
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send 2FA setup notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Device Login Actions
  static async sendNewDeviceLoginNotification(creatorEmail: string, creatorName: string, deviceInfo: string, loginTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'new-device-login',
        loginTime
      );
      
      if (result.success) {
        await voiceNotification.playAlertNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send new device login notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscription Actions
  static async sendSubscriptionNotification(creatorEmail: string, creatorName: string, planName: string, subscriptionTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'subscription-activated',
        subscriptionTime
      );
      
      if (result.success) {
        await voiceNotification.playSuccessNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send subscription notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Copyright Match Actions
  static async sendCopyrightMatchNotification(creatorEmail: string, creatorName: string, matchDetails: any, matchTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'copyright-match',
        matchTime
      );
      
      if (result.success) {
        await voiceNotification.playAlertNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send copyright match notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Weekly Reports
  static async sendWeeklyReportNotification(creatorEmail: string, creatorName: string, reportData: any, reportTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'weekly-report',
        reportTime
      );
      
      if (result.success) {
        await voiceNotification.playEmailNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send weekly report notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Promotional Emails
  static async sendPromotionalEmail(creatorEmail: string, creatorName: string, promotionType: string, promotionTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'promotional',
        promotionTime
      );
      
      if (result.success) {
        await voiceNotification.playEmailNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send promotional email:', error);
      return { success: false, error: error.message };
    }
  }

  // Feature Updates
  static async sendFeatureUpdateNotification(creatorEmail: string, creatorName: string, featureName: string, updateTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'feature-update',
        updateTime
      );
      
      if (result.success) {
        await voiceNotification.playEmailNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send feature update notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Account Actions
  static async sendAccountDeactivationNotification(creatorEmail: string, creatorName: string, deactivationTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'deactivate',
        deactivationTime
      );
      
      if (result.success) {
        await voiceNotification.playAlertNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send account deactivation notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendAccountReactivationNotification(creatorEmail: string, creatorName: string, reactivationTime: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'lift-suspension',
        reactivationTime
      );
      
      if (result.success) {
        await voiceNotification.playSuccessNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send account reactivation notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome Email
  static async sendWelcomeEmail(creatorEmail: string, creatorName: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'welcome',
        new Date().toLocaleString()
      );
      
      if (result.success) {
        await voiceNotification.playSuccessNotification();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email with voice notification
  static async testEmailWithVoice(creatorEmail: string, creatorName: string) {
    try {
      const result = await sendCreatorNotification(
        creatorEmail,
        creatorName,
        'test',
        new Date().toLocaleString()
      );
      
      if (result.success) {
        await voiceNotification.testSound();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error: error.message };
    }
  }
} 