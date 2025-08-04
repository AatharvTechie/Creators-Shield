import { useEffect } from 'react';

// Hook to handle email notifications on client side
export function useEmailNotification() {
  
  // Function to trigger email notification (placeholder for future implementation)
  const triggerEmailNotification = async (action: string) => {
    console.log('Email notification triggered:', action);
    // Future implementation for email notifications
  };

  // Function to trigger notification for specific actions
  const notifyEmailSent = {
    suspend: () => triggerEmailNotification('suspend'),
    deactivate: () => triggerEmailNotification('deactivate'),
    liftSuspension: () => triggerEmailNotification('success'),
    reactivationApproved: () => triggerEmailNotification('approved'),
    reactivationRejected: () => triggerEmailNotification('rejected'),
    markAsRead: () => triggerEmailNotification('email'),
    disconnectApproved: () => triggerEmailNotification('approved'),
    disconnectDenied: () => triggerEmailNotification('denied'),
    platformConnected: () => triggerEmailNotification('connected'),
    twoFASetup: () => triggerEmailNotification('success'),
    newDeviceLogin: () => triggerEmailNotification('device'),
    subscriptionActivated: () => triggerEmailNotification('activated'),
    copyrightMatch: () => triggerEmailNotification('match'),
    weeklyReport: () => triggerEmailNotification('email'),
    promotional: () => triggerEmailNotification('email'),
    featureUpdate: () => triggerEmailNotification('email'),
    welcome: () => triggerEmailNotification('success'),
    test: () => triggerEmailNotification('test')
  };

  return { triggerEmailNotification, notifyEmailSent };
}

// Global notification trigger function
export const triggerGlobalEmailNotification = (action: string) => {
  const { triggerEmailNotification } = useEmailNotification();
  triggerEmailNotification(action);
}; 