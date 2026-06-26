# Sylphx Flow - AI-Powered Development Platform

**MEP (Minimal Effective Prompt) Architecture** - 90% less prompt, 100% better results.

Welcome to **Sylphx Flow**, the first production platform built on **StarCoder2 tokenization** for 70+ language hybrid search, combining **curated knowledge**, **TF-IDF semantic search**, and **AI agent orchestration** through the Model Context Protocol (MCP).

## 🎯 The MEP Difference

### Traditional Way ❌
```
User: "I'm using TypeScript + React + Next.js,
      project structure is src/app,
      using shadcn/ui,
      current time is 2025-10-30,
      implement authentication with JWT..."
```

### MEP Way ✅ (Sylphx Flow)
```
User: "implement authentication"

// AI automatically gets:
✅ Project environment
✅ Current time
✅ Existing patterns (via codebase search)
✅ Best practices (via knowledge base)
```

**Result: 90% less prompt, 100% more accurate**

## 🚀 Core Innovations

### 1. 🌟 StarCoder2 Tokenization - 70+ Languages

**First production use of StarCoder2 tokenization for search:**

- **70+ Programming Languages** - TypeScript to Assembly
- **Hybrid Search** - Search in any language, find code in any language
- **Semantic Understanding** - Find code by what it does
- **Cross-Language** - Understand concepts across languages

```bash
# Search in ANY language - finds same code!
flow codebase search "user login handling"     # English
flow codebase search "處理用戶登入嘅邏輯"       # Chinese
flow codebase search "ユーザーログイン処理"     # Japanese

# All find the same code:
✅ authenticateUser()
✅ loginHandler
✅ verifyCredentials
```

### 2. 🎯 Two-Command Architecture

**Setup once, use forever:**

```bash
# 1. Initialize once
npx @sylphx/flow init

# 2. Use anywhere, anytime
npx @sylphx/flow run "your task"

# Or enter interactive mode
npx @sylphx/flow run
# Then type your prompt interactively
```

**Why two commands?**
- ✅ **Zero configuration** - Set up once, never again
- ✅ **Zero maintenance** - Everything auto-updates
- ✅ **Zero complexity** - Just describe what you want

### 3. 📋 Curated Knowledge (By Design)

**No custom knowledge support - intentionally:**

- ✅ **Quality Guaranteed** - Professionally curated
- ✅ **Zero Maintenance** - Auto-updated with `flow init`
- ✅ **Optimized Performance** - Local tokenization + TF-IDF = <100ms search

**Project-specific patterns?** Use codebase search:
```bash
flow codebase search "our authentication pattern"
# AI finds YOUR actual patterns
```

### 4. 🏗️ Pure Functional Architecture

**Built with FP principles:**

- ✅ **Composition over Inheritance** - Tools compose naturally
- ✅ **Pure Functions** - Predictable, testable, parallel
- ✅ **Immutable Data** - No side effects
- ✅ **Pipeline Architecture** - Natural data flow

## ✨ Core Capabilities

| Capability | What It Provides | Who Benefits |
|-----------|------------------|--------------|
| **📚 Knowledge Base** | Curated guidelines for React, Next.js, Node.js | AI assistants, developers |
| **🔍 Semantic Search** | Find code by meaning, not keywords | Development teams |
| **🤖 Agent Framework** | Orchestrated AI for complex tasks | Project managers, architects |
| **⚡ Real-time Indexing** | Always up-to-date search index | Large codebases |
| **🔧 CLI Tools** | Command-line control | DevOps, power users |

## 🎯 Quick Navigation

### Getting Started
- **[Installation & Setup](Installation-&-Setup)** - Get up and running in minutes
- **[CLI Commands](CLI-Commands)** - Complete command reference
- **[MEP Design Philosophy](MEP-Design-Philosophy)** - ⭐ Why MEP changes everything

### Core Features
- **[Knowledge Base](Knowledge-Base)** - Curated development guidelines
- **[Codebase Search](Codebase-Search)** - ⭐ StarCoder2 70+ language search
- **[Agent Framework](Agent-Framework)** - Orchestrated AI agents

### Technical Deep Dive
- **[Technical Architecture](Technical-Architecture)** - ⭐ StarCoder2 + Functional design
- **[Configuration](Configuration)** - Customize your setup
- **[Contributing](Contributing)** - Help improve Sylphx Flow

## 🚀 Quick Start

**Two commands, infinite possibilities:**

### 1. Setup Once
```bash
npx @sylphx/flow init
```

### 2. Use Forever

**Direct prompt:**
```bash
# Just describe what you want
npx @sylphx/flow run "implement authentication"
npx @sylphx/flow run "review for security" --agent reviewer
```

**Interactive mode:**
```bash
# Enter interactive Claude mode
npx @sylphx/flow run

# Then type your prompt naturally:
User: implement authentication
User: add password reset
User: write tests
# Keep chatting until done!
```

**That's it!** AI automatically gets:
- ✅ Your environment and time
- ✅ Your existing code patterns
- ✅ Best practices from knowledge base
- ✅ Everything needed for accurate results

**Zero extra prompting required.**

## 📖 Essential Reading

### For First-Time Users
1. **[Installation & Setup](Installation-&-Setup)** - Install and configure
2. **[CLI Commands](CLI-Commands)** - Learn basic commands
3. **[Knowledge Base](Knowledge-Base)** - Explore available guidelines

### For AI Tool Users
1. **[MCP Integration](MCP-Integration)** - Connect your AI assistant
2. **[Knowledge Base](Knowledge-Base)** - How AI uses knowledge
3. **[Codebase Search](Codebase-Search)** - Semantic search capabilities

### For Developers
1. **[Architecture](Architecture)** - System design and structure
2. **[Configuration](Configuration)** - Advanced customization
3. **[Contributing](Contributing)** - Contribute to the project

