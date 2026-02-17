/**
 * Sessions Command
 *
 * Lists Claude Code sessions for the current project so users can
 * pick one to resume, instead of relying on Claude Code's unreliable picker.
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { type SessionInfo, listProjectSessions } from '../targets/functional/claude-session.js';

/**
 * Format bytes into a human-readable size string.
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format a date into a relative time string.
 */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

/**
 * Format a session row for the table output.
 */
function formatSessionRow(session: SessionInfo, isLatest: boolean): string {
  const id = chalk.white(session.id);
  const time = formatRelativeTime(session.modifiedAt).padEnd(18);
  const size = formatSize(session.sizeBytes).padStart(8);
  const marker = isLatest ? chalk.green('  \u2190 latest') : '';

  return `  ${id}  ${chalk.dim(time)}  ${chalk.dim(size)}${marker}`;
}

export const sessionsCommand = new Command('sessions')
  .description('List Claude Code sessions for the current project')
  .action(async () => {
    const cwd = process.cwd();
    const sessions = await listProjectSessions(cwd);

    if (sessions.length === 0) {
      console.log(chalk.yellow('\n  No sessions found for this project.\n'));
      console.log(chalk.dim(`  Project: ${cwd}`));
      console.log(chalk.dim('  Start a new session with: flow\n'));
      return;
    }

    console.log(`\n${chalk.cyan.bold('  Sessions')} ${chalk.dim(`for ${cwd}`)}\n`);

    // Header
    console.log(
      `  ${chalk.dim.bold('ID'.padEnd(36))}  ${chalk.dim.bold('Last active'.padEnd(18))}  ${chalk.dim.bold('Size'.padStart(8))}`
    );
    console.log(chalk.dim(`  ${'─'.repeat(36)}  ${'─'.repeat(18)}  ${'─'.repeat(8)}`));

    // Rows
    for (let i = 0; i < sessions.length; i++) {
      console.log(formatSessionRow(sessions[i], i === 0));
    }

    // Footer hint
    const latestId = sessions[0].id;
    const shortId = latestId.slice(0, 8);
    console.log('');
    console.log(chalk.dim(`  Resume latest:  ${chalk.white(`flow --resume`)}`));
    console.log(chalk.dim(`  Resume by ID:   ${chalk.white(`flow --resume ${shortId}`)}`));
    console.log('');
  });
