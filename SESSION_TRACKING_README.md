# Session Tracking System

This document describes the comprehensive session tracking system implemented for the Creators Shield application.

## Overview

The session tracking system provides real-time monitoring of user sessions across multiple devices and browsers, with the ability to:
- Track device information (browser, OS, IP address)
- Show current session indicator
- Allow remote session revocation
- Automatically clean up expired sessions
- Update session activity based on user interaction

## Architecture

### 1. Database Schema

**Session Model** (`src/models/Session.js`):
```javascript
{
  user: ObjectId,           // Reference to Creator
  sessionId: String,        // Unique session identifier
  device: String,          // Device type (iPhone, Windows PC, etc.)
  userAgent: String,       // Full user agent string
  browser: String,         // Browser name (Chrome, Firefox, etc.)
  os: String,             // Operating system
  ipAddress: String,      // Client IP address
  location: String,       // Geographic location (future)
  isCurrentSession: Boolean, // Whether this is the active session
  createdAt: Date,        // Session creation time
  lastActive: Date,       // Last activity timestamp
  expiresAt: Date         // Session expiration time (7 days)
}
```

### 2. API Endpoints

#### Authentication
- `POST /api/auth/login` - Creates new session on login
- `POST /api/auth/logout` - Removes current session on logout

#### Session Management
- `GET /api/settings/devices` - Fetch user's active sessions
- `DELETE /api/settings/devices` - Revoke specific session
- `POST /api/session/activity` - Update session activity
- `POST /api/cron/cleanup-sessions` - Clean up expired sessions

### 3. Middleware Integration

The middleware (`src/middleware.ts`) automatically:
- Updates session activity for protected routes
- Checks and removes expired sessions
- Validates authentication tokens

### 4. Frontend Integration

#### React Hook
`useSessionActivity()` hook tracks user activity and updates session activity:
- Monitors mouse, keyboard, and touch events
- Updates session activity every 10 minutes while active
- Handles cleanup on component unmount

#### Settings UI
Enhanced Active Devices section shows:
- Device name and type
- Browser and OS information
- IP address (if available)
- Login and last active times
- Current session indicator
- Remote session revocation

## Features

### 1. Device Detection
- **Browser Detection**: Chrome, Firefox, Safari, Edge, Opera
- **OS Detection**: Windows, macOS, Linux, Android, iOS
- **Device Type**: iPhone, iPad, Android Mobile, Windows PC, Mac, etc.
- **IP Address**: Extracted from various headers (X-Forwarded-For, X-Real-IP, etc.)

### 2. Session Management
- **Automatic Creation**: New sessions created on login
- **Activity Tracking**: Real-time activity monitoring
- **Expiration**: Sessions expire after 7 days
- **Cleanup**: Automatic removal of expired sessions

### 3. Security Features
- **Current Session Indicator**: Shows which device is currently active
- **Remote Revocation**: Users can log out sessions from other devices
- **Activity Monitoring**: Tracks user interaction patterns
- **IP Tracking**: Records client IP addresses for security

### 4. UI Enhancements
- **Visual Indicators**: Current session highlighted with blue ring
- **Detailed Information**: Browser, OS, IP, timestamps
- **Action Buttons**: Revoke button for non-current sessions
- **Real-time Updates**: Session list updates automatically

## Implementation Details

### 1. Device Information Parsing
```typescript
// src/lib/device-utils.ts
export function parseUserAgent(userAgent: string): DeviceInfo {
  // Browser detection logic
  // OS detection logic
  // Device type detection logic
}
```

### 2. Session Activity Tracking
```typescript
// src/hooks/use-session-activity.ts
export function useSessionActivity() {
  // Event listeners for user activity
  // Periodic session updates
  // Cleanup on unmount
}
```

### 3. Middleware Integration
```typescript
// src/middleware.ts
async function updateSessionActivity(userId: string) {
  // Update last active time
  // Handle session expiration
}
```

## Usage Examples

### 1. Login with Device Tracking
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    userAgent: navigator.userAgent
  })
});
```

### 2. Fetch Active Devices
```javascript
const devices = await fetch('/api/settings/devices?email=user@example.com', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. Revoke Session
```javascript
await fetch('/api/settings/devices', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    sessionId: 'session_123'
  })
});
```

## Testing

### Manual Testing
1. **Login from different devices/browsers**
2. **Check Active Devices section in Settings**
3. **Verify current session indicator**
4. **Test remote session revocation**
5. **Monitor session activity updates**

### Automated Testing
Run the test script:
```bash
node test-session-tracking.js
```

## Security Considerations

1. **Session Expiration**: All sessions expire after 7 days
2. **IP Tracking**: IP addresses are logged for security monitoring
3. **Remote Revocation**: Users can log out suspicious sessions
4. **Activity Monitoring**: Inactive sessions are automatically cleaned up
5. **Token Validation**: JWT tokens are validated on each request

## Performance Optimizations

1. **Database Indexes**: Optimized queries for session lookups
2. **Automatic Cleanup**: Expired sessions are removed automatically
3. **Lazy Updates**: Session activity is updated periodically, not on every request
4. **Caching**: Device information is cached to reduce parsing overhead

## Future Enhancements

1. **Geographic Location**: Add location tracking based on IP
2. **Session Analytics**: Track session patterns and usage statistics
3. **Security Alerts**: Notify users of suspicious login attempts
4. **Device Fingerprinting**: More accurate device identification
5. **Session Limits**: Limit number of concurrent sessions per user

## Troubleshooting

### Common Issues

1. **Sessions not appearing**: Check database connection and session creation
2. **Activity not updating**: Verify middleware and hook integration
3. **Revocation failing**: Check authentication and session ID validation
4. **Cleanup not working**: Verify cron job configuration

### Debug Commands

```bash
# Check session collection
db.sessions.find().pretty()

# Check expired sessions
db.sessions.find({expiresAt: {$lt: new Date()}})

# Check user sessions
db.sessions.find({user: ObjectId("user_id")})
```

## Configuration

### Environment Variables
```bash
JWT_SECRET=your_jwt_secret
CRON_SECRET=your_cron_secret  # Optional, for cron job security
```

### Database Indexes
```javascript
// Automatically created by the Session model
sessionSchema.index({ user: 1, lastActive: -1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

This session tracking system provides comprehensive monitoring and management of user sessions across multiple devices while maintaining security and performance. 