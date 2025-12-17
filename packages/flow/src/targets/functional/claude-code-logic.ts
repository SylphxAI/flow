/**
 * Business logic for Claude Code target setup
 * Pure functions separated from I/O
 *
 * DESIGN RATIONALE:
 * - Business logic testable without file system
 * - Pure functions for settings transformation
 * - Side effects isolated
 * - Clear separation of concerns
 */

import type { ConfigError } from '../../core/functional/error-types.js';
import { configError } from '../../core/functional/error-types.js';
import type { Result } from '../../core/functional/result.js';
import { failure, success, tryCatch } from '../../core/functional/result.js';

/**
 * Claude Code settings structure
 */
export interface ClaudeCodeSettings {
  /** Environment variables for Claude Code */
  env?: {
    CLAUDE_CODE_MAX_OUTPUT_TOKENS?: string;
    [key: string]: string | undefined;
  };
  /** Attribution settings (empty strings to hide) */
  attribution?: {
    commit?: string;
    pr?: string;
  };
  /** Enable extended thinking mode */
  alwaysThinkingEnabled?: boolean;
  /** Hook configurations */
  hooks?: Record<
    string,
    Array<{
      matcher?: string;
      hooks: Array<{
        type: string;
        command: string;
      }>;
    }>
  >;
  [key: string]: unknown;
}

/**
 * Default Claude Code settings for optimal experience
 */
export const DEFAULT_CLAUDE_CODE_SETTINGS: Partial<ClaudeCodeSettings> = {
  env: {
    CLAUDE_CODE_MAX_OUTPUT_TOKENS: '128000',
  },
  attribution: {
    commit: '',
    pr: '',
  },
  alwaysThinkingEnabled: true,
};

export interface HookConfig {
  notificationCommand?: string;
}

/**
 * Generate hook commands for the target
 * Uses global sylphx-flow command (users must install globally first)
 */
export const generateHookCommands = async (targetId: string): Promise<HookConfig> => {
  return {
    notificationCommand: `sylphx-flow hook --type notification --target ${targetId}`,
  };
};

/**
 * Default hook commands (fallback)
 * Simplified to only include notification hook
 */
export const DEFAULT_HOOKS: HookConfig = {
  notificationCommand: 'sylphx-flow hook --type notification --target claude-code',
};

/**
 * Parse JSON settings (pure)
 */
export const parseSettings = (content: string): Result<ClaudeCodeSettings, ConfigError> => {
  return tryCatch(
    () => JSON.parse(content) as ClaudeCodeSettings,
    (error) =>
      configError('Failed to parse Claude Code settings', {
        cause: error instanceof Error ? error : undefined,
      })
  );
};

/**
 * Build hook configuration (pure)
 */
export const buildHookConfiguration = (
  config: HookConfig = DEFAULT_HOOKS
): ClaudeCodeSettings['hooks'] => {
  const notificationCommand = config.notificationCommand || DEFAULT_HOOKS.notificationCommand!;

  return {
    Notification: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: notificationCommand,
          },
        ],
      },
    ],
  };
};

/**
 * Merge settings with defaults and new hooks (pure)
 * Preserves existing values while adding missing defaults
 */
export const mergeSettings = (
  existingSettings: ClaudeCodeSettings,
  hookConfig: HookConfig = DEFAULT_HOOKS
): ClaudeCodeSettings => {
  const newHooks = buildHookConfiguration(hookConfig);

  return {
    // Apply defaults first, then existing settings override
    ...DEFAULT_CLAUDE_CODE_SETTINGS,
    ...existingSettings,
    // Deep merge env variables
    env: {
      ...DEFAULT_CLAUDE_CODE_SETTINGS.env,
      ...(existingSettings.env || {}),
    },
    // Deep merge attribution
    attribution: {
      ...DEFAULT_CLAUDE_CODE_SETTINGS.attribution,
      ...(existingSettings.attribution || {}),
    },
    // Merge hooks
    hooks: {
      ...(existingSettings.hooks || {}),
      ...newHooks,
    },
  };
};

/**
 * Create settings with defaults and hooks (pure)
 * Includes optimal Claude Code settings for extended output, thinking mode, and clean attribution
 */
export const createSettings = (hookConfig: HookConfig = DEFAULT_HOOKS): ClaudeCodeSettings => {
  return {
    ...DEFAULT_CLAUDE_CODE_SETTINGS,
    hooks: buildHookConfiguration(hookConfig),
  };
};

/**
 * Serialize settings to JSON (pure)
 */
export const serializeSettings = (settings: ClaudeCodeSettings): string => {
  return JSON.stringify(settings, null, 2);
};

/**
 * Get success message (pure)
 */
export const getSuccessMessage = (): string => {
  return 'Claude Code hook configured: Notification';
};

/**
 * Process settings: parse existing or create new, merge hooks, serialize (pure)
 */
export const processSettings = (
  existingContent: string | null,
  hookConfig: HookConfig = DEFAULT_HOOKS
): Result<string, ConfigError> => {
  if (existingContent === null || existingContent.trim() === '') {
    // No existing settings, create new
    const settings = createSettings(hookConfig);
    return success(serializeSettings(settings));
  }

  // Parse existing settings
  const parseResult = parseSettings(existingContent);
  if (parseResult._tag === 'Failure') {
    // If parsing fails, create new settings
    const settings = createSettings(hookConfig);
    return success(serializeSettings(settings));
  }

  // Merge with existing
  const merged = mergeSettings(parseResult.value, hookConfig);
  return success(serializeSettings(merged));
};

/**
 * Validate hook configuration (pure)
 */
export const validateHookConfig = (config: HookConfig): Result<HookConfig, ConfigError> => {
  if (config.notificationCommand !== undefined && config.notificationCommand.trim() === '') {
    return failure(configError('Notification command cannot be empty'));
  }

  return success(config);
};
