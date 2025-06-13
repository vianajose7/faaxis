/**
 * Stripe-focused Production Server
 * 
 * A clean, unified server implementation that prioritizes
 * Stripe integration working properly in production.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import Stripe from 'stripe';
import { registerRoutes } from './dist/server/routes.js';

// Initialize Express application
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Verify Stripe configuration
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;

console.log('Verifying Stripe configuration:');
console.log(`- STRIPE_SECRET_KEY: ${stripeSecretKey ? '✓ Present' : '❌ Missing'}`);
console.log(`- VITE_STRIPE_PUBLIC_KEY: ${stripePublicKey ? '✓ Present' : '❌ Missing'}`);

// Register direct Stripe endpoints to guarantee functionality
if (stripeSecretKey) {
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', 
    });
    
    console.log('✓ Stripe SDK initialized successfully');
    
    // Add direct Stripe payment endpoint
    app.post('/api/create-payment-intent', async (req, res) => {
      try {
        const { amount } = req.body;
        
        if (!amount) {
          return res.status(400).json({ error: 'Amount is required' });
        }
        
        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({ 
          error: 'Payment processing failed',
          message: error.message
        });
      }
    });
    
    // Add configuration check endpoint
    app.get('/api/check-stripe-config', (req, res) => {
      const isTestMode = stripeSecretKey.startsWith('sk_test_');
      
      res.status(200).json({
        hasSecretKey: true,
        hasWebhookKey: !!process.env.STRIPE_WEBHOOK_SECRET,
        isTestMode,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('✓ Direct Stripe endpoints registered');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
  }
} else {
  console.warn('⚠️ Stripe endpoints unavailable due to missing secret key');
}

// Serve static files from the built client app
const publicDir = path.join(__dirname, 'dist/public');
console.log(`📂 Serving static files from: ${publicDir}`);
app.use(express.static(publicDir));

async function startServer() {
  try {
    console.log('🚀 Starting unified server...');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Register all API routes from your existing code
    await registerRoutes(app, server);
    
    // SPA fallback - serve index.html for all non-API routes
    app.get(/^(?!\/api\/|\/jwt\/).*/, (req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('🔥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();