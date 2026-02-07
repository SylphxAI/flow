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
import { success, tryCatch } from '../../core/functional/result.js';

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
 * Default environment variables injected into the Claude Code process
 */
export const DEFAULT_CLAUDE_CODE_ENV: Record<string, string> = {
  CLAUDE_CODE_MAX_OUTPUT_TOKENS: '128000',
  CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1',
};

/**
 * Default Claude Code settings for optimal experience
 */
const DEFAULT_CLAUDE_CODE_SETTINGS: Partial<ClaudeCodeSettings> = {
  env: DEFAULT_CLAUDE_CODE_ENV,
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
const DEFAULT_HOOKS: HookConfig = {
  notificationCommand: 'sylphx-flow hook --type notification --target claude-code',
};

/**
 * Process settings: parse existing or create new, merge hooks, serialize (pure)
 */
export const processSettings = (
  existingContent: string | null,
  hookConfig: HookConfig = DEFAULT_HOOKS
): Result<string, ConfigError> => {
  const notificationCommand = hookConfig.notificationCommand || DEFAULT_HOOKS.notificationCommand!;

  const hookConfiguration: ClaudeCodeSettings['hooks'] = {
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

  const createNewSettings = (): ClaudeCodeSettings => ({
    ...DEFAULT_CLAUDE_CODE_SETTINGS,
    hooks: hookConfiguration,
  });

  const serialize = (settings: ClaudeCodeSettings): string =>
    JSON.stringify(settings, null, 2);

  if (existingContent === null || existingContent.trim() === '') {
    return success(serialize(createNewSettings()));
  }

  // Parse existing settings
  const parseResult = tryCatch(
    () => JSON.parse(existingContent) as ClaudeCodeSettings,
    (error) =>
      configError('Failed to parse Claude Code settings', {
        cause: error instanceof Error ? error : undefined,
      })
  );

  if (parseResult._tag === 'Failure') {
    return success(serialize(createNewSettings()));
  }

  // Merge with existing
  const existingSettings = parseResult.value;
  const merged: ClaudeCodeSettings = {
    ...DEFAULT_CLAUDE_CODE_SETTINGS,
    ...existingSettings,
    env: {
      ...DEFAULT_CLAUDE_CODE_SETTINGS.env,
      ...(existingSettings.env || {}),
    },
    attribution: {
      ...DEFAULT_CLAUDE_CODE_SETTINGS.attribution,
      ...(existingSettings.attribution || {}),
    },
    hooks: {
      ...(existingSettings.hooks || {}),
      ...hookConfiguration,
    },
  };

  return success(serialize(merged));
};
