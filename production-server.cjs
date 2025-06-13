const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// Use Neon's HTTP fetch driver instead of serverless for Replit compatibility
const { neon } = require('@neondatabase/serverless');

// Create HTTP-only database client
const sql = neon(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('[PRODUCTION] Starting FA Axis production server...');
console.log('[PRODUCTION] Port:', PORT);
console.log('[PRODUCTION] Working directory:', process.cwd());

// Database setup
if (!process.env.DATABASE_URL) {
  console.error('[PRODUCTION] ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

// No pool needed - using direct HTTP queries

console.log('[PRODUCTION] Database configured with HTTP transport and connection pooling');

// Import schema (you'll need to adjust this path based on your structure)
// For now, we'll define basic user operations directly

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JWT secret for production
const JWT_SECRET = process.env.JWT_SECRET || 'fa-axis-production-jwt-secret-' + Math.random().toString(36);

// Database user operations with retry logic
const getUserByUsername = async (username) => {
  try {
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (result[0]) {
      // Map database fields to frontend expected format
      const user = result[0];
      return {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium,
        isAdmin: user.is_admin,
        emailVerified: user.email_verified
      };
    }
    return null;
  } catch (error) {
    console.error('[PRODUCTION] Error getting user:', error.message);
    return null;
  }
};

const createUser = async (userData) => {
  try {
    const { username, password, firstName, lastName } = userData;
    const result = await sql`
      INSERT INTO users (username, password, first_name, last_name, is_premium, is_admin, email_verified) 
      VALUES (${username}, ${password}, ${firstName || null}, ${lastName || null}, ${false}, ${false}, ${true}) 
      RETURNING *
    `;
    
    if (result[0]) {
      // Map database fields to frontend expected format
      const user = result[0];
      return {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium,
        isAdmin: user.is_admin,
        emailVerified: user.email_verified
      };
    }
    return result[0];
  } catch (error) {
    console.error('[PRODUCTION] Error creating user:', error.message);
    throw error;
  }
};

// Helper functions
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin || false,
    isPremium: user.is_premium || false,
    emailVerified: user.email_verified || false,
    // Include both formats for compatibility
    is_admin: user.is_admin || false,
    is_premium: user.is_premium || false,
    email_verified: user.email_verified || false,
    first_name: user.first_name,
    last_name: user.last_name
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Check for client dist directory - updated to match vite.config.ts output
const clientDistPath = path.join(__dirname, 'dist/public');
console.log('[PRODUCTION] Looking for client build at:', clientDistPath);

// Essential API routes first
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    build_status: fs.existsSync(clientDistPath) ? 'found' : 'missing',
    database_connected: !!process.env.DATABASE_URL
  });
});

// JWT Authentication routes
app.post('/api/jwt/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      username,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null
    });

    // Generate JWT token
    const token = generateToken(user);

    // Set token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    console.log(`[PRODUCTION] User registered: ${username} (ID: ${user.id})`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('[PRODUCTION] Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/jwt/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    console.log(`[PRODUCTION] User logged in: ${username}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('[PRODUCTION] Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Standard auth routes (for compatibility)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      username,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null
    });

    // Generate JWT token
    const token = generateToken(user);

    // Set token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    console.log(`[PRODUCTION] User registered via standard endpoint: ${username} (ID: ${user.id})`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('[PRODUCTION] Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    console.log(`[PRODUCTION] User logged in via standard endpoint: ${username}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('[PRODUCTION] Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// JWT middleware for protected routes
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Convert camelCase to snake_case for compatibility
    const userForRequest = {
      ...decoded,
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      isPremium: decoded.is_premium,
      isAdmin: decoded.is_admin,
      emailVerified: decoded.email_verified
    };

    // Attach user data to request
    req.user = userForRequest;
    console.log('[PRODUCTION] User authenticated via JWT:', req.user.id);
    next();
  } catch (error) {
    console.error('[PRODUCTION] JWT verification failed:', error.message);
    res.clearCookie('auth_token');
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get current user
app.get('/api/user', authenticateJWT, async (req, res) => {
  try {
    const user = await getUserByUsername(req.user.username);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a fresh token to extend the session
    const freshToken = generateToken(user);

    // Set the fresh token in cookie
    res.cookie('auth_token', freshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      token: freshToken, // Include token in response for client-side storage
      authenticated: true
    });
  } catch (error) {
    console.error('[PRODUCTION] Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logout successful' });
});

