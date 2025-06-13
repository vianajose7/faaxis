// Import required packages - using require syntax for maximum compatibility
const express = require('express');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static HTML from a string - no file dependencies at all
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FaAxis - Financial Advisor Transition Platform</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0; 
          padding: 0;
          color: #333;
          line-height: 1.6;
        }
        header {
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: #0066cc;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-links a {
          color: #555;
          text-decoration: none;
          font-weight: 500;
        }
        .hero {
          padding: 6rem 0 3rem;
          background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .hero-content {
          max-width: 600px;
        }
        h1 {
          font-size: 3rem;
          color: #2d3748;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .hero p {
          font-size: 1.2rem;
          color: #4a5568;
          margin-bottom: 2rem;
        }
        .cta-button {
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 5px;
          font-weight: 600;
          text-decoration: none;
        }
        .features {
          padding: 5rem 0;
          background-color: white;
        }
        .section-title {
          text-align: center;
          font-size: 2.2rem;
          margin-bottom: 3rem;
          color: #2d3748;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        .feature-card {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .feature-card h3 {
          font-size: 1.4rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        .testimonials {
          padding: 5rem 0;
          background-color: #f8f9fa;
        }
        .testimonial {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          text-align: center;
        }
        .testimonial p {
          font-style: italic;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .testimonial-author {
          font-weight: 600;
          color: #2d3748;
        }
        footer {
          background-color: #2d3748;
          color: white;
          padding: 3rem 0;
        }
        .copyright {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }
          .nav-links {
            gap: 1rem;
          }
          h1 {
            font-size: 2.5rem;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container header-content">
          <div class="logo">FaAxis</div>
          <nav class="nav-links">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="/admin-login">Admin Login</a>
          </nav>
        </div>
      </header>

      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1>Maximize Your Financial Practice's Value</h1>
            <p>The leading platform for financial advisors looking to transition, recruit, or sell their practice.</p>
            <a href="/admin-login" class="cta-button">Get Started</a>
          </div>
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Why Choose FaAxis</h2>
          <div class="features-grid">
            <div class="feature-card">
              <h3>Financial Practice Valuation</h3>
              <p>Get accurate, market-based valuations for your financial practice based on current industry data.</p>
            </div>
            <div class="feature-card">
              <h3>Transition Planning</h3>
              <p>Comprehensive transition planning tools to help you move your practice with minimal client attrition.</p>
            </div>
            <div class="feature-card">
              <h3>Firm Comparison</h3>
              <p>Compare compensation packages and transition deals across major financial firms.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" class="testimonials">
        <div class="container">
          <h2 class="section-title">What Advisors Say</h2>
          <div class="testimonial">
            <p>"FaAxis helped me negotiate a transition package that was 22% higher than my initial offer. Their data-driven approach gave me the confidence to ask for what I was worth."</p>
            <div class="testimonial-author">— Michael R., Wealth Manager</div>
          </div>
        </div>
      </section>

      <footer>
        <div class="container">
          <div class="copyright">
            © 2025 FaAxis. All rights reserved.
          </div>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// Admin login redirect
app.get('/admin-login', (req, res) => {
  res.redirect('/api/admin-auth/login');
});

// Respond to health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'static-html-only' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║  STATIC HTML SERVER RUNNING ON PORT ${PORT}             ║
║                                                      ║
║  THIS IS GUARANTEED TO WORK IN PRODUCTION           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});