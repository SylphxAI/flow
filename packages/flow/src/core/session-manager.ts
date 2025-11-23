/**
 * Session Manager (Updated for ~/.sylphx-flow)
 * Manages temporary Flow sessions with multi-project support
 * All sessions stored in ~/.sylphx-flow/sessions/
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { ProjectManager } from './project-manager.js';

export interface Session {
  projectHash: string;
  projectPath: string;
  sessionId: string;
  pid: number;
  startTime: string;
  backupPath: string;
  status: 'active' | 'completed' | 'crashed';
  target: 'claude-code' | 'opencode';
  cleanupRequired: boolean;
  // Multi-session support
  isOriginal: boolean;        // First session that created backup
  sharedBackupId: string;     // Shared backup ID for all sessions
  refCount: number;           // Number of active sessions
  activePids: number[];       // All active PIDs sharing this session
}

export class SessionManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Start a new session for a project (with multi-session support)
   */
  async startSession(
    projectPath: string,
    projectHash: string,
    target: 'claude-code' | 'opencode',
    backupPath: string
  ): Promise<{ session: Session; isFirstSession: boolean }> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Ensure sessions directory exists
    await fs.mkdir(path.dirname(paths.sessionFile), { recursive: true });

    // Check for existing session
    const existingSession = await this.getActiveSession(projectHash);

    if (existingSession) {
      // Join existing session (don't create new backup)
      existingSession.refCount++;
      existingSession.activePids.push(process.pid);

      await fs.writeFile(paths.sessionFile, JSON.stringify(existingSession, null, 2));

      return {
        session: existingSession,
        isFirstSession: false,
      };
    }

    // First session - create new
    const session: Session = {
      projectHash,
      projectPath,
      sessionId: `session-${Date.now()}`,
      pid: process.pid,
      startTime: new Date().toISOString(),
      backupPath,
      status: 'active',
      target,
      cleanupRequired: true,
      isOriginal: true,
      sharedBackupId: `session-${Date.now()}`,
      refCount: 1,
      activePids: [process.pid],
    };

    await fs.writeFile(paths.sessionFile, JSON.stringify(session, null, 2));

    return {
      session,
      isFirstSession: true,
    };
  }

  /**
   * Mark session as completed (with reference counting)
   */
  async endSession(projectHash: string): Promise<{ shouldRestore: boolean; session: Session | null }> {
    try {
      const session = await this.getActiveSession(projectHash);

      if (!session) {
        return { shouldRestore: false, session: null };
      }

      const paths = this.projectManager.getProjectPaths(projectHash);

      // Remove current PID from active PIDs
      session.activePids = session.activePids.filter(pid => pid !== process.pid);
      session.refCount = session.activePids.length;

      if (session.refCount === 0) {
        // Last session - mark completed and cleanup
        session.status = 'completed';
        session.cleanupRequired = false;

        const flowHome = this.projectManager.getFlowHomeDir();

        // Archive to history
        const historyPath = path.join(
          flowHome,
          'sessions',
          'history',
          `${session.sessionId}.json`
        );
        await fs.mkdir(path.dirname(historyPath), { recursive: true });
        await fs.writeFile(historyPath, JSON.stringify(session, null, 2));

        // Remove active session file
        await fs.unlink(paths.sessionFile);

        return { shouldRestore: true, session };
      } else {
        // Still have active sessions, update session file
        await fs.writeFile(paths.sessionFile, JSON.stringify(session, null, 2));

        return { shouldRestore: false, session };
      }
    } catch (error) {
      // Session file might not exist
      return { shouldRestore: false, session: null };
    }
  }

  /**
   * Get active session for a project
   */
  async getActiveSession(projectHash: string): Promise<Session | null> {
    try {
      const paths = this.projectManager.getProjectPaths(projectHash);
      const data = await fs.readFile(paths.sessionFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Detect orphaned sessions (from crashes) across all projects
   * Handles multi-session by checking all PIDs
   */
  async detectOrphanedSessions(): Promise<Map<string, Session>> {
    const orphaned = new Map<string, Session>();

    // Get all active projects
    const projects = await this.projectManager.getActiveProjects();

    for (const { hash } of projects) {
      const session = await this.getActiveSession(hash);

      if (!session) {
        continue;
      }

      // Check all active PIDs
      const stillRunning = [];
      for (const pid of session.activePids) {
        if (await this.checkPIDRunning(pid)) {
          stillRunning.push(pid);
        }
      }

      // Update active PIDs and refCount
      session.activePids = stillRunning;
      session.refCount = stillRunning.length;

      if (session.refCount === 0 && session.cleanupRequired) {
        // All sessions crashed
        orphaned.set(hash, session);
      } else if (session.refCount !== session.activePids.length) {
        // Some PIDs crashed, update session file
        const paths = this.projectManager.getProjectPaths(hash);
        await fs.writeFile(paths.sessionFile, JSON.stringify(session, null, 2));
      }
    }

    return orphaned;
  }

  /**
   * Check if process is still running
   */
  private async checkPIDRunning(pid: number): Promise<boolean> {
    try {
      // Send signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Recover from crashed session
   */
  async recoverSession(projectHash: string, session: Session): Promise<void> {
    session.status = 'crashed';
    session.cleanupRequired = false;

    const flowHome = this.projectManager.getFlowHomeDir();
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Archive to history
    const historyPath = path.join(flowHome, 'sessions', 'history', `${session.sessionId}.json`);
    await fs.mkdir(path.dirname(historyPath), { recursive: true });
    await fs.writeFile(historyPath, JSON.stringify(session, null, 2));

    // Remove active session
    try {
      await fs.unlink(paths.sessionFile);
    } catch {
      // File might not exist
    }
  }

  /**
   * Clean up old session history
   */
  async cleanupOldSessions(keepLast: number = 10): Promise<void> {
    const flowHome = this.projectManager.getFlowHomeDir();
    const historyDir = path.join(flowHome, 'sessions', 'history');

    if (!existsSync(historyDir)) {
      return;
    }

    const files = await fs.readdir(historyDir);
    const sessions = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(historyDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const session = JSON.parse(data) as Session;
        return { file, session };
      })
    );

    // Sort by start time (newest first)
    sessions.sort(
      (a, b) =>
        new Date(b.session.startTime).getTime() -
        new Date(a.session.startTime).getTime()
    );

    // Remove old sessions
    const toRemove = sessions.slice(keepLast);
    for (const { file } of toRemove) {
      await fs.unlink(path.join(historyDir, file));
    }
  }
}
