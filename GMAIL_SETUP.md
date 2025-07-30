# Gmail SMTP Email Setup (Alternative to Brevo)

Gmail SMTP is easier to set up and more reliable than Brevo for testing.

## 🚀 Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. This is required to generate App Passwords

### Step 2: Generate App Password
1. Go to Google Account → Security
2. Find "App passwords" (under 2-Step Verification)
3. Select "Mail" and "Other (Custom name)"
4. Name it "Creator Shield"
5. Copy the 16-character password

### Step 3: Environment Variables
Add to your `.env.local` file:

```env
# Gmail SMTP Configuration (Alternative to Brevo)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Test Configuration
Visit: `http://localhost:3000/api/test-gmail-connection`

## 📧 Benefits of Gmail SMTP

✅ **Free**: 500 emails/day  
✅ **Easy Setup**: Just need Gmail account  
✅ **Reliable**: Google's infrastructure  
✅ **No Verification**: Works immediately  
✅ **Familiar**: Most people have Gmail  

## 🔧 Usage

The system will automatically use Gmail if Brevo fails or isn't configured.

## 🧪 Testing

```bash
# Test Gmail connection
curl http://localhost:3000/api/test-gmail-connection

# Test email sending
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test from Gmail",
    "html": "<h1>Hello!</h1>"
  }'
```

## 📊 Gmail Limits

- **Daily Limit**: 500 emails/day
- **Monthly Limit**: 15,000 emails/month
- **Rate Limit**: 100 emails/hour

## 🔍 Troubleshooting

### Common Issues:
1. **"Invalid credentials"** → Check App Password
2. **"2FA required"** → Enable 2-Factor Authentication
3. **"Less secure apps"** → Use App Password instead

### Quick Fix:
If Brevo continues to fail, just use Gmail SMTP instead! 