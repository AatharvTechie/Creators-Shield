export function checkEmailConfiguration() {
  const config = {
    brevoUsername: process.env.BREVO_SMTP_USERNAME,
    brevoPassword: process.env.BREVO_SMTP_PASSWORD,
    senderEmail: process.env.SENDER_EMAIL,
    isConfigured: false,
    missingFields: [] as string[]
  };

  // Check if all required fields are present
  if (!config.brevoUsername) {
    config.missingFields.push('BREVO_SMTP_USERNAME');
  }
  if (!config.brevoPassword) {
    config.missingFields.push('BREVO_SMTP_PASSWORD');
  }
  if (!config.senderEmail) {
    config.missingFields.push('SENDER_EMAIL');
  }

  config.isConfigured = config.missingFields.length === 0;

  return config;
}

export function getEmailSetupInstructions() {
  return `
📧 Email Configuration Setup

To enable email notifications, you need to configure Brevo SMTP:

1. Create a free Brevo account at https://www.brevo.com/
2. Get your SMTP credentials from Settings → SMTP & API
3. Add these environment variables to your .env.local file:

BREVO_SMTP_USERNAME=your_brevo_username
BREVO_SMTP_PASSWORD=your_brevo_api_key
SENDER_EMAIL=your-verified-email@yourdomain.com

4. Verify your sender email in Brevo dashboard
5. Restart your development server

For detailed setup instructions, see: BREVO_SETUP.md
`;
} 