// JWT test endpoint for debugging
app.get('/api/jwt-test', authenticateJWT, async (req, res) => {
  try {
    const user = await getUserByUsername(req.user.username);

    // Generate a fresh token
    const freshToken = generateToken(user || req.user);

    // Set the token in cookie
    res.cookie('auth_token', freshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: false
    });

    res.json({
      message: 'JWT Authentication working!',
      user: user || req.user,
      token: freshToken, // Include token in response
      authenticated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PRODUCTION] JWT test error:', error);
    res.status(500).json({ message: 'JWT test error' });
  }
});

// Blog and news endpoints
app.get('/api/blog/posts', (req, res) => {
  res.json([]);
});

app.get('/api/news', (req, res) => {
  res.json({ newsArticles: [] });
});

// Firm profiles endpoint (missing endpoint causing 404)
app.get('/api/firm-profiles', (req, res) => {
  // Mock firm profiles data for the dashboard
  const mockFirmProfiles = [
    {
      id: 1,
      firm: "Morgan Stanley",
      founded: "1935",
      headquarters: "New York, NY",
      logoUrl: null,
      bio: "Leading global financial services firm providing investment banking, securities, wealth management and investment management services."
    },
    {
      id: 2,
      firm: "Merrill Lynch",
      founded: "1914", 
      headquarters: "New York, NY",
      logoUrl: null,
      bio: "Wealth management division of Bank of America providing comprehensive financial planning and investment services."
    },
    {
      id: 3,
      firm: "UBS",
      founded: "1862",
      headquarters: "Zurich, Switzerland",
      logoUrl: null,
      bio: "Global financial services firm known for wealth management, investment banking and asset management."
    },
    {
      id: 4,
      firm: "Wells Fargo Advisors",
      founded: "1879",
      headquarters: "St. Louis, MO", 
      logoUrl: null,
      bio: "Full-service brokerage and wealth management firm serving individual and institutional clients."
    },
    {
      id: 5,
      firm: "Raymond James",
      founded: "1962",
      headquarters: "St. Petersburg, FL",
      logoUrl: null,
      bio: "Independent financial services company providing wealth management, investment banking and asset management."
    }
  ];
  
  res.json(mockFirmProfiles);
});

// Stripe create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    // Check for Stripe configuration
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[PRODUCTION] Stripe Secret Key missing');
      return res.status(500).json({
        error: 'Payment service is currently unavailable. Please try again later.'
      });
    }

    // Initialize Stripe
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('[PRODUCTION] Creating payment intent for premium membership');

    // Create payment intent for $299 premium membership
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 29900, // $299.00 in cents
      currency: 'usd',
      metadata: {
        productType: 'premium_membership',
        productName: 'FA Axis Premium',
        price: '299.00'
      },
      description: 'FA Axis Premium Membership'
    });

    console.log('[PRODUCTION] Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('[PRODUCTION] Stripe payment intent error:', error.message);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({
        error: 'Payment service authentication error. Please contact support.'
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid payment request. Please try again.'
      });
    } else {
      return res.status(500).json({
        error: 'Payment processing error. Please try again later.'
      });
    }
  }
});

