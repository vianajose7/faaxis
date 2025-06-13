// Error handling utilities for FaAxis

// Custom error types with status codes
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Invalid request') {
    super(message, 400);
  }
}

export class ValidationError extends ApiError {
  errors: any[];
  
  constructor(message = 'Validation failed', errors: any[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}

// Format error responses consistently
export function formatErrorResponse(err: any): {
  message: string;
  errors?: any[];
  code?: string;
  status: number;
  timestamp: string;
} {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Default values
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let code = err.code;
  let errors = err.errors;
  
  // In production, sanitize error messages for security
  if (isProd) {
    // Don't expose internal error details in production
    if (status >= 500) {
      message = 'Internal Server Error';
    }
    
    // Sanitize sensitive information from error messages
    message = sanitizeErrorMessage(message);
  }
  
  return {
    message,
    status,
    ...(code && { code }), 
    ...(errors && { errors }),
    timestamp: new Date().toISOString()
  };
}

// Sanitize error messages to prevent leaking sensitive info
function sanitizeErrorMessage(message: string): string {
  // Remove any potential file paths
  message = message.replace(/\/[\w/\.-]+/g, '[path]');
  
  // Remove any potential SQL snippets
  message = message.replace(/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/gi, '[sql]');
  
  // Remove potential email addresses
  message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
  
  return message;
}