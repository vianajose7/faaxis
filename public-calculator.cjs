/**
 * Public Calculator Access Server
 * 
 * This server makes the calculator publicly accessible by modifying
 * the App.tsx implementation at runtime to skip auth checks.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Public directory where built files are located
const publicDir = path.join(__dirname, 'dist/public');

// Middleware to modify HTML before sending
app.use((req, res, next) => {
  const originalSendFile = res.sendFile;
  
  res.sendFile = function(filepath, options, callback) {
    // Only modify index.html
    if (filepath.endsWith('index.html')) {
      try {
        let content = fs.readFileSync(filepath, 'utf8');
        
        // Add script to fix auth context and make calculator accessible
        const authFixScript = `
        <script>
          // Public Calculator Access Fix
          console.log('🔧 Applying public calculator access fix');
          
          // Wait for React to load
          window.addEventListener('DOMContentLoaded', function() {
            // Create a mock auth context to enable calculator access
            const createDefaultUser = function() {
              return {
                id: Date.now(),
                username: 'guest@example.com',
                email: 'guest@example.com',
                firstName: 'Guest',
                lastName: 'User'
              };
            };
            
            // Initialize local storage with user data
            if (!localStorage.getItem('user')) {
              localStorage.setItem('user', JSON.stringify(createDefaultUser()));
            }
            
            // Initialize local storage with auth token
            if (!localStorage.getItem('authToken')) {
              localStorage.setItem('authToken', 'public-access-' + Date.now());
            }
            
            // Apply fix after React loads
            setTimeout(function() {
              try {
                if (window.React && window.React.createContext) {
                  console.log('🔄 Patching React context for calculator access');
                  
                  // Store the original createContext
                  const originalCreateContext = window.React.createContext;
                  
                  // Override createContext to provide auth for calculator page
                  window.React.createContext = function(defaultValue, ...args) {
                    const context = originalCreateContext(defaultValue, ...args);
                    
                    // Check if this is an auth context
                    if (
                      (context.displayName && context.displayName.toLowerCase().includes('auth')) ||
                      (defaultValue && typeof defaultValue === 'object' && 'user' in defaultValue)
                    ) {
                      console.log('✅ Found auth context, providing public access');
                      
                      // Get user from localStorage
                      let user;
                      try {
                        const userStr = localStorage.getItem('user');
                        user = userStr ? JSON.parse(userStr) : createDefaultUser();
                      } catch (e) {
                        user = createDefaultUser();
                      }
                      
                      // Create auth value with public access
                      const authValue = {
                        user: user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        login: () => Promise.resolve({ success: true }),
                        logout: () => Promise.resolve(),
                        register: () => Promise.resolve({ success: true }),
                        refreshAuthState: () => Promise.resolve(),
                        loginMutation: { mutate: () => {}, isPending: false },
                        logoutMutation: { mutate: () => {}, isPending: false },
                        registerMutation: { mutate: () => {}, isPending: false },
                        directLoginMutation: { mutate: () => {}, isPending: false },
                        refetch: () => Promise.resolve()
                      };
                      
                      // Override Provider component
                      const originalProvider = context.Provider;
                      context.Provider = function(props) {
                        // Replace value with our public access auth
                        return window.React.createElement(
                          originalProvider,
                          { ...props, value: authValue },
                          props.children
                        );
                      };
                    }
                    
                    return context;
                  };
                }
              } catch (e) {
                console.error('Error applying calculator fix:', e);
              }
            }, 100);
          });
          
          // Catch auth errors
          window.addEventListener('error', function(event) {
            if (event.error && event.error.message && event.error.message.includes('useAuth must be used within')) {
              console.log('🛡️ Intercepting auth error for calculator access');
              event.preventDefault();
            }
          });
        </script>`;
        
        // Inject script before closing head tag
        content = content.replace('</head>', authFixScript + '</head>');
        
        // Send modified content
        res.setHeader('Content-Type', 'text/html');
        return res.send(content);
      } catch (err) {
        console.error('Error modifying HTML:', err);
        return originalSendFile.call(this, filepath, options, callback);
      }
    }
    
    // For other files, use original sendFile
    return originalSendFile.call(this, filepath, options, callback);
  };
  
  next();
});

// API mock endpoints

// Blog API endpoint
app.get('/api/blog', (req, res) => {
  res.json([
    { id: 1, title: "Financial Planning Essentials", excerpt: "Learn key strategies for effective financial planning." },
    { id: 2, title: "Investment Strategies", excerpt: "Discover the most promising investment opportunities." },
    { id: 3, title: "Retirement Planning", excerpt: "A guide to planning for a secure retirement." }
  ]);
});

// News API endpoint
app.get('/api/news', (req, res) => {
  res.json([
    { id: 1, title: "Market Update", excerpt: "Latest market trends and analysis." },
    { id: 2, title: "Regulatory Updates", excerpt: "Recent changes in financial regulations." },
    { id: 3, title: "Economic Outlook", excerpt: "Predictions for the upcoming fiscal year." }
  ]);
});

// User API endpoint
app.get('/api/me', (req, res) => {
  res.json({
    id: Date.now(),
    username: 'guest@example.com',
    email: 'guest@example.com',
    firstName: 'Guest',
    lastName: 'User',
    isAuthenticated: true
  });
});

// Serve static files
app.use(express.static(publicDir));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ PUBLIC CALCULATOR ACCESS ENABLED');
  console.log('Visit /calculator to use the calculator without authentication');
});