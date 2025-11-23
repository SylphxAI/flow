# Sylphx Flow - Attach Mode

## 🎯 What is Attach Mode?

Attach mode is a revolutionary approach to Flow execution that eliminates the need for manual installation and configuration. Instead of permanently modifying your project, Flow temporarily attaches its environment, runs your task, and automatically restores everything on exit.

## ✨ Key Benefits

1. **Zero Setup** - No installation required, just run
2. **Non-Intrusive** - All changes are automatically reverted
3. **Multi-Project** - Run on multiple projects simultaneously
4. **Crash Safe** - Automatic recovery on next startup
5. **Secrets Preserved** - MCP credentials saved between runs

## 🚀 Quick Start

```bash
# Just run - no setup needed!
sylphx-flow "implement user authentication"

# That's it! Environment is:
# 1. Backed up
# 2. Flow attached
# 3. Agent runs
# 4. Restored on exit
```

## 📋 How It Works

### Lifecycle

```
Start
  ↓
💾 Create backup → ~/.sylphx-flow/backups/{project-hash}/
  ↓
🔐 Extract MCP secrets → ~/.sylphx-flow/secrets/{project-hash}/
  ↓
🚀 Attach Flow environment (agents, commands, rules, MCP)
  ↓
🤖 Run your agent
  ↓
🧹 Restore backup (automatic)
  ↓
✅ Done - project back to original state
```

### File Structure

All Flow data stored in `~/.sylphx-flow/`:

```
~/.sylphx-flow/
├── sessions/               # Active sessions
│   └── {project-hash}.json
├── backups/               # Environment backups
│   └── {project-hash}/
│       ├── session-1234567890/
│       │   ├── .claude/    # Full backup
│       │   └── manifest.json
│       └── latest -> session-xxx
└── secrets/               # MCP credentials
    └── {project-hash}/
        └── mcp-env.json
```

## ⚠️ Conflict Handling

When Flow agents/commands conflict with your existing ones:

```
⚠️  Conflicts detected:

   • agent: coder.md - overridden
   • command: test.md - overridden
   • mcp: github - overridden

   Don't worry! All overridden content will be restored on exit.
```

**Strategy**: Override with warning, restore on exit
- Your original content is safely backed up
- Flow uses its version during execution
- Everything restored automatically

## 🎨 Merge Strategies

Different file types use different strategies:

| Type | Strategy | Example |
|------|----------|---------|
| **Agents** | Override | `coder.md` → Flow version (backed up) |
| **Commands** | Override | `test.md` → Flow version (backed up) |
| **Rules** | Append | User rules + Flow rules (separated) |
| **MCP** | Merge objects | User MCP + Flow MCP (override on conflict) |
| **Single files** | Append | User prompt + Flow prompt (separated) |
| **Hooks** | Override | Flow version (backed up) |

## 🔐 Secrets Management

MCP environment variables are automatically extracted and persisted:

```json
{
  "version": "1.0.0",
  "servers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxx"
      }
    },
    "notion": {
      "env": {
        "NOTION_API_KEY": "secret_xxxxx"
      }
    }
  }
}
```

Secrets are:
- Extracted on first run
- Saved to `~/.sylphx-flow/secrets/{project-hash}/`
- Restored on subsequent runs
- Never lost across sessions

## 💥 Crash Recovery

If Flow crashes or is killed:

```bash
# Next time you run:
sylphx-flow "new task"

# Output:
🔧 Recovering 1 crashed session(s)...

   Project: /Users/you/my-project
   ✓ Environment restored

💾 Creating backup...
...
```

Automatic recovery ensures your project is never left in a corrupted state.

## 🔄 Multi-Project Support

Run Flow on multiple projects simultaneously:

```bash
# Terminal 1
cd /Users/you/project-a
sylphx-flow "implement feature X"

# Terminal 2 (same time!)
cd /Users/you/project-b
sylphx-flow "fix bug Y"

# Each isolated in ~/.sylphx-flow/:
# - sessions/a1b2c3d4.json
# - sessions/i9j0k1l2.json
# - backups/a1b2c3d4/
# - backups/i9j0k1l2/
```

