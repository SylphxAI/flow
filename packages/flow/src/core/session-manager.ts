/**
 * Session Manager — PID-based ground truth
 *
 * Replaces state-flag session tracking with PID liveness checks.
 * PID liveness (`kill(pid, 0)`) is the single source of truth.
 *
 * Storage structure:
 *   ~/.sylphx-flow/sessions/<project-hash>/
 *     backup.json              — Backup reference (exists = workspace modified)
 *     pids/
 *       <pid>.json             — Per-process lock file
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import createDebug from 'debug';
import { readJsonFileSafe } from '../utils/files/file-operations.js';
import type { ProjectManager } from './project-manager.js';

const debug = createDebug('flow:session');

/** Per-process lock file content */
export interface PidLock {
  pid: number;
  startTime: string;
  target: string;
  projectPath: string;
}

/** Backup reference — written by first session, deleted after restore */
export interface BackupRef {
  sessionId: string;
  backupPath: string;
  projectPath: string;
  target: string;
  createdAt: string;
  createdByPid: number;
}

export class SessionManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Acquire a session slot for this process.
   *
   * Uses atomic `mkdir(pidsDir)` (without `recursive`) for first-session detection:
   * - EEXIST → another session already exists (join)
   * - Success → this is the first session (create backup.json)
   */
  async acquireSession(
    projectHash: string,
    projectPath: string,
    target: string,
    backupInfo?: { sessionId: string; backupPath: string }
  ): Promise<{ isFirstSession: boolean; backupRef: BackupRef | null }> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Ensure the session directory exists
    await fs.mkdir(paths.sessionDir, { recursive: true });

    let isFirstSession = false;

    try {
      // Atomic mkdir — fails with EEXIST if pids/ already exists
      await fs.mkdir(paths.pidsDir);
      isFirstSession = true;
    } catch (error: unknown) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        // Another session already created pids/ — we're joining
        isFirstSession = false;
      } else {
        throw error;
      }
    }

    // Write our PID lock file
    const pidLock: PidLock = {
      pid: process.pid,
      startTime: new Date().toISOString(),
      target,
      projectPath,
    };
    await fs.writeFile(
      path.join(paths.pidsDir, `${process.pid}.json`),
      JSON.stringify(pidLock, null, 2)
    );

    if (isFirstSession && backupInfo) {
      // First session — write backup reference
      const backupRef: BackupRef = {
        sessionId: backupInfo.sessionId,
        backupPath: backupInfo.backupPath,
        projectPath,
        target,
        createdAt: new Date().toISOString(),
        createdByPid: process.pid,
      };
      await fs.writeFile(paths.backupRefFile, JSON.stringify(backupRef, null, 2));
      return { isFirstSession: true, backupRef };
    }

    // Join — read existing backup ref
    const backupRef = await this.getBackupRef(projectHash);
    return { isFirstSession, backupRef };
  }

  /**
   * Release this process's session slot.
   *
   * Deletes own PID file, scans remaining, checks liveness.
   * Returns `shouldRestore=true` only when no alive PIDs remain.
   */
  async releaseSession(
    projectHash: string
  ): Promise<{ shouldRestore: boolean; backupRef: BackupRef | null }> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Delete own PID file
    try {
      await fs.unlink(path.join(paths.pidsDir, `${process.pid}.json`));
    } catch {
      // PID file might not exist (double-cleanup)
    }

    // Scan remaining PID files
    const alivePids = await this.scanAlivePids(paths.pidsDir);

    if (alivePids.length > 0) {
      // Other sessions still running
      return { shouldRestore: false, backupRef: null };
    }

    // No alive PIDs — this is the last session
    const backupRef = await this.getBackupRef(projectHash);
    return { shouldRestore: backupRef !== null, backupRef };
  }

  /**
   * Finalize session cleanup — called AFTER restoreBackup() succeeds.
   * Deletes backup.json, pids/, and the session directory.
   */
  async finalizeSessionCleanup(projectHash: string): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const flowHome = this.projectManager.getFlowHomeDir();

    // Archive backup ref to history before deleting
    const backupRef = await this.getBackupRef(projectHash);
    if (backupRef) {
      const historyPath = path.join(
        flowHome,
        'sessions',
        'history',
        `${backupRef.sessionId}.json`
      );
      await fs.mkdir(path.dirname(historyPath), { recursive: true });
      await fs.writeFile(
        historyPath,
        JSON.stringify({ ...backupRef, status: 'completed', finalizedAt: new Date().toISOString() }, null, 2)
      );
    }

    // Remove entire session directory (backup.json + pids/)
    try {
      await fs.rm(paths.sessionDir, { recursive: true, force: true });
    } catch {
      // Directory might already be gone
    }
  }

  /**
   * Detect orphaned sessions — backup.json exists but no alive PIDs.
   * Scans all session directories, not individual files.
   */
  async detectOrphanedSessions(): Promise<Map<string, BackupRef>> {
    const orphaned = new Map<string, BackupRef>();
    const projects = await this.projectManager.getActiveProjects();

    for (const { hash } of projects) {
      const paths = this.projectManager.getProjectPaths(hash);

      // Must have backup.json to be a recoverable session
      const backupRef = await this.getBackupRef(hash);
      if (!backupRef) {
        // No backup.json — clean up stale session directory
        try {
          await fs.rm(paths.sessionDir, { recursive: true, force: true });
        } catch {
          debug('failed to clean stale session dir for %s', hash);
        }
        continue;
      }

      // Check if any PIDs are still alive
      const alivePids = await this.scanAlivePids(paths.pidsDir);

      if (alivePids.length === 0) {
        // All PIDs dead — orphaned session
        orphaned.set(hash, backupRef);
      }
      // If alive PIDs exist, session is active — leave it alone
    }

    return orphaned;
  }

  /**
   * Get backup reference for a project (null if no active session)
   */
  async getBackupRef(projectHash: string): Promise<BackupRef | null> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    return readJsonFileSafe<BackupRef | null>(paths.backupRefFile, null);
  }

  /**
   * Check if a session is active (any alive PIDs for this project)
   */
  async isSessionActive(projectHash: string): Promise<boolean> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    if (!existsSync(paths.backupRefFile)) {
      return false;
    }

    const alivePids = await this.scanAlivePids(paths.pidsDir);
    return alivePids.length > 0;
  }

  /**
   * Scan PID directory, check liveness, clean dead PID files.
   * Returns list of alive PIDs.
   */
  private async scanAlivePids(pidsDir: string): Promise<number[]> {
    if (!existsSync(pidsDir)) {
      return [];
    }

    let files: string[];
    try {
      files = await fs.readdir(pidsDir);
    } catch {
      return [];
    }

    const alivePids: number[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }

      const pid = parseInt(file.replace('.json', ''), 10);
      if (isNaN(pid)) {
        continue;
      }

      if (this.isPidAlive(pid)) {
        alivePids.push(pid);
      } else {
        // Clean dead PID file
        try {
          await fs.unlink(path.join(pidsDir, file));
        } catch {
          // Ignore — might be cleaned by another process
        }
      }
    }

    return alivePids;
  }

  /**
   * Check if a process is alive via kill(pid, 0).
   * - Success → alive (same user)
   * - EPERM → alive (different user, e.g. PID 1)
   * - ESRCH → dead
   */
  private isPidAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error: unknown) {
      // EPERM = process exists but we can't signal it (different user)
      if (isErrnoException(error) && error.code === 'EPERM') {
        return true;
      }
      // ESRCH = no such process
      return false;
    }
  }

  /**
   * Prune old session history files to prevent unbounded accumulation.
   * Keeps the most recent N history entries.
   */
  async cleanupSessionHistory(keepLast: number = 50): Promise<void> {
    const flowHome = this.projectManager.getFlowHomeDir();
    const historyDir = path.join(flowHome, 'sessions', 'history');

    if (!existsSync(historyDir)) {
      return;
    }

    const files = await fs.readdir(historyDir);
    const sessionFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort() // session-{timestamp}.json sorts chronologically
      .reverse(); // newest first

    // Delete files beyond keepLast
    for (const file of sessionFiles.slice(keepLast)) {
      try {
        await fs.unlink(path.join(historyDir, file));
      } catch {
        // Ignore errors — file might already be deleted
      }
    }
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
