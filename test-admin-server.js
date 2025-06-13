import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { sendAdminVerificationCode } from './server/email-service.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// In-memory storage for OTP codes
const pendingOtps = new Map();

// Admin credentials from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.post('/api/admin-auth/send-code', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('=== ADMIN AUTH REQUEST ===');
  console.log('Email:', email);
  console.log('Password provided:', password ? 'YES' : 'NO');
  
  // Validate admin credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    console.log('Invalid credentials');
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = 'otp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Store OTP with 5-minute expiration
  pendingOtps.set(key, {
    code,
    expires: Date.now() + 5 * 60 * 1000,
    email
  });
  
  console.log('Generated code:', code);
  console.log('OTP key:', key);
  
  try {
    // Send email
    await sendAdminVerificationCode(email, code);
    console.log('Email sent successfully');
    
    res.json({
      otpKey: key,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

app.post('/api/admin-auth/verify-code', (req, res) => {
  const { otpKey, code } = req.body;
  
  console.log('=== VERIFICATION REQUEST ===');
  console.log('OTP Key:', otpKey);
  console.log('Code:', code);
  
  if (!otpKey || !code) {
    return res.status(400).json({ error: 'OTP key and code are required' });
  }
  
  const entry = pendingOtps.get(otpKey);
  
  if (!entry) {
    console.log('Invalid OTP key');
    return res.status(401).json({ error: 'Invalid verification key' });
  }
  
  if (entry.expires < Date.now()) {
    console.log('OTP expired');
    pendingOtps.delete(otpKey);
    return res.status(401).json({ error: 'Verification code has expired' });
  }
  
  console.log('Expected code:', entry.code);
  console.log('Provided code:', code);
  console.log('Match:', entry.code === code);
  
  if (entry.code !== code) {
    console.log('Code mismatch');
    return res.status(401).json({ error: 'Invalid verification code' });
  }
  
  // Success - clean up and mark as authenticated
  pendingOtps.delete(otpKey);
  req.session.isAdmin = true;
  req.session.adminEmail = entry.email;
  
  console.log('Verification successful');
  
  res.json({
    success: true,
    message: 'Admin authentication successful'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test admin server running on port ${PORT}`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/api/admin-auth/send-code -H "Content-Type: application/json" -d '{"email":"${ADMIN_EMAIL}","password":"${ADMIN_PASSWORD}"}'`);
});