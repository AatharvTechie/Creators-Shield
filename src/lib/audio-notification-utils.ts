// Utility functions for triggering audio notifications
// These can be used from API routes and server-side functions

export interface AudioNotificationData {
  creatorName: string;
  action: 'email_sent' | 'admin_approval' | 'admin_denial' | 'disconnect' | 'system_alert';
  message?: string;
}

// Store pending notifications that will be triggered when the client loads
const pendingNotifications: AudioNotificationData[] = [];

export function addPendingNotification(notification: AudioNotificationData) {
  pendingNotifications.push(notification);
}

export function getPendingNotifications(): AudioNotificationData[] {
  const notifications = [...pendingNotifications];
  pendingNotifications.length = 0; // Clear the array
  return notifications;
}

export function triggerEmailNotification(creatorName: string) {
  addPendingNotification({
    creatorName,
    action: 'email_sent',
    message: 'An important email has been sent to your account.'
  });
}

export function triggerAdminApprovalNotification(creatorName: string) {
  addPendingNotification({
    creatorName,
    action: 'admin_approval',
    message: 'Your request has been approved by the admin team.'
  });
}

export function triggerAdminDenialNotification(creatorName: string) {
  addPendingNotification({
    creatorName,
    action: 'admin_denial',
    message: 'Your request has been reviewed by the admin team.'
  });
}

export function triggerDisconnectNotification(creatorName: string) {
  addPendingNotification({
    creatorName,
    action: 'disconnect',
    message: 'Your channel has been disconnected from the system.'
  });
}

export function triggerSystemAlertNotification(creatorName: string, alertMessage: string) {
  addPendingNotification({
    creatorName,
    action: 'system_alert',
    message: alertMessage
  });
}

// Client-side function to check and play pending notifications
export function checkAndPlayPendingNotifications() {
  if (typeof window === 'undefined') return;
  
  const notifications = getPendingNotifications();
  if (notifications.length === 0) return;
  
  // Import the hook dynamically
  import('@/hooks/use-audio-notification').then(({ useAudioNotification }) => {
    const { playNotification } = useAudioNotification();
    
    notifications.forEach(notification => {
      playNotification(notification);
    });
  });
} 