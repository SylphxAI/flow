# Temporary Environment Design V2 (臨時環境設計 - 修訂版)

## 核心理念

**依附模式 (Attach Mode)**: 直接在用戶現有環境上疊加 Flow 內容，運行完恢復原狀。
- 不需要安裝流程
- 不需要詢問用戶刪除/保留
- 直接 merge，用完恢復
- 全局存儲在 `~/.sylphx-flow/`

## 多項目支持

用戶可能同時在多個項目使用 Flow：
```
~/project-a/  → sylphx-flow run
~/project-b/  → sylphx-flow run (同時進行)
~/project-c/  → sylphx-flow run
```

所有數據存在 `~/.sylphx-flow/`，按項目路徑隔離。

## 文件結構

```
~/.sylphx-flow/
├── settings.json                 # Global Flow settings (已存在)
├── sessions/                     # 活動會話
│   ├── {project-hash-1}.json     # Project A 的會話
│   ├── {project-hash-2}.json     # Project B 的會話
│   └── {project-hash-3}.json     # Project C 的會話
├── backups/                      # 項目備份
│   ├── {project-hash-1}/         # Project A 的備份
│   │   ├── session-1234567890/
│   │   │   ├── target-config.json      # 備份元數據
│   │   │   ├── .claude/                # 完整備份 (如果是 claude-code)
│   │   │   ├── .opencode/              # 完整備份 (如果是 opencode)
│   │   │   └── manifest.json           # 備份清單
│   │   └── latest -> session-xxx       # 符號連結
│   └── {project-hash-2}/         # Project B 的備份
├── secrets/                      # 敏感信息 (按項目)
│   ├── {project-hash-1}/
│   │   └── mcp-env.json
│   └── {project-hash-2}/
│       └── mcp-env.json
└── templates/                    # Flow 模板 (全局共享)
    ├── claude-code/
    │   ├── agents/
    │   ├── commands/
    │   └── rules/
    └── opencode/
        ├── agents/
        └── modes/
```

## 項目識別

使用項目路徑的 hash 作為唯一標識：

```typescript
import crypto from 'node:crypto'

function getProjectHash(projectPath: string): string {
  // 使用絕對路徑的 hash (短版本，避免太長)
  return crypto
    .createHash('sha256')
    .update(path.resolve(projectPath))
    .digest('hex')
    .substring(0, 16)  // 取前 16 位
}

// Example:
// /Users/kyle/project-a → a1b2c3d4e5f6g7h8
// /Users/kyle/project-b → i9j0k1l2m3n4o5p6
```

## 工作流程 (簡化版)

```
啟動 sylphx-flow
  ↓
檢測項目路徑 → 生成 project-hash
  ↓
檢查 ~/.sylphx-flow/sessions/{project-hash}.json
  ↓
如果存在 orphaned session → 自動恢復備份 (crash recovery)
  ↓
創建新備份到 ~/.sylphx-flow/backups/{project-hash}/session-{timestamp}/
  ↓
提取並保存 secrets (如果有 MCP)
  ↓
依附 (Attach): 直接 merge Flow 模板到項目
  ↓
運行 Agent
  ↓
退出 (正常/Crash)
  ↓
恢復備份 (立即或下次啟動)
  ↓
清理 session 文件
```

## 依附策略 (Attach Strategy)

### 原則：Merge 而非替換

1. **Agents** (`.claude/agents/*.md`)
   - Flow agents: 直接添加 (coder.md, reviewer.md, writer.md)
   - User agents: 保留不動
   - **不詢問，直接共存**

2. **Commands** (`.claude/commands/*.md`)
   - Flow commands: 直接添加
   - User commands: 保留不動
   - **不詢問，直接共存**

3. **Rules** (`.claude/agents/AGENTS.md` or `.opencode/AGENTS.md`)
   - Flow rules: append 到文件末尾
   - User rules: 保留在前面
   - **Merge (concat)**

