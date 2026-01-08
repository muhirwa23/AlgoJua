import express from 'express';
import { nanoid } from 'nanoid';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import { query, connect } from '../lib/db.js';
import { resend } from '../lib/resend.js';
import { config } from '../lib/config.js';

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many subscription attempts, please try again later' }
});

router.post('/subscribe', subscribeLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const normalizedEmail = validator.normalizeEmail(email);
    const confirmationToken = nanoid(32);
    const unsubscribeToken = nanoid(32);

    const result = await query(
      `INSERT INTO subscribers (email, confirmation_token, unsubscribe_token, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (email) 
       DO UPDATE SET 
         confirmation_token = $2,
         unsubscribe_token = $3,
         status = CASE 
           WHEN subscribers.status = 'unsubscribed' THEN 'pending'
           ELSE subscribers.status
         END
       RETURNING *`,
      [normalizedEmail, confirmationToken, unsubscribeToken]
    );

    const subscriber = result.rows[0];
    const confirmUrl = `${config.baseUrl}/confirm/${confirmationToken}`;

    await resend.emails.send({
      from: 'Algo Jua <[email protected]>',
      to: email,
      subject: 'Confirm your subscription to Algo Jua',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Algo Jua!</h2>
          <p>Thank you for subscribing to our newsletter. You'll get the latest insights on AI, technology, and lifestyle.</p>
          <p>Please confirm your email address by clicking the button below:</p>
          <a href="${confirmUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Confirm Subscription</a>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px;">${confirmUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">If you didn't subscribe to Algo Jua, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ 
      success: true, 
      message: 'Confirmation email sent. Please check your inbox.',
      status: subscriber.status 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `UPDATE subscribers 
       SET status = 'confirmed', confirmation_token = NULL
       WHERE confirmation_token = $1 AND status = 'pending'
       RETURNING *`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired confirmation token' });
    }

    const subscriber = result.rows[0];
    const unsubscribeUrl = `${config.baseUrl}/unsubscribe/${subscriber.unsubscribe_token}`;

    await resend.emails.send({
      from: 'Algo Jua <[email protected]>',
      to: subscriber.email,
      subject: 'Welcome to Algo Jua Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're all set! 🎉</h2>
          <p>Your subscription to Algo Jua has been confirmed.</p>
          <p>You'll now receive our weekly digest with the latest articles on:</p>
          <ul style="line-height: 1.8;">
            <li>Artificial Intelligence & Machine Learning</li>
            <li>Technology Trends & Innovations</li>
            <li>Lifestyle & Productivity Tips</li>
            <li>Exclusive AI Tools & Resources</li>
          </ul>
          <p style="margin-top: 30px;">We're excited to have you on board!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a></p>
        </div>
      `,
    });

    res.json({ 
      success: true, 
      message: 'Email confirmed successfully!',
      email: subscriber.email 
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `UPDATE subscribers 
       SET status = 'unsubscribed'
       WHERE unsubscribe_token = $1
       RETURNING *`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid unsubscribe token' });
    }

    res.json({ 
      success: true, 
      message: 'You have been unsubscribed successfully',
      email: result.rows[0].email 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
