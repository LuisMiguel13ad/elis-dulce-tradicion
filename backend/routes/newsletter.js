import express from 'express';
import { Resend } from 'resend';
import db from '../db/sqlite-connection.js';

const router = express.Router();

// Lazy initialization of Resend client
let resendClient = null;
function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    try {
      resendClient = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Resend client:', error);
    }
  }
  return resendClient;
}

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    console.log(`📧 Newsletter subscription request: ${email}`);
    
    // Store in database (optional - for tracking)
    try {
      // Check if email already exists
      const existing = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
      
      if (!existing) {
        db.prepare(`
          INSERT INTO newsletter_subscribers (email, subscribed_at, status)
          VALUES (?, datetime('now'), 'active')
        `).run(email);
        console.log(`   ✅ Email saved to database: ${email}`);
      } else {
        console.log(`   ℹ️  Email already subscribed: ${email}`);
      }
    } catch (dbError) {
      // Table might not exist, that's okay - we'll still send the email
      console.log('   ⚠️  Database table not found, skipping database save');
    }
    
    // Send welcome email via Resend
    const resend = getResendClient();
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: email,
          subject: 'Welcome to Eli\'s Bakery Cafe!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Welcome to Eli's Bakery Cafe!</h2>
              <p>Thank you for subscribing to our newsletter. You'll be the first to know about:</p>
              <ul>
                <li>🎂 New cake flavors and specials</li>
                <li>🍞 Fresh bread and pastries</li>
                <li>🎉 Special promotions and discounts</li>
                <li>📅 Upcoming events and celebrations</li>
              </ul>
              <p>We're excited to share our delicious creations with you!</p>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                Eli's Bakery Cafe<br>
                846 Street Rd., Bensalem, PA<br>
                (610) 910-9067
              </p>
            </div>
          `,
        });
        
        console.log(`   ✅ Welcome email sent via Resend: ${emailResult.id}`);
      } catch (emailError) {
        console.error('   ❌ Failed to send email via Resend:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('   ⚠️  Resend not configured, skipping email send');
    }
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

export default router;