Projects are isolated by hash of their absolute path.

## 📝 Commands

### Main Command

```bash
# Run with default agent (coder)
sylphx-flow "your prompt"

# Specify agent
sylphx-flow --agent reviewer "review this code"

# Use custom agent file
sylphx-flow --agent-file ./my-agent.md "custom task"

# Verbose mode (show detailed progress)
sylphx-flow --verbose "implement auth"

# Quick mode (skip upgrade checks)
sylphx-flow --quick "fast task"
```

### Utility Commands

```bash
# Check for updates
sylphx-flow upgrade --check

# Auto-upgrade
sylphx-flow upgrade --auto

# Show status
sylphx-flow status

# Diagnose issues
sylphx-flow doctor
```

## 🛠️ Advanced Usage

### Environment Variables

Control Flow behavior:

```bash
# Use different Flow home directory
export SYLPHX_FLOW_HOME=~/.custom-flow
sylphx-flow "task"
```

### Programmatic Usage

```typescript
import { FlowExecutor } from '@sylphx/flow/core/flow-executor';

const executor = new FlowExecutor();

await executor.execute('/path/to/project', {
  verbose: true,
  skipBackup: false,
  skipSecrets: false,
});

// ... run your agent ...

await executor.cleanup('/path/to/project');
```

## 🔍 Debugging

### Check active sessions

```bash
ls -la ~/.sylphx-flow/sessions/
```

### Check backups

```bash
ls -la ~/.sylphx-flow/backups/{project-hash}/
```

### Check secrets

```bash
cat ~/.sylphx-flow/secrets/{project-hash}/mcp-env.json
```

### Manual recovery

If automatic recovery fails:

```bash
# Find your project hash
cd /path/to/your/project
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update(process.cwd()).digest('hex').substring(0, 16))"

# Restore manually
cp -r ~/.sylphx-flow/backups/{hash}/latest/.claude /path/to/project/
```

## ❓ FAQ

**Q: Do I still need to run `setup`?**
A: No! Setup is deprecated. Flow uses automatic attach mode.

**Q: What if I want to keep Flow permanently?**
A: Attach mode is temporary by design. For permanent setup, manually copy files from `~/.sylphx-flow/backups/{hash}/latest/`.

**Q: Can I customize Flow templates?**
A: Yes, modify files in Flow's `assets/` directory before running.

**Q: What happens to my custom agents?**
A: They're backed up and restored. During Flow execution, conflicts are overridden with warnings.

**Q: Is it safe to Ctrl+C?**
A: Yes! Cleanup handlers ensure environment is restored even on interruption.

**Q: What about my MCP secrets?**
A: Extracted and saved to `~/.sylphx-flow/secrets/`, automatically restored on next run.

## 🎓 Migration from Old Flow

If you were using old Flow with `setup`:

```bash
# Old way (deprecated)
sylphx-flow setup
sylphx-flow "task"

# New way (automatic)
sylphx-flow "task"  # That's it!
```

All your existing configurations are automatically detected and preserved.

## 🚨 Troubleshooting

### "Backup failed"

Check disk space:
```bash
df -h ~/.sylphx-flow
```

### "Cannot detect target"

Ensure you have `.claude/` or `.opencode/` directory, or set default:
```bash
# In ~/.sylphx-flow/settings.json
{
  "defaultTarget": "opencode"
}
```

### "Restore failed"

Backups are preserved. Manually restore:
```bash
cp -r ~/.sylphx-flow/backups/{hash}/latest/.claude ./
```

### "Multiple sessions detected"

Cleanup orphaned sessions:
```bash
rm ~/.sylphx-flow/sessions/*.json
```

Then run Flow again - automatic recovery will handle it.

## 📚 Learn More

- [Design Documentation](./docs/TEMP_ENV_DESIGN.md)
- [Upgrade Guide](./UPGRADE.md)
- [API Documentation](./docs/API.md)

---

**Sylphx Flow** - Zero-setup, temporary environment, automatic cleanup. Just run and forget! 🚀
