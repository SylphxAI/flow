#!/usr/bin/env node
/**
 * Hook command - Claude Code hook handlers
 *
 * Purpose: Handle Claude Code lifecycle hooks:
 * - notification: OS-level notification when Claude Code starts
 * - session-start: Load durable memory (MEMORY.md + recent daily logs)
 *
 * DESIGN RATIONALE:
 * - Each hook type returns content to stdout (Claude Code injects as context)
 * - Cross-platform notifications (macOS, Linux, Windows)
 * - SessionStart hook loads cross-session memory at startup
 */

import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { Command } from 'commander';
import { cli } from '../utils/display/cli-output.js';

/**
 * Hook input from Claude Code via stdin.
 * Claude Code sends JSON context about the event — we read what we need.
 */
interface HookInput {
  /** Notification message text */
  message?: string;
  /** Notification title */
  title?: string;
  /** Notification type (permission_prompt, idle_prompt, etc.) */
  notification_type?: string;
  /** How the session started (startup, resume, clear, compact) */
  source?: string;
  /** Current working directory */
  cwd?: string;
}

const execAsync = promisify(exec);

/**
 * Hook types supported — single source of truth for both type and runtime validation
 */
const VALID_HOOK_TYPES = ['notification', 'session-start'] as const;
type HookType = (typeof VALID_HOOK_TYPES)[number];
const VALID_HOOK_TYPE_SET = new Set<string>(VALID_HOOK_TYPES);

/**
 * Target platforms supported
 */
type TargetPlatform = 'claude-code';

/**
 * Create the hook command
 */
export const hookCommand = new Command('hook')
  .description('Handle Claude Code lifecycle hooks (notification, memory)')
  .requiredOption('--type <type>', 'Hook type (notification | session-start)')
  .option('--target <target>', 'Target platform (claude-code)', 'claude-code')
  .option('--verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      const hookType = options.type as string;
      const target = options.target as TargetPlatform;

      // Validate hook type
      if (!VALID_HOOK_TYPE_SET.has(hookType)) {
        throw new Error(
          `Invalid hook type: ${hookType}. Must be one of: ${VALID_HOOK_TYPES.join(', ')}`
        );
      }

      // Validate target
      if (target !== 'claude-code') {
        throw new Error(`Invalid target: ${target}. Only 'claude-code' is currently supported`);
      }

      // Read hook input from stdin (Claude Code passes JSON context)
      const hookInput = await readStdinInput();

      // Load and display content based on hook type
      const content = await loadHookContent(hookType as HookType, target, hookInput, options.verbose);

      // Output the content (no extra formatting, just the content)
      console.log(content);

      // Explicitly exit to ensure process terminates
      // REASON: Even with parseAsync(), the process may not exit due to:
      // 1. Logger instances keeping event loop active
      // 2. Other global resources (timers, listeners) not being cleaned up
      // 3. This is a short-lived CLI command that should exit immediately after output
      // Many CLI tools use process.exit() for this reason - it's the right pattern here
      process.exit(0);
    } catch (error) {
      cli.error(
        `Failed to load hook content: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

/**
 * Read JSON input from stdin (non-blocking, returns empty object if no input)
 * Claude Code sends event context as JSON on stdin for all hook types.
 */
async function readStdinInput(): Promise<HookInput> {
  // stdin is not a TTY when piped from Claude Code
  if (process.stdin.isTTY) {
    return {};
  }

  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      if (!data.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data) as HookInput);
      } catch {
        resolve({});
      }
    });
    // Safety timeout — don't hang if stdin never closes
    setTimeout(() => resolve({}), 1000);
  });
}

/**
 * Load content for a specific hook type and target
 */
async function loadHookContent(
  hookType: HookType,
  _target: TargetPlatform,
  input: HookInput,
  verbose: boolean = false
): Promise<string> {
  switch (hookType) {
    case 'notification':
      return await sendNotification(input, verbose);
    case 'session-start':
      return await loadSessionStartContent(verbose);
  }
}

/**
 * Read a file and return its contents, or empty string if not found
 */
async function readFileIfExists(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load memory files for session start:
 * - MEMORY.md (curated long-term memory)
 * - memory/{today}.md (today's daily log)
 * - memory/{yesterday}.md (yesterday's daily log)
 *
 * Returns concatenated content to stdout for Claude Code context injection
 */
async function loadSessionStartContent(verbose: boolean): Promise<string> {
  const cwd = process.cwd();
  const sections: string[] = [];

  // Load MEMORY.md
  const memoryPath = path.join(cwd, 'MEMORY.md');
  const memoryContent = await readFileIfExists(memoryPath);
  if (memoryContent.trim()) {
    sections.push(`## MEMORY.md\n${memoryContent.trim()}`);
    if (verbose) {
      cli.info('Loaded MEMORY.md');
    }
  }

  // Calculate today and yesterday dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

  // Load today's daily log
  const todayPath = path.join(cwd, 'memory', `${todayStr}.md`);
  const todayContent = await readFileIfExists(todayPath);
  if (todayContent.trim()) {
    sections.push(`## memory/${todayStr}.md\n${todayContent.trim()}`);
    if (verbose) {
      cli.info(`Loaded memory/${todayStr}.md`);
    }
  }

  // Load yesterday's daily log
  const yesterdayPath = path.join(cwd, 'memory', `${yesterdayStr}.md`);
  const yesterdayContent = await readFileIfExists(yesterdayPath);
  if (yesterdayContent.trim()) {
    sections.push(`## memory/${yesterdayStr}.md\n${yesterdayContent.trim()}`);
    if (verbose) {
      cli.info(`Loaded memory/${yesterdayStr}.md`);
    }
  }

  if (verbose && sections.length === 0) {
    cli.info('No memory files found');
  }

  return sections.join('\n\n');
}