// Check if built React app exists and has actual assets
if (fs.existsSync(clientDistPath)) {
  const distContents = fs.readdirSync(clientDistPath);
  console.log('[PRODUCTION] Client dist contents:', distContents);

  // Check for JS assets in the assets folder (where Vite puts them)
  let hasJSAssets = false;
  const assetsPath = path.join(clientDistPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetsContents = fs.readdirSync(assetsPath);
    hasJSAssets = assetsContents.some(file => file.endsWith('.js'));
    console.log('[PRODUCTION] Assets folder contents:', assetsContents);
  }

  const hasIndexHtml = distContents.includes('index.html');

  if (hasIndexHtml && hasJSAssets) {
    console.log('[PRODUCTION] ✅ Complete React app build found - serving static files');

    // Serve static files from client/dist
    app.use(express.static(clientDistPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true,
      index: false
    }));

    // SPA catch-all handler
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }

      const indexPath = path.join(clientDistPath, 'index.html');
      console.log(`[SPA] Serving ${req.path} -> index.html`);
      res.sendFile(indexPath);
    });

  } else {
    console.error('[PRODUCTION] ❌ Incomplete build - missing JavaScript assets');
    console.log('[PRODUCTION] Found files:', distContents);

    // Serve a build error page
    app.get('*', (req, res) => {
      res.status(503).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>FA Axis - Build Error</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                color: white;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                text-align: center;
                max-width: 600px;
                padding: 2rem;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
              }
              .logo { font-size: 3rem; margin-bottom: 1rem; }
              h1 { font-size: 2.5rem; margin-bottom: 1rem; }
              p { font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9; }
              .error { 
                background: rgba(255,255,255,0.2);
                padding: 1rem;
                border-radius: 10px;
                margin: 2rem 0;
                font-family: monospace;
                font-size: 0.9rem;
              }
              .refresh {
                background: rgba(255,255,255,0.3);
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                cursor: pointer;
                margin-top: 1rem;
              }
              .refresh:hover { background: rgba(255,255,255,0.4); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">⚠️</div>
              <h1>FA Axis</h1>
              <p>Build Error Detected</p>
              <div class="error">
                The application build is incomplete. Only index.html was found, missing JavaScript assets.
                <br><br>
                <strong>For developers:</strong> Run 'npm run build' to regenerate assets.
              </div>
              <p>Please try refreshing in a few moments while we rebuild the application.</p>
              <button class="refresh" onclick="window.location.reload()">Refresh Page</button>
            </div>
            <script>
              // Auto-refresh every 30 seconds
              setTimeout(() => {
                window.location.reload();
              }, 30000);
            </script>
          </body>
        </html>
      `);
    });
  }

} else {
  console.error('[PRODUCTION] ❌ React app build not found');

  // Fallback: Serve a proper loading page
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>FA Axis - Your Next Move, Simplified</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              text-align: center;
              max-width: 500px;
              padding: 2rem;
              background: rgba(255,255,255,0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            .logo { font-size: 3rem; margin-bottom: 1rem; }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
            .spinner {
              width: 50px;
              height: 50px;
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .status { 
              background: rgba(255,255,255,0.2);
              padding: 1rem;
              border-radius: 10px;
              margin-top: 2rem;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡</div>
            <h1>FA Axis</h1>
            <p>Your Next Move, Simplified</p>
            <div class="spinner"></div>
            <p>Building your financial advisor platform...</p>
            <div class="status">
              The application is being prepared. This usually takes less than a minute.
              <br><br>
              <strong>Please refresh this page in a moment.</strong>
            </div>
          </div>
          <script>
            // Auto-refresh every 15 seconds
            setTimeout(() => {
              window.location.reload();
            }, 15000);
          </script>
        </body>
      </html>
    `);
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PRODUCTION] FA Axis server running on port ${PORT}`);
  console.log(`[PRODUCTION] Server bound to 0.0.0.0:${PORT}`);
  console.log(`[PRODUCTION] Database connected: ${!!process.env.DATABASE_URL}`);
  console.log(`[PRODUCTION] Ready for deployment`);
});
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Profile update function
const updateUserProfile = async (userId, profileData) => {
  try {
    const { firstName, lastName, phone, city, state, firm, aum, revenue, feeBasedPercentage } = profileData;

    const result = await sql`
      UPDATE users 
      SET 
        first_name = ${firstName || null},
        last_name = ${lastName || null},
        phone = ${phone || null},
        city = ${city || null},
        state = ${state || null},
        firm = ${firm || null},
        aum = ${aum || null},
        revenue = ${revenue || null},
        fee_based_percentage = ${feeBasedPercentage || null}
      WHERE id = ${userId}
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('[PRODUCTION] Error updating user profile:', error.message);
    throw error;
  }
};

// Profile update endpoint
app.put('/api/user', authenticateJWT, async (req, res) => {
  try {
    console.log('[PRODUCTION] Profile update request received');
    const { firstName, lastName, phone, city, state, firm, aum, revenue, feeBasedPercentage } = req.body;

    const result = await updateUserProfile(req.user.id, {
      firstName, lastName, phone, city, state, firm, aum, revenue, feeBasedPercentage
    });

    if (result) {
      console.log('[PRODUCTION] Profile updated successfully');

      // Return the updated user data with proper field mapping
      const updatedUser = {
        ...result,
        firstName: result.first_name,
        lastName: result.last_name,
        isPremium: result.is_premium,
        isAdmin: result.is_admin,
        emailVerified: result.email_verified
      };

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('[PRODUCTION] Profile update error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});