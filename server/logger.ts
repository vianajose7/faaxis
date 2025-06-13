/**
 * Logger Module
 * 
 * A centralized logging service for the application.
 * Uses console.log/error/warn with JSON formatting for better readability
 * and potential future integration with logging services.
 */

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Interface for log entries
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

// Logger class
class Logger {
  private context: string;
  
  constructor(context: string = 'app') {
    this.context = context;
  }
  
  /**
   * Format log message as JSON
   */
  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(data ? { data } : {}),
    };
  }
  
  /**
   * Log an error message
   */
  error(message: string, data?: any): void {
    const logEntry = this.formatLog(LogLevel.ERROR, message, data);
    console.error(JSON.stringify(logEntry));
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    const logEntry = this.formatLog(LogLevel.WARN, message, data);
    console.warn(JSON.stringify(logEntry));
  }
  
  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    const logEntry = this.formatLog(LogLevel.INFO, message, data);
    console.log(JSON.stringify(logEntry));
  }
  
  /**
   * Log a debug message (only in development)
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      const logEntry = this.formatLog(LogLevel.DEBUG, message, data);
      console.log(JSON.stringify(logEntry));
    }
  }
  
  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Export default logger instance with app context
export const logger = new Logger('app');

// Export function to create contextual loggers
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export default logger;