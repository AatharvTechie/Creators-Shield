# Test Email API - PowerShell Script
Write-Host "🧪 Testing Brevo Email API..." -ForegroundColor Green

# Test Health Check
Write-Host "`n📋 Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/email" -Method GET
    Write-Host "✅ Health Check Passed:" -ForegroundColor Green
    Write-Host ($healthResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Email Sending
Write-Host "`n📧 Testing Email Sending..." -ForegroundColor Yellow
try {
    $emailData = @{
        to = "test@example.com"  # Replace with your test email
        subject = "Test Email from Brevo SMTP"
        html = @"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
    <h1 style='color: #333;'>Hello from Brevo SMTP!</h1>
    <p>This is a test email sent from your Next.js app using Brevo SMTP.</p>
    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
        <h3>Email Details:</h3>
        <ul>
            <li><strong>Service:</strong> Next.js Email API</li>
            <li><strong>Provider:</strong> Brevo SMTP</li>
            <li><strong>Plan:</strong> Free (300 emails/day)</li>
            <li><strong>Timestamp:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</li>
        </ul>
    </div>
    <p>If you received this email, the Brevo SMTP integration is working correctly! 🎉</p>
</div>
"@
    }

    $emailResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/email" -Method POST -Body ($emailData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Email Sent Successfully:" -ForegroundColor Green
    Write-Host ($emailResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Email Sending Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Test Complete!" -ForegroundColor Green 