4. **MCP Servers** (`.claude/settings.json` or `.opencode/.mcp.json`)
   - Flow MCP: 添加到 servers 對象
   - User MCP: 保留不動
   - **Merge objects**
   - **提取 env secrets 到 ~/.sylphx-flow/secrets/**

5. **Hooks** (`.claude/hooks/*.js`)
   - Flow hooks: 直接添加
   - User hooks: 保留不動
   - **不詢問，直接共存**

6. **單一文件** (`CLAUDE.md`, `.cursorrules` 等)
   - 如果存在: **append Flow 內容** (用分隔符)
   - 如果不存在: 創建新文件
   - **Merge (concat with separator)**

### Merge 示例

#### AGENTS.md (Rules)
```markdown
# Original User Content
[User's existing rules...]

<!-- ========== Sylphx Flow Rules (Auto-injected) ========== -->

# Flow Rules
[Flow rules content...]

<!-- ========== End of Sylphx Flow Rules ========== -->
```

#### CLAUDE.md
```markdown
# Original User Prompt
[User's existing prompt...]

---
**Sylphx Flow Enhancement:**

[Flow's additional prompts...]
```

#### MCP Settings (settings.json)
```json
{
  "mcp": {
    "servers": {
      "user-github": {  // ← User's existing MCP
        "command": "...",
        "env": { "GITHUB_TOKEN": "..." }
      },
      "sylphx-filesystem": {  // ← Flow's MCP
        "command": "...",
        "args": [...]
      }
    }
  }
}
```

## Session 數據結構

### Active Session (`~/.sylphx-flow/sessions/{project-hash}.json`)
```json
{
  "projectHash": "a1b2c3d4e5f6g7h8",
  "projectPath": "/Users/kyle/project-a",
  "sessionId": "session-1234567890",
  "pid": 12345,
  "startTime": "2025-01-15T04:30:00Z",
  "target": "claude-code",
  "backupPath": "~/.sylphx-flow/backups/a1b2c3d4e5f6g7h8/session-1234567890",
  "status": "active",
  "cleanupRequired": true
}
```

### Backup Manifest (`manifest.json`)
```json
{
  "sessionId": "session-1234567890",
  "timestamp": "2025-01-15T04:30:00Z",
  "projectPath": "/Users/kyle/project-a",
  "target": "claude-code",
  "backup": {
    "config": {
      "path": ".claude/settings.json",
      "hash": "abc123...",
      "mcpServersCount": 2
    },
    "agents": {
      "user": ["deploy-agent.md", "custom.md"],
      "flow": ["coder.md", "reviewer.md", "writer.md"]
    },
    "commands": {
      "user": ["deploy.md"],
      "flow": ["test.md", "cleanup.md"]
    },
    "rules": {
      "path": ".claude/agents/AGENTS.md",
      "originalSize": 1234,
      "flowContentAdded": true
    },
    "singleFiles": {
      "CLAUDE.md": {
        "existed": true,
        "originalSize": 567,
        "flowContentAdded": true
      }
    }
  },
  "secrets": {
    "mcpEnvExtracted": true,
    "storedAt": "~/.sylphx-flow/secrets/a1b2c3d4e5f6g7h8/mcp-env.json"
  }
}
```

## 核心模塊設計

### 1. Project Manager
```typescript
class ProjectManager {
  // 獲取項目 hash
  getProjectHash(projectPath: string): string

  // 獲取項目相關路徑
  getProjectPaths(projectHash: string): {
    sessionFile: string
    backupsDir: string
    secretsDir: string
  }

  // 檢測項目 target (claude-code / opencode)
  async detectTarget(projectPath: string): Promise<string>
}
```

### 2. Backup Manager (重新設計)
```typescript
class BackupManager {
  // 創建完整備份
  async createBackup(
    projectPath: string,
    projectHash: string,
    target: string
  ): Promise<BackupInfo>

  // 恢復備份
  async restoreBackup(
    projectHash: string,
    sessionId: string
  ): Promise<void>

  // 清理舊備份 (每個項目保留最近 3 個)
  async cleanupOldBackups(
    projectHash: string,
    keepLast: number = 3
  ): Promise<void>
}
```

### 3. Attach Manager (新模塊)
```typescript
class AttachManager {
  // 依附 Flow 內容到項目
  async attach(
    projectPath: string,
    target: string,
    templates: Templates
  ): Promise<AttachResult>

  // 具體策略
  private async mergeAgents(projectPath: string, agents: Agent[]): Promise<void>
  private async mergeCommands(projectPath: string, commands: Command[]): Promise<void>
  private async mergeRules(projectPath: string, rules: string): Promise<void>
  private async mergeMCP(projectPath: string, mcpServers: MCPServer[]): Promise<void>
  private async mergeSingleFile(filePath: string, content: string): Promise<void>
}

interface AttachResult {
  agentsAdded: string[]
  commandsAdded: string[]
  rulesAppended: boolean
  mcpServersAdded: string[]
  singleFilesMerged: string[]
}
```

### 4. Session Manager (更新)
```typescript
class SessionManager {
  // 使用 project hash 管理會話
  async startSession(
    projectPath: string,
    projectHash: string,
    target: string,
    backupPath: string
  ): Promise<Session>

  // 獲取項目的活動會話
  async getActiveSession(projectHash: string): Promise<Session | null>

  // 檢測孤立會話
  async detectOrphanedSessions(): Promise<Map<string, Session>>

  // 恢復會話 (清理)
  async recoverSession(projectHash: string, session: Session): Promise<void>

  // 結束會話
  async endSession(projectHash: string, sessionId: string): Promise<void>
}
```

### 5. Secrets Manager (更新)
```typescript
class SecretsManager {
  // 提取 MCP secrets (按項目)
  async extractMCPSecrets(
    projectPath: string,
    projectHash: string,
    target: string
  ): Promise<MCPSecrets>

  // 保存 secrets
  async saveSecrets(
    projectHash: string,
    secrets: MCPSecrets
  ): Promise<void>

  // 恢復 secrets (在 restore backup 時)
  async restoreSecrets(
    projectHash: string,
    sessionId: string
  ): Promise<MCPSecrets>
}

interface MCPSecrets {
  [serverName: string]: {
    env: Record<string, string>
  }
}
```

### 6. Cleanup Handler
```typescript
class CleanupHandler {
  // 註冊清理鉤子 (process.on)
  registerCleanupHooks(projectHash: string): void

  // 正常退出
  async onExit(projectHash: string): Promise<void>

  // 信號處理
  async onSignal(signal: string, projectHash: string): Promise<void>

  // 啟動時恢復 (所有項目)
  async recoverOnStartup(): Promise<void>
}
```

## 執行流程詳細

### 啟動 (sylphx-flow "prompt")

```typescript
async function executeFlow(prompt: string, options: FlowOptions) {
  const projectPath = process.cwd()
  const projectHash = projectManager.getProjectHash(projectPath)

  // 1. Crash recovery (檢查所有項目的 orphaned sessions)
  await cleanupHandler.recoverOnStartup()

  // 2. 檢測 target
  const target = await projectManager.detectTarget(projectPath)

  // 3. 創建備份
  console.log('💾 Creating backup...')
  const backup = await backupManager.createBackup(projectPath, projectHash, target)

  // 4. 提取 secrets
  console.log('🔐 Extracting secrets...')
  const secrets = await secretsManager.extractMCPSecrets(projectPath, projectHash, target)
  await secretsManager.saveSecrets(projectHash, secrets)

  // 5. 開始會話
  const session = await sessionManager.startSession(
    projectPath,
    projectHash,
    target,
    backup.path
  )

  // 6. 註冊清理鉤子
  cleanupHandler.registerCleanupHooks(projectHash)

  // 7. 依附 Flow 內容
  console.log('🚀 Attaching Flow environment...')
  const templates = await loadFlowTemplates(target)
  const attachResult = await attachManager.attach(projectPath, target, templates)

  console.log(`   ✓ Added ${attachResult.agentsAdded.length} agents`)
  console.log(`   ✓ Added ${attachResult.commandsAdded.length} commands`)
  console.log(`   ✓ Added ${attachResult.mcpServersAdded.length} MCP servers`)

  // 8. 運行 Agent
  console.log('\n🤖 Running agent...\n')
  await runAgent(projectPath, target, prompt, options)

  // 9. 正常退出清理
  console.log('\n🧹 Cleaning up...')
  await cleanupHandler.onExit(projectHash)

  console.log('   ✓ Environment restored')
  console.log('   ✓ Secrets preserved for next run\n')
}
```

### 清理流程

#### 正常退出
```typescript
async function onExit(projectHash: string) {
  const session = await sessionManager.getActiveSession(projectHash)

  if (!session) return

  // 1. 恢復備份
  await backupManager.restoreBackup(projectHash, session.sessionId)

  // 2. 結束會話
  await sessionManager.endSession(projectHash, session.sessionId)

  // 3. 清理舊備份
  await backupManager.cleanupOldBackups(projectHash, 3)
}
```

#### Crash 恢復 (下次啟動)
```typescript
async function recoverOnStartup() {
  const orphanedSessions = await sessionManager.detectOrphanedSessions()

  for (const [projectHash, session] of orphanedSessions) {
    console.log(`🔧 Recovering crashed session for project: ${session.projectPath}`)

    // 恢復備份
    await backupManager.restoreBackup(projectHash, session.sessionId)

    // 清理會話
    await sessionManager.recoverSession(projectHash, session)

    console.log('   ✓ Environment restored')
  }
}
```

## 簡化結果

### 移除的流程
❌ 安裝流程 (`init-command.ts`)
❌ 同步流程 (`--sync`)
❌ 移除差異流程 (`sync-utils.ts`)
❌ 詢問用戶保留/刪除

### 保留的功能
✅ 自動檢測 target
✅ 備份/恢復
✅ Crash recovery
✅ Secrets 管理
✅ 多項目支持

### 新增的功能
✅ 依附模式 (Attach)
✅ 智能 merge
✅ 全局統一存儲 (~/.sylphx-flow/)
✅ 項目隔離 (project hash)

## 優勢

1. **零配置** - 不需要安裝，直接用
2. **無侵入** - 所有改動都會恢復
3. **多項目** - 支持同時多個項目
4. **Crash 安全** - 自動恢復
5. **Secrets 持久化** - MCP env 不會丟失

## 實現順序

### Phase 1: 基礎框架
- [ ] ProjectManager (project hash, paths)
- [ ] BackupManager (create/restore)
- [ ] SessionManager (multi-project support)
- [ ] CleanupHandler (exit hooks)

### Phase 2: 依附機制
- [ ] AttachManager (merge strategies)
- [ ] Template loader
- [ ] Merge agents/commands/rules/MCP

### Phase 3: Secrets 管理
- [ ] SecretsManager (extract/save/restore)
- [ ] MCP env extraction
- [ ] Encryption (optional)

### Phase 4: 移除舊流程
- [ ] Remove init-command.ts
- [ ] Remove sync-utils.ts
- [ ] Update CLI entry point
