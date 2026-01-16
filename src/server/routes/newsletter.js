import express from 'express';
import { nanoid } from 'nanoid';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import { query } from '../lib/db.js';
import { resend } from '../lib/resend.js';
import { config } from '../lib/config.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many subscription attempts, please try again later' }
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'Algo Jua <[email protected]>';

const generateBlogEmailHtml = (post, unsubscribeUrl) => {
  const postUrl = `${config.baseUrl}/blog/${post.slug}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ${post.image_url ? `
              <tr>
                <td>
                  <img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 250px; object-fit: cover;">
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 40px;">
                  <p style="color: #2563eb; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; font-weight: 600;">${post.category || 'New Article'}</p>
                  <h1 style="color: #18181b; font-size: 28px; line-height: 1.3; margin: 0 0 16px 0;">${post.title}</h1>
                  <p style="color: #71717a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">${post.subtitle || post.content_introduction?.substring(0, 150) + '...' || ''}</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color: #2563eb; border-radius: 8px;">
                        <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Read Article →</a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #a1a1aa; font-size: 13px; margin: 24px 0 0 0;">
                    ${post.read_time || '5 min read'} • By ${post.author_name || 'Algo Jua Team'}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7;">
                  <p style="color: #71717a; font-size: 13px; margin: 0; text-align: center;">
                    You're receiving this because you subscribed to Algo Jua.<br>
                    <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> from future emails
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const notifySubscribersNewPost = async (post) => {
  try {
    const result = await query(
      `SELECT email, unsubscribe_token FROM subscribers WHERE status = 'confirmed'`
    );
    
    const subscribers = result.rows;
    if (subscribers.length === 0) {
      console.log('[Newsletter] No confirmed subscribers to notify');
      return { sent: 0, failed: 0 };
    }

    console.log(`[Newsletter] Sending notifications to ${subscribers.length} subscribers`);
    
    let sent = 0;
    let failed = 0;
    
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${config.baseUrl}/unsubscribe/${subscriber.unsubscribe_token}`;
          await resend.emails.send({
            from: EMAIL_FROM,
            to: subscriber.email,
            subject: `New Post: ${post.title}`,
            html: generateBlogEmailHtml(post, unsubscribeUrl),
          });
          return { success: true };
        } catch (err) {
          console.error(`[Newsletter] Failed to send to ${subscriber.email}:`, err.message);
          return { success: false };
        }
      });
      
      const results = await Promise.all(emailPromises);
      sent += results.filter(r => r.success).length;
      failed += results.filter(r => !r.success).length;
      
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`[Newsletter] Notification complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('[Newsletter] Error notifying subscribers:', error);
    throw error;
  }
};

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

    console.log('[Newsletter] Sending confirmation email to:', email);
    
    const emailResult = await resend.emails.send({
      from: EMAIL_FROM,
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

    console.log('[Newsletter] Email sent successfully:', emailResult);

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
      from: EMAIL_FROM,
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

router.post('/notify', requireAuth, async (req, res) => {
  try {
    const { postId } = req.body;
    
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const postResult = await query('SELECT * FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];
    const result = await notifySubscribersNewPost(post);
    
    res.json({ 
      success: true, 
      message: `Notifications sent to ${result.sent} subscribers`,
      ...result
    });
  } catch (error) {
    console.error('Notify error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

router.get('/subscribers', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, status, created_at FROM subscribers ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
        COUNT(*) as total
      FROM subscribers
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
