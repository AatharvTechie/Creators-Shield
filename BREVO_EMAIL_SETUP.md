# Brevo Email OTP Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install sib-api-v3-sdk
```

### 2. Environment Variables
Create `.env.local` file with:
```env
# Brevo API Configuration
BREVO_API_KEY=xkeysib-your_api_key_here
SENDER_EMAIL=your_verified_email@domain.com

# Other required variables...
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Get Brevo API Key
1. Go to [Brevo Dashboard](https://app.brevo.com/)
2. Login to your account
3. Go to **Settings** → **SMTP & API**
4. Copy your **API Key** (not SMTP password)

### 4. Verify Sender Email
1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Add and verify your sender email address
3. This will be your "from" email address

## 📧 Usage

### Basic OTP Sending
```javascript
import { sendOTP } from '@/utils/brevo-email';

// Send OTP
const result = await sendOTP('user@example.com', '123456', 'User Name');

if (result.success) {
  console.log('OTP sent successfully!');
} else {
  console.error('Failed to send OTP:', result.error);
}
```

### Test Connection
```javascript
import { testBrevoConnection } from '@/utils/brevo-email';

const test = await testBrevoConnection();
console.log(test);
```

## 🧪 Testing

### Run Test Script
```bash
node test-brevo-email.js
```

### Manual Testing
1. Start your development server: `npm run dev`
2. Go to your OTP sending page
3. Enter an email and request OTP
4. Check console for detailed logs

## 🔧 Features

### ✅ What's Included
- **Professional Email Template** - Beautiful HTML email with branding
- **Error Handling** - Comprehensive error logging and handling
- **Input Validation** - Email format and OTP validation
- **Connection Testing** - Pre-flight connection checks
- **Production Ready** - Proper logging and error responses
- **TypeScript Support** - Full type definitions

### 📧 Email Template Features
- **Responsive Design** - Works on all devices
- **Professional Branding** - CreatorShield branding
- **Security Warnings** - Built-in security notices
- **Expiration Notice** - 5-minute expiration warning
- **Accessibility** - Screen reader friendly

## 🚨 Troubleshooting

### Common Issues

1. **"Key not found" Error**
   - Check if API key is correct
   - Ensure API key is not expired
   - Verify sender email is verified in Brevo

2. **"Email not registered" Error**
   - Check if user exists in database
   - Verify email format is correct

3. **"Environment variables not set"**
   - Check `.env.local` file exists
   - Ensure variables are not commented out
   - Restart server after changing environment variables

### Debug Steps
1. Run connection test: `node test-brevo-email.js`
2. Check console logs for detailed error messages
3. Verify Brevo dashboard settings
4. Test with a verified email address

## 📊 Brevo Limits
- **Free Plan:** 300 emails/day
- **Paid Plans:** Higher limits available
- **Rate Limiting:** Respect API rate limits

## 🔒 Security Notes
- Never commit API keys to version control
- Use environment variables for all secrets
- Verify sender email in Brevo dashboard
- Monitor email sending logs regularly

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "messageId": "message_id_from_brevo",
  "message": "OTP sent successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to send OTP",
  "details": {
    "message": "Key not found",
    "code": "unauthorized"
  },
  "status": 401
}
``` 