/**
 * Send OS-level notification using event data from Claude Code.
 * Falls back to generic message when stdin input is missing.
 */
async function sendNotification(input: HookInput, verbose: boolean): Promise<string> {
  const title = input.title || '🔮 Sylphx Flow';
  const message = input.message || 'Claude Code is ready';
  const platform = os.platform();

  if (verbose) {
    cli.info(`Sending notification on ${platform}...`);
  }

  try {
    switch (platform) {
      case 'darwin':
        await sendMacNotification(title, message);
        break;
      case 'linux':
        await sendLinuxNotification(title, message);
        break;
      case 'win32':
        await sendWindowsNotification(title, message);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return ''; // Notifications don't output to stdout
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (verbose) {
      cli.error(`Failed to send notification: ${errorMsg}`);
    }
    // Don't fail the hook, just silently skip notification
    return '';
  }
}

/**
 * Send notification on macOS using terminal-notifier or osascript
 */
async function sendMacNotification(title: string, message: string): Promise<void> {
  const iconPath = '/Users/kyle/flow/assets/icons/flow-notification-icon.png';

  // Try terminal-notifier if available (supports custom icons)
  try {
    await execAsync('which terminal-notifier');
    await execAsync(
      `terminal-notifier -message "${escapeForShell(message)}" -title "${escapeForShell(title)}" -appIcon "${iconPath}"`
    );
  } catch {
    // Fallback to osascript if terminal-notifier not available
    // Note: osascript doesn't support custom icons, will show Terminal app icon
    const script = `display notification "${escapeForAppleScript(message)}" with title "${escapeForAppleScript(title)}"`;
    await execAsync(`osascript -e '${script}'`);
  }
}

/**
 * Send notification on Linux using notify-send
 */
async function sendLinuxNotification(title: string, message: string): Promise<void> {
  // Try to use notify-send, fail silently if not available
  try {
    await execAsync('which notify-send');
    // Use Flow-themed spiral emoji as icon for Sylphx Flow
    await execAsync(`notify-send -i "🌀" "${escapeForShell(title)}" "${escapeForShell(message)}"`);
  } catch {
    // notify-send not available, skip notification silently
  }
}

/**
 * Send notification on Windows using PowerShell
 */
async function sendWindowsNotification(title: string, message: string): Promise<void> {
  const script = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

$template = @"
<toast>
    <visual>
        <binding template="ToastImageAndText02">
            <image id="1" src="%SystemRoot%\\System32\\Shell32.dll,-16739" alt="info icon"/>
            <text id="1">${escapeForXml(title)}</text>
            <text id="2">${escapeForXml(message)}</text>
        </binding>
    </visual>
</toast>
"@

$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Claude Code").Show($toast)
`;

  await execAsync(`powershell -Command "${escapeForPowerShell(script)}"`);
}

/**
 * Escape string for AppleScript
 */
function escapeForAppleScript(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Escape string for shell
 */
function escapeForShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');
}

/**
 * Escape string for XML
 */
function escapeForXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape string for PowerShell
 */
function escapeForPowerShell(str: string): string {
  return str.replace(/"/g, '""');
}
