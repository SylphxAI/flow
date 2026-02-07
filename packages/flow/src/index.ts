#!/usr/bin/env bun
/**
 * Sylphx Flow CLI
 * AI-powered development flow management
 */

import { Command } from 'commander';
// @ts-expect-error - Bun resolves JSON imports
import pkg from '../package.json';
import { executeFlow } from './commands/flow/execute-v2.js';
import {
  doctorCommand,
  flowCommand,
  quickstartCommand,
  setupCommand,
  statusCommand,
  upgradeCommand,
} from './commands/flow-command.js';
import { hookCommand } from './commands/hook-command.js';
import { settingsCommand } from './commands/settings-command.js';
import { UserCancelledError } from './utils/errors.js';

const VERSION = pkg.version;

/**
 * Create the main CLI application with enhanced Commander.js configuration
 */
export function createCLI(): Command {
  const program = new Command();

  // Configure main program with better defaults
  program
    .name('sylphx-flow')
    .description('Sylphx Flow - Type-safe development flow CLI')
    .version(VERSION, '-V, --version', 'Show version number')
    .helpOption('-h, --help', 'Display help for command')
    .configureHelp({
      sortSubcommands: true,
      showGlobalOptions: true,
    });

  // Enable strict mode for better error handling
  program.configureOutput({
    writeErr: (str) => process.stderr.write(str),
    writeOut: (str) => process.stdout.write(str),
  });

  // Default action: delegate to flow command for convenience
  // This allows `sylphx-flow "prompt"` instead of requiring `sylphx-flow flow "prompt"`
  program
    .argument(
      '[prompt]',
      'Prompt to execute with agent (optional, supports @file.txt for file input)'
    )
    .option('--agent <name>', 'Agent to use (default: builder)', 'builder')
    .option('--agent-file <path>', 'Load agent from specific file')
    .option('--verbose', 'Show detailed output')
    .option('--dry-run', 'Show what would be done without making changes')
    .option('-p, --print', 'Headless print mode (output only, no interactive)')
    .option('-c, --continue', 'Continue previous conversation (requires print mode)')
    .option('--merge', 'Merge Flow settings with existing settings (default: replace all)')

    .action(async (prompt, options) => {
      await executeFlow(prompt, options);
    });

  // Add subcommands - these can still be used explicitly
  program.addCommand(flowCommand);
  program.addCommand(quickstartCommand);
  program.addCommand(setupCommand);
  program.addCommand(statusCommand);
  program.addCommand(doctorCommand);
  program.addCommand(upgradeCommand);
  program.addCommand(hookCommand);
  program.addCommand(settingsCommand);

  return program;
}

/**
 * Run the CLI application with enhanced error handling and process management
 */
export async function runCLI(): Promise<void> {
  const program = createCLI();

  // Set up global error handling before parsing
  setupGlobalErrorHandling();

  try {
    // Parse and execute commands - use parseAsync for async actions
    await program.parseAsync(process.argv);
  } catch (error) {
    handleCommandError(error);
  }
}

/**
 * Set up global error handlers for uncaught exceptions and unhandled rejections
 */
function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections (non-fatal, log only)
  process.on('unhandledRejection', (reason) => {
    // Ignore AbortError — expected when user cancels operations
    if (reason instanceof Error && reason.name === 'AbortError') {
      return;
    }
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.error('✗ Unhandled Promise Rejection:', reason);
    }
  });

  // SIGINT/SIGTERM are handled by CleanupHandler which does async backup restoration.
  // DO NOT register handlers here — process.exit() would preempt cleanup.
}

/**
 * Handle command execution errors with proper formatting
 */
function handleCommandError(error: unknown): void {
  if (error instanceof Error) {
    // Handle user cancellation gracefully
    if (error instanceof UserCancelledError) {
      console.log('\n⚠️  Operation cancelled by user\n');
      process.exit(0);
    }

    // Handle Commander.js specific errors
    if (error.name === 'CommanderError') {
      const commanderError = error as Error & { code?: string; exitCode?: number };

      // Don't exit for help or version commands - they should already be handled
      if (commanderError.code === 'commander.help' || commanderError.code === 'commander.version') {
        return;
      }

      // For other Commander.js errors, show the message and exit
      console.error(`✗ ${commanderError.message}`);
      process.exit(commanderError.exitCode || 1);
    }

    // Handle CLI errors with better formatting
    console.error(`✗ Error: ${error.message}`);

    // Show stack trace in development mode
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  } else {
    console.error(`✗ Unknown error: ${String(error)}`);
  }

  process.exit(1);
}

// Execute CLI when run as script
(async () => {
  try {
    await runCLI();
  } catch (error) {
    handleCommandError(error);
  }
})();