## 🎯 Real-World Use Cases

### 1. **Onboarding New Developers**
Your AI assistant has instant access to project patterns and architecture:

```bash
# AI searches knowledge base
knowledge_search("project architecture patterns")

# AI finds relevant code examples
codebase_search("authentication implementation")
```

### 2. **Code Quality Maintenance**
AI follows your team's standards automatically:

```bash
# Run code review with AI
flow run "review for security and performance" --agent reviewer
```

### 3. **Complex Feature Development**
Orchestrator breaks down and coordinates feature implementation:

```bash
# Orchestrator delegates to coder, reviewer, and writer
flow run "implement OAuth with tests and docs" --agent orchestrator
```

### 4. **Semantic Code Discovery**
Find code by what it does, not what it's called:

```bash
# Traditional search: Need exact keywords
grep -r "handlePayment"

# Semantic search: Describe what you're looking for
flow codebase search "payment processing logic"
```

## 🧠 How It Works

### Knowledge Base System
```
Developer → AI Assistant → knowledge_search("react best practices")
                          ↓
                   Knowledge Base (curated guidelines)
                          ↓
                   Returns: React patterns, hooks, state management
```

### Codebase Search
```
Developer → AI Assistant → codebase_search("authentication")
                          ↓
                   StarCoder2 Tokenization + TF-IDF (semantic understanding)
                          ↓
                   Returns: All auth-related code by meaning
```

### Agent Orchestration
```
Complex Task → Orchestrator → Break down into subtasks
                             ↓
                  Delegate to: Coder → Reviewer → Writer
                             ↓
                  Synthesize results → Deliver to user
```

## 🔌 MCP Tools Available

When you run `flow mcp start`, AI assistants get these tools:

### Knowledge Tools
- `knowledge_search` - Search guidelines and patterns
- `knowledge_get` - Get specific documents
- `knowledge_list` - List all resources

### Codebase Tools
- `codebase_search` - Semantic code search
- `codebase_reindex` - Update search index
- `codebase_status` - Check index status

### Time Tools
- `time_get_current` - Current timestamp
- `time_format` - Format times
- `time_calculate` - Time calculations

## 📊 Knowledge Base Content

### Stacks (Framework-Specific)
- **React App** - Components, hooks, state management
- **Next.js App** - App router, server components, data fetching
- **Node.js API** - Express, middleware, error handling

### Guides (Architecture & Design)
- **SaaS Template** - Multi-tenant patterns
- **Tech Stack** - Technology selection
- **UI/UX** - Design systems and accessibility

### Universal (Cross-Cutting)
- **Security** - Auth, input validation, encryption
- **Performance** - Optimization, caching, monitoring
- **Testing** - Test strategies, coverage, integration
- **Deployment** - CI/CD, infrastructure, rollback

### Data (Database Patterns)
- **SQL** - Query patterns, indexing, migrations

## 🤖 Agent Framework

### Orchestrator
**Role**: Task coordination and delegation

**Use When**: Complex tasks requiring multiple specialists

**Example**:
```bash
flow run "implement feature with tests and docs" --agent orchestrator
```

### Coder
**Role**: Code implementation and execution

**Use When**: Need to write or modify code

**Example**:
```bash
flow run "add user authentication" --agent coder
```

### Reviewer
**Role**: Code review and quality assurance

**Use When**: Need code review for security, performance, or best practices

**Example**:
```bash
flow run "review this PR" --agent reviewer
```

### Writer
**Role**: Documentation and technical writing

**Use When**: Need to create or update documentation

**Example**:
```bash
flow run "document the API endpoints" --agent writer
```

## 💡 Key Benefits

### 🔄 **Consistency**
"My AI assistants follow the same coding standards across all projects."

### 🧠 **Intelligence**
"AI understands my codebase by meaning, not just by keywords."

### 🤝 **Collaboration**
"Multiple AI agents work together on complex tasks."

### 🛠️ **Control**
"I have full control over what guidelines AI follows."

## 🎯 What's Next?

### New Users
1. **[Install Sylphx Flow](Installation-&-Setup)** - Get set up
2. **[Learn CLI Commands](CLI-Commands)** - Master the basics
3. **[Explore Knowledge Base](Knowledge-Base)** - See what's available

### AI Tool Integration
1. **[MCP Integration](MCP-Integration)** - Connect AI tools
2. **[Configure Tools](Configuration)** - Customize behavior
3. **[Use Case Examples](Use-Cases)** - Real-world scenarios

### Developers
1. **[Architecture Overview](Architecture)** - Understand the system
2. **[Extend Knowledge Base](Extending-Knowledge)** - Add your own guidelines
3. **[Contribute](Contributing)** - Help improve the project

## 🔗 Important Links

- **[GitHub Repository](https://github.com/SylphxAI/flow)** - Source code and releases
- **[Issue Tracker](https://github.com/SylphxAI/flow/issues)** - Report bugs or request features
- **[Discussions](https://github.com/SylphxAI/flow/discussions)** - Community discussion

## 📊 System Status

- **Current Version**: 0.0.2
- **Node.js Required**: >= 18.0.0
- **License**: MIT
- **Status**: Active Development

---

## 💡 The Big Picture

Sylphx Flow isn't just another CLI tool or knowledge base. It's the **missing infrastructure** that transforms AI assistants from helpful tools into intelligent collaborators that understand your codebase, follow your standards, and coordinate complex tasks.

**Transform your development workflow** - Start with [Installation & Setup](Installation-&-Setup).

---

*Last Updated: 2025-10-30 | [Edit this page](https://github.com/SylphxAI/flow/wiki/Home) | [Report Issues](https://github.com/SylphxAI/flow/issues)*
