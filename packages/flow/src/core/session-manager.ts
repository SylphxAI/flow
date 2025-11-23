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
}

export class SessionManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Start a new session for a project
   */
  async startSession(
    projectPath: string,
    projectHash: string,
    target: 'claude-code' | 'opencode',
    backupPath: string
  ): Promise<Session> {
    const paths = this.projectManager.getProjectPaths(projectHash);

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
    };

    // Ensure sessions directory exists
    await fs.mkdir(path.dirname(paths.sessionFile), { recursive: true });

    await fs.writeFile(paths.sessionFile, JSON.stringify(session, null, 2));

    return session;
  }

  /**
   * Mark session as completed
   */
  async endSession(projectHash: string, sessionId: string): Promise<void> {
    try {
      const session = await this.getActiveSession(projectHash);

      if (session && session.sessionId === sessionId) {
        session.status = 'completed';
        session.cleanupRequired = false;

        const paths = this.projectManager.getProjectPaths(projectHash);
        const flowHome = this.projectManager.getFlowHomeDir();

        // Archive to history
        const historyPath = path.join(flowHome, 'sessions', 'history', `${sessionId}.json`);
        await fs.mkdir(path.dirname(historyPath), { recursive: true });
        await fs.writeFile(historyPath, JSON.stringify(session, null, 2));

        // Remove active session
        await fs.unlink(paths.sessionFile);
      }
    } catch (error) {
      // Session file might not exist, that's ok
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

      // Check if PID is still running
      const isRunning = await this.checkPIDRunning(session.pid);

      if (!isRunning && session.cleanupRequired) {
        orphaned.set(hash, session);
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
