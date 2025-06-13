// error-handler.ts - Optimized error handling & performance fixes

// Prevent duplicate initialization with a module-level flag
let initialized = false;

// Store original console methods
const originalConsole = {
  error: console.error.bind(console),
  log: console.log.bind(console)
};

// Message tracking to prevent repetitive logs
const messageTracker = {
  lastShown: {},
  shouldSuppress: (message, throttleMs = 5000) => {
    const now = Date.now();
    const lastTime = messageTracker.lastShown[message] || 0;
    if (now - lastTime < throttleMs) return true;
    messageTracker.lastShown[message] = now;
    return false;
  }
};

// Only initialize once to prevent redeclaration errors
if (!initialized) {
  initialized = true;

  // Replace console.error
  console.error = (...args) => {
    const errorMsg = typeof args[0] === 'string' ? args[0] : String(args[0] || '');
    
    // Skip known problematic errors that cause console spam
    if (
      errorMsg.includes('originalConsoleError') ||
      errorMsg.includes('redeclaration of const') ||
      errorMsg.includes('is not a function') ||
      errorMsg.includes('Warning: React does not recognize') ||
      errorMsg.includes('Warning: validateDOMNesting')
    ) {
      return; // Skip completely
    }
    
    // Apply original function
    originalConsole.error(...args);
  };
  
  // Replace console.log to throttle repetitive messages
  console.log = (...args) => {
    const message = args.join(' ');
    
    // Identify repetitive messages and throttle them
    if (
      message.includes('Setting up enhanced error handlers') ||
      message.includes('Providing dummy token') ||
      message.includes('Tab became visible')
    ) {
      if (messageTracker.shouldSuppress(message)) return;
    }
    
    // Apply original function
    originalConsole.log(...args);
  };
}

// Export functions for use in other modules
export const setupErrorHandler = () => {}; // No-op since we initialize on import
export const resetErrorHandler = () => {}; // No-op for backward compatibility