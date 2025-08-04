# Audio Notification System

## Overview

The CreatorShield audio notification system provides voice alerts for important actions and events using the Web Speech API. This system ensures creators are immediately notified of critical events even when they're not actively monitoring the dashboard.

## Features

### ✅ **Core Functionality**
- **Voice Synthesis**: Uses Web Speech API for natural voice notifications
- **Smart Detection**: Only plays when user is on active tab (respects autoplay rules)
- **Multiple Notification Types**: Email, admin actions, disconnections, system alerts
- **Customizable**: Voice selection, speed, pitch, and volume controls
- **Global Integration**: Works across all dashboard pages and API routes

### ✅ **Notification Types**
1. **Email Notifications**: When important emails are sent
2. **Admin Actions**: Approve/deny/disconnect notifications
3. **System Alerts**: Maintenance, security, and general system notifications
4. **Device Login**: New device login alerts
5. **Custom Alerts**: Any custom notification with specific messages

## Implementation

### 1. Core Hook (`use-audio-notification.ts`)

```typescript
import { useAudioNotification } from '@/hooks/use-audio-notification';

const {
  isSupported,
  isEnabled,
  playEmailNotification,
  playAdminApprovalNotification,
  playSystemAlertNotification,
  toggleAudioNotifications
} = useAudioNotification();
```

### 2. Audio Notification Component

```typescript
import { AudioNotification } from '@/components/ui/audio-notification';

<AudioNotification 
  creatorName="John Doe"
  showControls={true}
  onNotification={(type) => console.log('Notification:', type)}
/>
```

### 3. Global Provider Integration

The system is integrated into the app's provider hierarchy:

```typescript
// In providers.tsx
<AudioNotificationProvider>
  {children}
</AudioNotificationProvider>
```

## Usage Examples

### Triggering Notifications from API Routes

```typescript
import { triggerEmailNotification } from '@/lib/audio-notification-utils';

// In your API route
export async function POST(req: NextRequest) {
  // ... your logic
  
  // Trigger audio notification
  triggerEmailNotification(creatorName);
  
  return NextResponse.json({ success: true });
}
```

### Client-Side Notifications

```typescript
import { useAudioNotification } from '@/hooks/use-audio-notification';

function MyComponent() {
  const { playEmailNotification } = useAudioNotification();
  
  const handleEmailSent = () => {
    playEmailNotification('John Doe');
  };
  
  return <button onClick={handleEmailSent}>Send Email</button>;
}
```

### Settings Integration

The audio notification controls are integrated into the Settings page:

- **Location**: Settings → Notifications → Audio Alerts
- **Features**: Toggle on/off, test notification, status indicator
- **Persistence**: Settings are maintained across sessions

## API Endpoints

### 1. Admin Actions (`/api/admin/approve-creator`)

```typescript
POST /api/admin/approve-creator
{
  "creatorId": "creator_id",
  "action": "approve" | "deny" | "disconnect"
}
```

### 2. System Alerts (`/api/system/alert`)

```typescript
POST /api/system/alert
{
  "alertType": "maintenance" | "security" | "general",
  "message": "Alert message",
  "targetCreators": ["creator_id_1", "creator_id_2"] // optional
}
```

### 3. Email Notifications (`/api/settings/new-device-email`)

```typescript
POST /api/settings/new-device-email
{
  "userEmail": "user@example.com",
  "deviceInfo": {
    "device": "iPhone",
    "browser": "Safari",
    "os": "iOS 15",
    "ipAddress": "192.168.1.1",
    "loginTime": "2024-01-15T10:30:00Z"
  }
}
```

## Configuration

### Voice Settings

The system automatically selects the best available voice:

1. **Priority**: English female voice
2. **Fallback**: Any English voice
3. **Default**: First available voice

### Audio Parameters

- **Rate**: 0.9 (slightly slower for clarity)
- **Pitch**: 1.0 (natural pitch)
- **Volume**: 0.8 (80% volume)

### Browser Compatibility

- ✅ **Chrome**: Full support
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support
- ✅ **Edge**: Full support
- ❌ **Internet Explorer**: Not supported

## Security & Privacy

### Autoplay Compliance

- **Respects Browser Policies**: Only plays when tab is active
- **User Consent**: Requires explicit user interaction for first play
- **Graceful Degradation**: Falls back silently if not supported

### Data Protection

- **No Audio Storage**: Audio is generated in real-time
- **No Voice Recording**: Uses browser's built-in synthesis
- **Privacy First**: No personal data transmitted for voice generation

## Troubleshooting

### Common Issues

1. **No Audio Playing**
   - Check browser permissions
   - Ensure tab is active
   - Verify audio is enabled in settings

2. **Voice Not Working**
   - Check browser support
   - Try different browser
   - Verify internet connection

3. **Settings Not Saving**
   - Check localStorage permissions
   - Clear browser cache
   - Try incognito mode

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('audio-notification-debug', 'true');
```

## Future Enhancements

### Planned Features

1. **Custom Voice Selection**: Let users choose preferred voice
2. **Notification History**: Track and replay recent notifications
3. **Scheduled Notifications**: Time-based audio alerts
4. **Mobile Support**: Enhanced mobile audio handling
5. **Accessibility**: Screen reader integration

### Performance Optimizations

1. **Voice Caching**: Cache frequently used voices
2. **Batch Notifications**: Group multiple notifications
3. **Background Processing**: Offload synthesis to web workers

## Testing

### Manual Testing

1. **Enable Audio**: Go to Settings → Notifications → Audio Alerts
2. **Test Notification**: Click the test button
3. **Trigger Email**: Send a new device email
4. **Admin Actions**: Use admin panel to approve/deny creators

### Automated Testing

```typescript
// Test audio notification functionality
describe('Audio Notifications', () => {
  it('should play email notification', () => {
    // Test implementation
  });
  
  it('should respect autoplay policies', () => {
    // Test implementation
  });
});
```

## Support

For issues or questions about the audio notification system:

1. **Check Browser Console**: For error messages
2. **Verify Settings**: Ensure audio is enabled
3. **Test in Different Browser**: Isolate browser-specific issues
4. **Contact Support**: If issues persist

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Compatibility**: Modern browsers with Web Speech API support 