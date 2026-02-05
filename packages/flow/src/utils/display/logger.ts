/**
 * Centralized logging utility for Sylphx Flow
 * Provides structured logging with Pino backend and pretty printing
 */

import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  module?: string;
  function?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'pretty' | 'simple';
  includeTimestamp: boolean;
  includeContext: boolean;
  colors: boolean;
  module?: string;
}

/**
 * Logger interface for dependency injection and testing
 */
export interface Logger {
  child(context: Record<string, unknown>): Logger;
  module(moduleName: string): Logger;
  setLevel(level: LogLevel): void;
  updateConfig(config: Partial<LoggerConfig>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  time<T>(fn: () => Promise<T>, label: string, context?: Record<string, unknown>): Promise<T>;
  timeSync<T>(fn: () => T, label: string, context?: Record<string, unknown>): T;
}

/**
 * Internal state for logger instance
 */
interface LoggerState {
  config: LoggerConfig;
  context?: Record<string, unknown>;
  pinoInstance: pino.Logger;
}

/**
 * Options for creating a logger instance
 */
interface CreateLoggerOptions {
  config?: Partial<LoggerConfig>;
  context?: Record<string, unknown>;
}

/**
 * Map our log levels to Pino levels
 */
const LEVEL_MAP: Record<LogLevel, string> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/**
 * Create a Pino instance based on configuration
 */
function createPinoInstance(config: LoggerConfig, context?: Record<string, unknown>): pino.Logger {
  const isProduction = process.env.NODE_ENV === 'production';
  const usePretty = config.format === 'pretty' && !isProduction;

  const pinoConfig: pino.LoggerOptions = {
    level: config.level,
    base: context ? { ...context } : undefined,
    timestamp: config.includeTimestamp ? pino.stdTimeFunctions.isoTime : false,
  };

  if (usePretty) {
    // Use pino-pretty for development
    return pino({
      ...pinoConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: config.colors,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      },
    });
  }

  // JSON output for production or when format is 'json'
  return pino(pinoConfig);
}

/**
 * Create a logger instance with the specified configuration and context
 */
export function createLogger(options: Partial<LoggerConfig> | CreateLoggerOptions = {}): Logger {
  // Handle both old style (config object) and new style (options with config and context)
  const isOptionsStyle = 'config' in options || 'context' in options;
  const config = isOptionsStyle
    ? (options as CreateLoggerOptions).config || {}
    : (options as Partial<LoggerConfig>);
  const initialContext = isOptionsStyle ? (options as CreateLoggerOptions).context : undefined;

  const defaultConfig: LoggerConfig = {
    level: 'info',
    format: 'pretty',
    includeTimestamp: true,
    includeContext: true,
    colors: true,
    ...config,
  };

  const state: LoggerState = {
    config: defaultConfig,
    context: initialContext,
    pinoInstance: createPinoInstance(defaultConfig, initialContext),
  };

  /**
   * Create a child logger with additional context
   */
  const child = (context: Record<string, unknown>): Logger => {
    return createLogger({
      config: state.config,
      context: { ...state.context, ...context },
    });
  };

  /**
   * Create a logger for a specific module
   */
  const module = (moduleName: string): Logger => {
    return child({ module: moduleName });
  };

  /**
   * Set the log level
   */
  const setLevel = (level: LogLevel): void => {
    state.config.level = level;
    state.pinoInstance.level = level;
  };

  /**
   * Update logger configuration
   * Note: Recreates Pino instance when configuration changes
   */
  const updateConfig = (config: Partial<LoggerConfig>): void => {
    state.config = { ...state.config, ...config };
    state.pinoInstance = createPinoInstance(state.config, state.context);
  };

  /**
   * Debug level logging
   */
  const debug = (message: string, context?: Record<string, unknown>): void => {
    if (context && state.config.includeContext) {
      state.pinoInstance.debug(context, message);
    } else {
      state.pinoInstance.debug(message);
    }
  };

  /**
   * Info level logging
   */
  const info = (message: string, context?: Record<string, unknown>): void => {
    if (context && state.config.includeContext) {
      state.pinoInstance.info(context, message);
    } else {
      state.pinoInstance.info(message);
    }
  };

  /**
   * Warning level logging
   */
  const warn = (message: string, context?: Record<string, unknown>): void => {
    if (context && state.config.includeContext) {
      state.pinoInstance.warn(context, message);
    } else {
      state.pinoInstance.warn(message);
    }
  };

  /**
   * Error level logging
   */
  const error = (message: string, errorObj?: Error, context?: Record<string, unknown>): void => {
    const errorContext: Record<string, unknown> = { ...context };

    if (errorObj) {
      errorContext.err = {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      };

      // Add error code if it's a CLIError
      if ('code' in errorObj && typeof errorObj.code === 'string') {
        (errorContext.err as Record<string, unknown>).code = errorObj.code;
      }
    }

    if (Object.keys(errorContext).length > 0 && state.config.includeContext) {
      state.pinoInstance.error(errorContext, message);
    } else {
      state.pinoInstance.error(message);
    }
  };

  /**
   * Log function execution with timing
   */
  const time = async <T>(
    fn: () => Promise<T>,
    label: string,
    context?: Record<string, unknown>
  ): Promise<T> => {
    const start = Date.now();
    debug(`Starting ${label}`, context);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      info(`Completed ${label}`, { ...context, duration: `${duration}ms` });
      return result;
    } catch (caughtError) {
      const duration = Date.now() - start;
      error(`Failed ${label}`, caughtError as Error, { ...context, duration: `${duration}ms` });
      throw caughtError;
    }
  };

  /**
   * Log function execution (sync) with timing
   */
  const timeSync = <T>(fn: () => T, label: string, context?: Record<string, unknown>): T => {
    const start = Date.now();
    debug(`Starting ${label}`, context);

    try {
      const result = fn();
      const duration = Date.now() - start;
      info(`Completed ${label}`, { ...context, duration: `${duration}ms` });
      return result;
    } catch (caughtError) {
      const duration = Date.now() - start;
      error(`Failed ${label}`, caughtError as Error, { ...context, duration: `${duration}ms` });
      throw caughtError;
    }
  };

  return {
    child,
    module,
    setLevel,
    updateConfig,
    debug,
    info,
    warn,
    error,
    time,
    timeSync,
  };
}

// Default logger instance
export const logger = createLogger();

// Environment-based configuration
if (process.env.NODE_ENV === 'production') {
  logger.updateConfig({
    level: 'info',
    format: 'json',
    colors: false,
  });
} else if (process.env.DEBUG) {
  logger.updateConfig({
    level: 'debug',
  });
}

// Export convenience functions
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    logger.error(message, error, context),
  time: <T>(fn: () => Promise<T>, label: string, context?: Record<string, unknown>) =>
    logger.time(fn, label, context),
  timeSync: <T>(fn: () => T, label: string, context?: Record<string, unknown>) =>
    logger.timeSync(fn, label, context),
  child: (context: Record<string, unknown>) => logger.child(context),
  module: (moduleName: string) => logger.module(moduleName),
  setLevel: (level: LogLevel) => logger.setLevel(level),
  updateConfig: (config: Partial<LoggerConfig>) => logger.updateConfig(config),
};

export default logger;
