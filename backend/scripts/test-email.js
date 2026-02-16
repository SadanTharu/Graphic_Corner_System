// Quick script to test Mailjet email delivery and see full response
require('dotenv').config();
const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET,
});

async function testEmail() {
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const toEmail = 'sadantharu@gmail.com'; // send to yourself

  console.log('=== Mailjet Test ===');
  console.log('API Key:', process.env.MAILJET_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('API Secret:', process.env.MAILJET_API_SECRET ? '✅ Set' : '❌ Missing');
  console.log('From:', fromEmail);
  console.log('To:', toEmail);
  console.log('');

  try {
    // First, check sender verification status
    console.log('--- Checking sender status ---');
    try {
      const senders = await mailjet.get('sender', { version: 'v3' }).request();
      console.log('Verified senders:');
      senders.body.Data.forEach(s => {
        console.log(`  ${s.Email || s.Name} | Status: ${s.Status} | IsDefaultSender: ${s.IsDefaultSender}`);
      });
      console.log('');
    } catch (e) {
      console.log('Could not fetch senders:', e.message);
    }

    // Now send a test email
    console.log('--- Sending test email ---');
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        // SandboxMode: false, // explicitly disable sandbox
        Messages: [
          {
            From: { Email: fromEmail, Name: 'Graphic Corner Test' },
            To: [{ Email: toEmail, Name: 'Test User' }],
            Subject: 'Mailjet Test - Graphic Corner',
            TextPart: 'This is a test email from Graphic Corner system.',
            HTMLPart: '<h3>Test Email</h3><p>If you see this, Mailjet is working!</p>',
          },
        ],
      });

    console.log('');
    console.log('=== FULL RESPONSE ===');
    console.log(JSON.stringify(result.body, null, 2));
    console.log('');

    const msg = result.body.Messages?.[0];
    console.log('Status:', msg?.Status);
    if (msg?.Status === 'success') {
      console.log('✅ Message accepted! MessageID:', msg.To?.[0]?.MessageID);
      console.log('Check your inbox (and spam folder) for the test email.');
    } else if (msg?.Status === 'error') {
      console.log('❌ Message rejected!');
      console.log('Errors:', JSON.stringify(msg.Errors, null, 2));
    }
  } catch (error) {
    console.error('');
    console.error('=== ERROR ===');
    console.error('Status code:', error.statusCode);
    console.error('Message:', error.message);
    if (error.response?.body) {
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
    }
    
    if (error.statusCode === 401) {
      console.error('\n⚠️  API Key or Secret is invalid. Check your Mailjet dashboard.');
    }
  }
}

testEmail();
