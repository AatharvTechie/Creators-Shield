# Brevo SMTP Email Integration

Brevo SMTP ko aapke existing Next.js project mein integrate kiya gaya hai.

## 🚀 Features

- ✅ **Brevo SMTP Integration** - Free 300 emails/day
- ✅ **No Credit Card Required** - Completely free setup
- ✅ **SPF/DKIM Support** - Domain verification ready
- ✅ **Real-time Email Sending** - Instant delivery
- ✅ **Next.js API Route** - `/api/email` endpoint

## 📧 Brevo Setup (Free Account)

### 1. Create Brevo Account
1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Click "Start for free"
3. Sign up with your email (no credit card required)
4. Verify your email address

### 2. Get SMTP Credentials
1. Login to Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Copy your SMTP credentials:
   - **SMTP Username**: Your Brevo username
   - **SMTP Password**: Your Brevo API key
   - **SMTP Host**: smtp-relay.brevo.com
   - **SMTP Port**: 587

### 3. Verify Sender Email
1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Add and verify your sender email address
3. This will be your "from" email address

## 🔧 Environment Variables

Aapke `.env.local` file mein ye variables add karein:

```env
# Brevo SMTP Configuration
BREVO_SMTP_USERNAME=your_brevo_username
BREVO_SMTP_PASSWORD=your_brevo_api_key
SENDER_EMAIL=your-verified-email@yourdomain.com
```

## 📡 API Endpoints

### Send Email
```
POST /api/email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello!</h1><p>This is a test email.</p>",
  "from": "sender@yourdomain.com" // optional
}
```

### Health Check
```
GET /api/email
```

## 🌐 Domain Verification (SPF/DKIM)

### SPF Record
Aapke domain ke DNS mein ye record add karein:
```
v=spf1 include:spf.brevo.com ~all
```

### DKIM Setup
1. Brevo dashboard mein, **Settings** → **Senders & IP** mein jao
2. Apne verified domain par click karein
3. DKIM records copy karein
4. Unhe aapke domain ke DNS mein add karein

## 🧪 Testing

### Manual Test
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Hello from Brevo",
    "html": "<h1>Hello World!</h1>"
  }'
```

### JavaScript Test
```javascript
const response = await fetch('/api/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Hello!</h1><p>This is a test email.</p>'
  })
});

const result = await response.json();
console.log(result);
```

## 📊 Brevo Free Plan Limits

- **Daily Emails**: 300 emails/day
- **Monthly Emails**: 9,000 emails/month
- **No Credit Card**: Required
- **Features**: SMTP, API, Templates
- **Support**: Community support

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check Brevo SMTP credentials
   - Ensure sender email is verified

2. **Domain Not Verified**
   - Add SPF record to DNS
   - Configure DKIM in Brevo dashboard

3. **Rate Limit Exceeded**
   - Free plan: 300 emails/day
   - Upgrade to paid plan for more

4. **Email Not Delivered**
   - Check spam folder
   - Verify recipient email format
   - Ensure domain is properly configured

## 📈 Benefits

- ✅ **Completely Free** - No credit card required
- ✅ **High Deliverability** - Professional email service
- ✅ **Easy Setup** - Simple configuration
- ✅ **Reliable** - 99.9% uptime
- ✅ **Scalable** - Upgrade when needed
- ✅ **Integrated** - Existing Next.js project mein

## 🚀 Usage in Your App

```typescript
// Example: Send email from your app
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Email sent successfully!');
    } else {
      console.error('Email sending failed:', result.error);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
``` 