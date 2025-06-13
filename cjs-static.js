// Absolute minimum server with CommonJS syntax
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve an ultra-minimal page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FaAxis</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; }
        h1 { color: #0066cc; }
        .container { max-width: 800px; margin: 40px auto; text-align: center; }
        .btn { background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>FaAxis</h1>
        <p>The financial advisor transition platform</p>
        <p>We are currently performing maintenance. Please try again later.</p>
        <a href="/admin-login" class="btn">Admin Login</a>
      </div>
    </body>
    </html>
  `);
});

// Admin login redirect
app.get('/admin-login', (req, res) => {
  res.redirect('/api/admin-auth/login');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'minimal-cjs' });
});

app.listen(PORT, () => {
  console.log(`ABSOLUTE MINIMAL SERVER RUNNING ON PORT ${PORT}`);
});