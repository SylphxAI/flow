/**
 * Claude Code Session Resolver
 *
 * Resolves session IDs from Claude Code's data files, bypassing the
 * built-in session picker which is unreliable with large project directories.
 *
 * Data model:
 * - ~/.claude/projects/{encoded-path}/ — session .jsonl files (filename = session ID)
 * - ~/.claude/history.jsonl — global log with {timestamp, project, sessionId} per user message
 * - Snapshot-only files have type: "file-history-snapshot" and are tiny (<5KB)
 * - Real sessions have type: "user" messages and are much larger
 */

import fs from 'node:fs/promises';
import { open } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** Minimum file size in bytes to consider a session file "real" (not just a snapshot) */
const MIN_SESSION_SIZE_BYTES = 2048;

/** Number of bytes to read from the tail of history.jsonl */
const HISTORY_TAIL_BYTES = 65_536;

/** Session info returned by listProjectSessions */
export interface SessionInfo {
  id: string;
  modifiedAt: Date;
  sizeBytes: number;
}

/**
 * Encode a project path the same way Claude Code does.
 * /Users/kyle/flow → -Users-kyle-flow
 */
function encodeProjectPath(projectPath: string): string {
  return projectPath.replace(/\//g, '-');
}

/**
 * Get the Claude Code home directory.
 */
function getClaudeHome(): string {
  return path.join(os.homedir(), '.claude');
}

/**
 * Find the most recent session ID for a project by reading the tail of history.jsonl.
 *
 * Reads only the last ~64KB of the file (not the full 20MB+ file) for performance.
 * Returns null if no sessions found for the given project path.
 */
export async function findLastSessionId(projectPath: string): Promise<string | null> {
  const historyPath = path.join(getClaudeHome(), 'history.jsonl');

  let fd: Awaited<ReturnType<typeof open>> | null = null;
  try {
    fd = await open(historyPath, 'r');
    const stat = await fd.stat();

    if (stat.size === 0) {
      return null;
    }

    // Read the tail of the file
    const readSize = Math.min(HISTORY_TAIL_BYTES, stat.size);
    const offset = stat.size - readSize;
    const buffer = Buffer.alloc(readSize);
    await fd.read(buffer, 0, readSize, offset);

    const content = buffer.toString('utf-8');
    const lines = content.split('\n').filter(Boolean);

    // Walk backwards through lines to find the last session for this project
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];

      // Skip partial lines at the start of the buffer (if we started mid-line)
      if (i === 0 && offset > 0) {
        // First line in buffer may be truncated — skip it
        continue;
      }

      try {
        const entry = JSON.parse(line);
        if (entry.sessionId && entry.project === projectPath) {
          return entry.sessionId;
        }
      } catch {
        // Skip malformed lines
        continue;
      }
    }

    return null;
  } catch (error) {
    // File doesn't exist or can't be read — no sessions
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  } finally {
    await fd?.close();
  }
}

/**
 * List all real sessions for a project from the project directory.
 *
 * Reads ~/.claude/projects/{encoded-path}/, stats each .jsonl file,
 * filters out snapshot-only files (< 2KB), returns sorted by mtime descending.
 */
export async function listProjectSessions(projectPath: string): Promise<SessionInfo[]> {
  const encoded = encodeProjectPath(projectPath);
  const projectDir = path.join(getClaudeHome(), 'projects', encoded);

  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(projectDir);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const jsonlFiles = entries.filter((f) => f.endsWith('.jsonl'));

  // Stat all files in parallel
  const statResults = await Promise.all(
    jsonlFiles.map(async (filename) => {
      const filePath = path.join(projectDir, filename);
      try {
        const stat = await fs.stat(filePath);
        return {
          id: filename.replace(/\.jsonl$/, ''),
          modifiedAt: stat.mtime,
          sizeBytes: stat.size,
        };
      } catch {
        // File may have been deleted between readdir and stat
        return null;
      }
    })
  );

  return statResults
    .filter((s): s is SessionInfo => s !== null && s.sizeBytes >= MIN_SESSION_SIZE_BYTES)
    .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}

/** Type guard for Node.js errors with errno/code properties */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
