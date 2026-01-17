import express from 'express';
import { config } from '../lib/config.js';
import { createToken, requireAuth } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Security constants
const BCRYPT_SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const ACCOUNT_LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes for DB-level lockout

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 setup attempts per hour
  message: { error: 'Too many setup attempts, please try again later' }
});

// In-memory rate limiting (per IP)
const loginAttempts = new Map();

// Helper: Check if admin exists in database
const adminExists = async () => {
  const result = await query(
    'SELECT COUNT(*) as count FROM admin_users WHERE role = $1',
    ['ADMIN']
  );
  return parseInt(result.rows[0].count) > 0;
};

// Helper: Get admin by username
const getAdminByUsername = async (username) => {
  const result = await query(
    'SELECT * FROM admin_users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
};

// Helper: Update login attempts in DB
const updateLoginAttempts = async (adminId, increment = true) => {
  if (increment) {
    await query(
      `UPDATE admin_users 
       SET login_attempts = login_attempts + 1, 
           locked_until = CASE 
             WHEN login_attempts >= $1 THEN NOW() + INTERVAL '30 minutes'
             ELSE locked_until 
           END
       WHERE id = $2`,
      [MAX_LOGIN_ATTEMPTS - 1, adminId]
    );
  } else {
    await query(
      'UPDATE admin_users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
      [adminId]
    );
  }
};

// Helper: Check if account is locked
const isAccountLocked = (admin) => {
  if (!admin.locked_until) return false;
  return new Date(admin.locked_until) > new Date();
};

// Helper: Validate password strength
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password too long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// Helper: Validate username
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }
  if (username.length < 3 || username.length > 50) {
    return { valid: false, message: 'Username must be 3-50 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

// GET /api/auth/setup/status - Check if setup is needed
router.get('/setup/status', async (req, res) => {
  try {
    const hasAdmin = await adminExists();
    res.json({ setupRequired: !hasAdmin });
  } catch (error) {
    console.error('Setup status check error:', error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// POST /api/auth/setup - First-time admin setup (only works if no admin exists)
router.post('/setup', setupLimiter, async (req, res) => {
  try {
    // Security check: Block if admin already exists
    const hasAdmin = await adminExists();
    if (hasAdmin) {
      return res.status(403).json({ 
        error: 'Setup already completed. Admin account exists.' 
      });
    }

    const { username, password, confirmPassword } = req.body;

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ error: usernameValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash password with bcrypt (secure, salted hash)
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Insert admin user into database
    const result = await query(
      `INSERT INTO admin_users (username, password_hash, role)
       VALUES ($1, $2, 'ADMIN')
       RETURNING id, username, role, created_at`,
      [username.toLowerCase(), passwordHash]
    );

    const admin = result.rows[0];

    // Create JWT token for immediate login
    const token = createToken({ 
      id: admin.id, 
      username: admin.username, 
      role: admin.role 
    });

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// POST /api/auth/login - Admin login with username and password
router.post('/login', authLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  try {
    // Check IP-based rate limiting
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && Date.now() - attempts.lastAttempt < LOGIN_LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOGIN_LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000);
      return res.status(429).json({ 
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.` 
      });
    }

    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if any admin exists
    const hasAdmin = await adminExists();
    if (!hasAdmin) {
      return res.status(403).json({ 
        error: 'No admin account exists. Please complete setup first.',
        setupRequired: true
      });
    }

    // Get admin from database
    const admin = await getAdminByUsername(username.toLowerCase());
    
    if (!admin) {
      // Increment IP-based attempts (timing-safe - same delay as wrong password)
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      await bcrypt.hash('dummy', BCRYPT_SALT_ROUNDS); // Timing attack prevention
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (isAccountLocked(admin)) {
      const lockExpiry = new Date(admin.locked_until);
      const remainingTime = Math.ceil((lockExpiry - new Date()) / 60000);
      return res.status(423).json({ 
        error: `Account locked. Try again in ${remainingTime} minutes.` 
      });
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      // Update both IP and DB-level attempts
      loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: Date.now() });
      await updateLoginAttempts(admin.id, true);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login - clear attempts
    loginAttempts.delete(ip);
    await updateLoginAttempts(admin.id, false);

    // Create JWT token
    const token = createToken({
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/verify - Verify JWT token validity
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    res.json({ 
      valid: true,
      admin: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// POST /api/auth/logout - Logout (stateless - client deletes token)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// PUT /api/auth/password - Change password (requires authentication)
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin.id;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Get current admin
    const result = await query('SELECT * FROM admin_users WHERE id = $1', [adminId]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, adminId]
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
