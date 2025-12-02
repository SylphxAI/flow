# @sylphx/flow

## 3.0.0 (2025-12-02)

### ✨ Features

- **prompts:** add doc update requirements to coder modes ([c489f71](https://github.com/SylphxAI/flow/commit/c489f716d7415f1f077c9318f9cc5fc72fd097ed))
- **prompts:** add mode transition announcement to core rules ([19b18b0](https://github.com/SylphxAI/flow/commit/19b18b0adc49c6eb9da80e61ccdb2a8ce04ac425))
- **prompts:** add Research-First Principle for mandatory investigation ([b3d5ecd](https://github.com/SylphxAI/flow/commit/b3d5ecdc90b37d40b8326948364b2289a5cef5f4))
- **prompts:** strengthen commit policy for proactive commits ([69fc880](https://github.com/SylphxAI/flow/commit/69fc880d25aced2fd869c02f6ffe5efda4031225))
- **cli:** add 'flow' command alias ([47a76fe](https://github.com/SylphxAI/flow/commit/47a76fed5e2b3fe83526017f06384fc4f4726efe))
- **settings:** add "Ask me every time" option for target selection ([0f25d27](https://github.com/SylphxAI/flow/commit/0f25d27c3fe3298ae417ad1b69e0d3de619fb0d9))
- **settings:** allow target selection regardless of installation status ([f7f06da](https://github.com/SylphxAI/flow/commit/f7f06da70a4d60fc714fd71a220f09224a97aaf0))
- **flow:** auto-installation and auto-upgrade ([24902e8](https://github.com/SylphxAI/flow/commit/24902e81dc1a2e89c9ff3ad877a1504496d7c26f))
- **flow:** settings-based configuration and git skip-worktree integration ([aa77a0b](https://github.com/SylphxAI/flow/commit/aa77a0b01818961c30eded671ae760ff7b9f9e34))
- 💥 **mode:** make replace mode default, add --merge flag ([6b3539b](https://github.com/SylphxAI/flow/commit/6b3539b52f576fb307141b3e30dd513d5c5ce250))
- 💥 **replace:** add --replace mode for complete settings replacement ([43c6234](https://github.com/SylphxAI/flow/commit/43c6234d6b886b3d85cef43bddae5bc66b2f6292))
- 💥 **detection:** detect target by command availability, not folders ([fa6d826](https://github.com/SylphxAI/flow/commit/fa6d826483183fd9e66493bb0bd7c6184c7457f4))
- **quick-mode:** add useDefaults parameter to first-run setup ([754e326](https://github.com/SylphxAI/flow/commit/754e32601e9825a2f7ee42f9c62b7ab4715d5f9a))
- **provider:** add provider selection for Claude Code ([ca0137c](https://github.com/SylphxAI/flow/commit/ca0137cff962f4e8fa593ddb7c443189aaef168b))
- **attach:** integrate global MCP settings deployment ([43f2ebe](https://github.com/SylphxAI/flow/commit/43f2ebe130cc724b0f40b41b84364d53796641cb))
- **settings:** add global settings management and first-run setup ([3b6209b](https://github.com/SylphxAI/flow/commit/3b6209bcedc021a0a892e802c34f284710c1ef74))
- **core:** implement multi-session support with reference counting ([de6fb41](https://github.com/SylphxAI/flow/commit/de6fb414ea191e09221db4a1cc7539050537e159))
- **core:** implement Phase 3 - integrate attach mode into CLI ([323df3d](https://github.com/SylphxAI/flow/commit/323df3d6c5eca88068d1b029d0c28856b1280862))
- **core:** implement Phase 2 - attach mode with conflict handling ([2885ca5](https://github.com/SylphxAI/flow/commit/2885ca52f5754e6aaea530acf8c3f70bfc31dd8c))
- **core:** implement Phase 1 - temporary environment foundation ([8778e04](https://github.com/SylphxAI/flow/commit/8778e046f45b11de36b9e968b7696b4b9e24a0d5))
- **upgrade:** add smart package manager detection ([0714efb](https://github.com/SylphxAI/flow/commit/0714efb2907366b3d5c438b23d005a3abc02e261))
- **upgrade:** add automatic upgrade detection and installation ([3f84397](https://github.com/SylphxAI/flow/commit/3f84397ed0e85c71a5a690b811d4368ba1379b0c))
- **prompts:** add next action suggestions to report structure ([4b58753](https://github.com/SylphxAI/flow/commit/4b587539d9812b874250615129d1ec899a9e0ea9))
- **prompts:** add structured completion report format ([7adbf93](https://github.com/SylphxAI/flow/commit/7adbf93e8ee415efd3529ea03f0b7c53b30ceffc))
- **sync:** add orphaned hooks detection and removal ([0fa5d2f](https://github.com/SylphxAI/flow/commit/0fa5d2f7d22573831fd0de260eb3fa8e14875c2b))
- **core:** add Personality section with research-backed trait descriptors ([096bea5](https://github.com/SylphxAI/flow/commit/096bea5ac7eebde97e2caefa537ccd75e64a0846))
- **core:** add Character section defining deliberate, systematic behavior ([2cb7b4d](https://github.com/SylphxAI/flow/commit/2cb7b4dc87fd5f7bd8d664556030a637894aecc0))
- **mcp:** add Playwright MCP server as default ([a850478](https://github.com/SylphxAI/flow/commit/a8504786a529dfcbdd8041881ca689829d282fd6))
- add startup check for new templates ([b67ade2](https://github.com/SylphxAI/flow/commit/b67ade253f34b15da033d70ee225266105d9d721))
- **sync:** show missing templates in preview ([ccbaff5](https://github.com/SylphxAI/flow/commit/ccbaff5a233c6138978b26e8994d31e970f992da))
- **sync:** add visible deletion output ([6791086](https://github.com/SylphxAI/flow/commit/679108694fb097ddd2a187e8b7826fbd3eefe6af))
- **sync:** add MCP registry checking to --sync ([47d0634](https://github.com/SylphxAI/flow/commit/47d0634359dda75e739768d06feb3bebbd0d2238))
- **flow:** add workspace documentation rule with auto-creation ([c0b1789](https://github.com/SylphxAI/flow/commit/c0b178952031a7bba2e75239b94b5d91958d71a8))
- **flow:** add 5 essential slash commands ([14ae925](https://github.com/SylphxAI/flow/commit/14ae9254d568fecafa59c861ad965c960a6ad9ed))
- **flow:** transform principles into executable workflows ([4858a44](https://github.com/SylphxAI/flow/commit/4858a444668343053a5a8e36915770a92e4c65e5))
- **flow:** enforce proactive cleanup before every commit ([73690de](https://github.com/SylphxAI/flow/commit/73690de79d4e565fce46269655f4018ffbede679))
- **flow:** add research-first mindset and fix silent mode ([57b31bb](https://github.com/SylphxAI/flow/commit/57b31bb91df54d5b3f4f131f39d8431129047342))
- **flow:** enhance agent prompts with workflow standards ([ff655a7](https://github.com/SylphxAI/flow/commit/ff655a77dff52f6e289e18195c6aa68ff5b8c4e8))
- **mcp:** add coderag MCP server to registry ([922ccce](https://github.com/SylphxAI/flow/commit/922ccce7ff1dff40241b6c2dba5a9e5bd62d8023))
- **opencode:** print command in headless/loop mode for debugging ([abbb8e8](https://github.com/SylphxAI/flow/commit/abbb8e884c3f70ce143d247ecc63e6b82013e45d))
- 💥 **flow:** implement --sync flag to synchronize with Flow templates ([a34f48f](https://github.com/SylphxAI/flow/commit/a34f48fea88cbf121c04bbb17a9e4adeb96fec7a))
- **loop:** change default interval from 60s to 0s (no cooldown) ([1ec5e5e](https://github.com/SylphxAI/flow/commit/1ec5e5ebc4892084a289336230c599ad121e2748))
- **flow:** add file input support for prompts and translate docs to English ([adcddd9](https://github.com/SylphxAI/flow/commit/adcddd9a35609e28e9b16ef98145889ddb2047a7))
- **loop:** make interval optional with 60s default ([5e3e741](https://github.com/SylphxAI/flow/commit/5e3e7419bb6a8e321198e9304391d38525536b0b))
- **loop:** add autonomous loop mode for continuous execution ([8a027fd](https://github.com/SylphxAI/flow/commit/8a027fd776e6081e7efa25d70f836609ae5e9205))
- **dry-run:** show complete command in dry run mode ([9c8f296](https://github.com/SylphxAI/flow/commit/9c8f296450d7369fb50fb489918d8311a82cdbe9))
- **opencode:** use --agent flag instead of system prompt ([1b20ca9](https://github.com/SylphxAI/flow/commit/1b20ca94991bfc6530b37c10ea2229fa4eea5526))
- **execution:** add headless modes and fix prompt passing ([3a63b53](https://github.com/SylphxAI/flow/commit/3a63b53d4a2d21b28919be2d72e4467f64b60337))
- **integrity:** add component integrity check with automatic repair ([7e95abd](https://github.com/SylphxAI/flow/commit/7e95abdb00932aefe529b544c4b0c1e016690103))
- **upgrade:** add automatic target update detection and use native update commands ([1813a3c](https://github.com/SylphxAI/flow/commit/1813a3cad79a0dcb463ffa07e63c1752362a9f61))
- **ux:** optimize UI/UX with smart defaults and better progress indicators ([7bd9dd3](https://github.com/SylphxAI/flow/commit/7bd9dd3c1f6b686efcde72d9cff58e378d1c4150))
- always show all provider options with inline API key setup ([ed055f3](https://github.com/SylphxAI/flow/commit/ed055f38d5fe16ff9d2043e1880e7cbff623e053))
- add flow orchestrator to separate concerns and reduce complexity ([5b859ba](https://github.com/SylphxAI/flow/commit/5b859ba2aa69486fa1dbe3c92b86c1d3847fb47d))
- **notification:** add cross-platform icon support ([3f59adc](https://github.com/SylphxAI/flow/commit/3f59adc5870679537f7a33fe88a720771e2771f9))
- cleanup slash commands and simplify hooks for Claude Code ([e990153](https://github.com/SylphxAI/flow/commit/e9901536cd91b17c5309ca13fc48c60e4d6b6f87))
- **flow:** add debug-logger utility ([68d10ac](https://github.com/SylphxAI/flow/commit/68d10aca5d88ee084af0d55f2d2de328a3242d70))
- **build:** migrate to bunup for all packages ([5094e52](https://github.com/SylphxAI/flow/commit/5094e525a20e7ba87d6bdf0e711563b1d3f001e1))
- add frontmatter rules support to agent system ([4913c9e](https://github.com/SylphxAI/flow/commit/4913c9e80f3442e385f4df6a0a1ee11ec232a34b))
- extract @sylphx/flow legacy CLI package ([6a35272](https://github.com/SylphxAI/flow/commit/6a3527205627cd206fdee372456fc85fe9fcc880))
- setup monorepo infrastructure (Phase 1 complete) ([752d534](https://github.com/SylphxAI/flow/commit/752d534f8807be65fcc52ca7a9b3f44929de9b1f))

### 🐛 Bug Fixes

- **mcp:** remove --mcp-config flag, rely on project .mcp.json ([53189b8](https://github.com/SylphxAI/flow/commit/53189b881b949c675152bed198d4f58cab6c50f6))
- **upgrade:** prevent recursive self-upgrade with env flag ([94f8a5f](https://github.com/SylphxAI/flow/commit/94f8a5ff6d3f43430e22bc265b910735bf87955a))
- **upgrade:** re-exec process after self-upgrade ([362c1eb](https://github.com/SylphxAI/flow/commit/362c1ebaeaaecb258ca84c2927a7e3eb20e13d74))
- **mcp:** use process.cwd() instead of undefined cwd variable ([5b99ac8](https://github.com/SylphxAI/flow/commit/5b99ac83a2867020a74edbf4364f5dec201e1a3d))
- **mcp:** explicitly pass --mcp-config flag to Claude Code ([73b25f4](https://github.com/SylphxAI/flow/commit/73b25f4b954257dc42191504e7e29f781c1680be))
- **mcp:** approve MCP servers for Claude Code during attach ([83c8040](https://github.com/SylphxAI/flow/commit/83c804018aee87401c47010dd2d6e45cd6af0424))
- **settings:** respect saved MCP server enabled state ([5ea7fa7](https://github.com/SylphxAI/flow/commit/5ea7fa7ca52cd441a9d2d50c7e4f2c04834a6f77))
- **mcp:** return default servers when no config exists ([e2caea3](https://github.com/SylphxAI/flow/commit/e2caea35ae5d770bbb215481bfbcf288ffa6e3c9))
- **settings:** use MCP_SERVER_REGISTRY instead of hardcoded list ([2fbce7c](https://github.com/SylphxAI/flow/commit/2fbce7c832210f6c7679f6dcd70a7116fdad2aed))
- use intersection of agent frontmatter rules and global enabledRules ([64b1a84](https://github.com/SylphxAI/flow/commit/64b1a8434584f545689e2d2b54140d39e64ebf92))
- use agent frontmatter rules instead of global enabledRules ([7e96135](https://github.com/SylphxAI/flow/commit/7e9613587927d2ccd2b34907f79723328a7640e3))
- prevent output styles from being appended twice ([f2d9643](https://github.com/SylphxAI/flow/commit/f2d9643c839273b5e4e5ec8b17913ee8eb054445))
- **upgrade:** correctly detect Flow CLI version for upgrade check ([3fcb41d](https://github.com/SylphxAI/flow/commit/3fcb41d1eb4420fbfdb95a5001e8e5f799877b9c))
- **core:** fix singleFiles location and improve settings cleanup ([cd0194d](https://github.com/SylphxAI/flow/commit/cd0194dd9055e926f41c6b270d3aa25deb9e30a0))
- **flow:** improve target selection logic clarity ([11a3e1b](https://github.com/SylphxAI/flow/commit/11a3e1bb2d019253daa153b3deb034d5c8de89cf))
- **flow:** use selected target instead of re-detecting ([b7cff2a](https://github.com/SylphxAI/flow/commit/b7cff2ab982dafcfefadc18b9bc674ecd5d2816d))
- **installer:** enable auto-installation for OpenCode ([891aa15](https://github.com/SylphxAI/flow/commit/891aa15e62e35939d5d96451c5a6463c62ed39f7))
- **flow:** always respect settings, never fallback to auto-detection ([be418c1](https://github.com/SylphxAI/flow/commit/be418c1b61cfac888607f85a74c2b6eb3754ce49))
- **ui:** gracefully handle Ctrl+C cancellation ([3f85dde](https://github.com/SylphxAI/flow/commit/3f85dde29699fa46ca0a7daa51ecd67b883c2c79))
- **mcp:** enable all free MCP servers by default ([8580e97](https://github.com/SylphxAI/flow/commit/8580e97d70e80d5574eab46a7a43f848c23362dd))
- **settings:** fix template string syntax for Bun parser ([d932473](https://github.com/SylphxAI/flow/commit/d932473fb19b9c16ca13ac4f06f4db176f72ef31))
- **core:** fix target detection to respect saved settings ([fc294f3](https://github.com/SylphxAI/flow/commit/fc294f353cf821c6cc188affe8e1a967aafcf622))
- **core:** fix template loading and target-specific directory names ([9022c7c](https://github.com/SylphxAI/flow/commit/9022c7c6ad7338dc1fe4c6d78832c5b4e402980f))
- correct remaining import paths in utils/config files ([f002991](https://github.com/SylphxAI/flow/commit/f0029912c607db95cd347054009124b3b4afada9))
- correct sync-utils import paths ([85f1d88](https://github.com/SylphxAI/flow/commit/85f1d88a311083c70d7e279bbda392496bdaa163))
- correct import paths and restore missing object-utils ([8fded80](https://github.com/SylphxAI/flow/commit/8fded805fc14c249012b592e2c7de55dd1293fe9))
- handle Ctrl+C gracefully during target selection ([bbf5eed](https://github.com/SylphxAI/flow/commit/bbf5eeddf50aca1bee81d51943712676aa181e01))
- **sync:** display hooks configuration in sync preview ([c089088](https://github.com/SylphxAI/flow/commit/c08908805c2e6b00b55cc4733b96946fec9e3404))
- **targets:** add missing chalk import in claude-code target ([eec16f1](https://github.com/SylphxAI/flow/commit/eec16f1f8e4c4bfa167ff7d67de288e76523f273))
- **prompts:** clarify completion reporting requirements ([b369bf1](https://github.com/SylphxAI/flow/commit/b369bf1d0ed69775fabc709ab763f14cc95656cc))
- **workspace:** resolve execution issues with realistic strategies ([26fa768](https://github.com/SylphxAI/flow/commit/26fa7686d1e639a9b5b43a38e011a2148f33e1fc))
- **critical:** read rules before transformation, not after ([a700601](https://github.com/SylphxAI/flow/commit/a700601a213a6692ad3ce7b971bc8f21a09501ca))
- **critical:** preserve rules field in agent frontmatter for enhancement ([5e7f8f7](https://github.com/SylphxAI/flow/commit/5e7f8f72a5f59f0419d50f3bc844a38d65c07157))
- add workspace rule to coder, reviewer, writer agents ([219e762](https://github.com/SylphxAI/flow/commit/219e762e9696bed352e8a7d085145ffec7a6536d))
- **sync:** update template list to new MEP slash commands ([7209402](https://github.com/SylphxAI/flow/commit/7209402f0f656685ecc5fbfdbba1b2da99fc36a2))
- restore MEP-optimized templates and new slash commands ([8e1b474](https://github.com/SylphxAI/flow/commit/8e1b4742e846a1276799054808f0240c4f57e8ea))
- **sync:** force overwrite files during sync ([37cc6e4](https://github.com/SylphxAI/flow/commit/37cc6e4fb6c3af063552427f00becad6eee8c07c))
- **sync:** skip rules scanning for targets without rulesFile ([57961e7](https://github.com/SylphxAI/flow/commit/57961e78949b8d84533dbfd4c60c1d0ca15855a5))
- **sync:** deduplicate preserved paths in sync preview ([206039c](https://github.com/SylphxAI/flow/commit/206039c17cf658cee1dae428ea7b021fdf88e9e7))
- **embeddings:** remove interactive prompts, OpenAI only for MCP ([9ff8abb](https://github.com/SylphxAI/flow/commit/9ff8abb7016e13175dce5b52a5f54f056fc4aff6))
- **flow:** add missing runtime dependencies to package.json ([d12c68a](https://github.com/SylphxAI/flow/commit/d12c68a92686ae73ff882b44ecdda194ee5c3f39))
- **config:** improve provider selection UX and respect user preferences ([f748b7c](https://github.com/SylphxAI/flow/commit/f748b7ce3666b5546b702fe69e69d60719f9e13c))
- **build:** include assets directory in npm package ([dce04a4](https://github.com/SylphxAI/flow/commit/dce04a4420f13353f8fc0c3481a0cc972abc327d))
- **state-detector:** correctly handle Claude Code component detection ([8a8ea8b](https://github.com/SylphxAI/flow/commit/8a8ea8b01a37f5dd2da80d7e11533071d51ff290))
- **state-detector:** check if component directories have files, not just exist ([75580b9](https://github.com/SylphxAI/flow/commit/75580b9755f1de616325cb3a8f8eb5501ceb0458))
- **flow:** publish source code instead of bundle to avoid build issues ([aa95c31](https://github.com/SylphxAI/flow/commit/aa95c31014383760e5df12fb6e9d9ce08cecfff4))
- **flow:** add prepublishOnly script to ensure build before publish ([74aa385](https://github.com/SylphxAI/flow/commit/74aa385e74bbff084696b52680600d363c42169b))
- **flow:** resolve targetId undefined in loop mode initialization ([3620fd8](https://github.com/SylphxAI/flow/commit/3620fd8371faf0ebb9fbb9f8d60f5d399641c768))
- **opencode:** remove problematic flags from headless run mode ([494e89b](https://github.com/SylphxAI/flow/commit/494e89b94f6addfc591acc7d2c5f0f4ef0e6b0c0))
- **smart-config:** use smart defaults instead of always prompting ([d37b49d](https://github.com/SylphxAI/flow/commit/d37b49de6b8187e61d7cd3673711f26addbad42a))
- **flow:** use positive logic for initialization decision ([e1f8b02](https://github.com/SylphxAI/flow/commit/e1f8b026542fc35c08857a1beb05425295fb563f))
- **state-detector:** properly parse OpenCode JSONC config for MCP detection ([aff9322](https://github.com/SylphxAI/flow/commit/aff93225a4ec3c211e3c5cc4d17c5e69db9f4e25))
- **opencode:** remove unsupported YAML fields from installed agents ([5a6b132](https://github.com/SylphxAI/flow/commit/5a6b1324fa4001d38c6c6deb479f4fe5297bf94f))
- **opencode:** auto-cleanup legacy commands directory to prevent crash ([827ed7e](https://github.com/SylphxAI/flow/commit/827ed7e3e8f0ddda2ba66375a2fe4cdeeb005aa8))
- **opencode:** fix state detection and repair flow for OpenCode ([12a4443](https://github.com/SylphxAI/flow/commit/12a44433f129d07a5b69a2631659d2bf376f9a8b))
- **opencode:** remove unsupported YAML fields from agent metadata ([71682c6](https://github.com/SylphxAI/flow/commit/71682c675192d521c966be7f44842d9aa9d535d4))
- **opencode:** use singular 'command' directory instead of 'commands' ([adb46cc](https://github.com/SylphxAI/flow/commit/adb46cc3c4495eddc08434385b2710bc64ad2f91))
- handle undefined state in launch phase ([8f271f5](https://github.com/SylphxAI/flow/commit/8f271f52782f5a79622b3103cea1f2210f2e24d2))
- only check components when target is known ([b7b20a9](https://github.com/SylphxAI/flow/commit/b7b20a9e7c068668ab6f350f21321f477cd33242))
- **cli:** restore default action to support direct argument passing ([2f3bdfa](https://github.com/SylphxAI/flow/commit/2f3bdfa9f7025db4b918765cbea681552c76b2f7))
- resolve init command never executing - agents now install properly ([5bb3b86](https://github.com/SylphxAI/flow/commit/5bb3b863e374f33d5a953560447ea40ba26d9b21))
- **state-detector:** add target-aware component detection for OpenCode ([5857b64](https://github.com/SylphxAI/flow/commit/5857b6475800c0bbc776ca607b9638df08e361e4))
- **dry-run:** continue to execution phase to show command ([e0c2f79](https://github.com/SylphxAI/flow/commit/e0c2f799e86da869f18575ddecce702b22b86180))
- **execution:** enforce print mode when using continue flag ([01c89e3](https://github.com/SylphxAI/flow/commit/01c89e3af756159492147ef188d46aa5db1ab7d0))
- use ANTHROPIC_AUTH_TOKEN instead of ANTHROPIC_API_KEY for Claude Code ([e1e9a36](https://github.com/SylphxAI/flow/commit/e1e9a3668ee7da8699637416f9bc41f7a8bb319d))
- pass environment variables to spawned target processes ([8dd4b45](https://github.com/SylphxAI/flow/commit/8dd4b4548414a51a89d620d4d3195dd2c050804a))
- remove duplicate environment setup call ([be00d3b](https://github.com/SylphxAI/flow/commit/be00d3b2b589e46dfab9ebf61f6c8cc06956c314))
- remove duplicate 'default' provider in selection list ([4c4d840](https://github.com/SylphxAI/flow/commit/4c4d840f228d0af2b9ed85870c3659c255527cad))
- **cli:** resolve process hanging issue by adding beforeExit handler ([b9b5131](https://github.com/SylphxAI/flow/commit/b9b513183de30fc094d2dcb184138dc1fd9c5116))
- **flow:** resolve monorepo asset paths and improve spawn debugging ([36ec0e6](https://github.com/SylphxAI/flow/commit/36ec0e6483e7e0ac154922c074911da93e3ef5d4))
- **flow:** replace @sylphx/code-core with local debug-logger ([ed54497](https://github.com/SylphxAI/flow/commit/ed5449758ae8a90f8fb8540f16e46c7816571cfd))
- correct package dependencies architecture ([f18b377](https://github.com/SylphxAI/flow/commit/f18b377575f540e5d55e2e2059a32e1f47ade348))
- convert all packages from tsup to bun build ([78446de](https://github.com/SylphxAI/flow/commit/78446de60833f3b1b43844d46de970b000806957))

### ♻️ Refactoring

- **prompts:** remove silent execution constraint from output style ([6fe64d3](https://github.com/SylphxAI/flow/commit/6fe64d322ac1f670f7fbb3a4d80d5b5ed2186267))
- **mcp:** implement SSOT for server configuration ([e55990d](https://github.com/SylphxAI/flow/commit/e55990d39185ae37c95d279ed1983c27cdc24537))
- **settings:** extract checkbox configuration handler ([d76b3a9](https://github.com/SylphxAI/flow/commit/d76b3a9e0885d1d351d02db3c782dcc1550fe937))
- **attach:** extract file attachment pure functions ([edd2e18](https://github.com/SylphxAI/flow/commit/edd2e1885c472b2955bf378bb5f2d41132bc937e))
- **targets:** extract shared pure functions for MCP transforms ([1983d57](https://github.com/SylphxAI/flow/commit/1983d5762220109dcabc01a84e3184b5be544960))
- **flow:** eliminate hardcoded target checks with Target interface ([9de3b4e](https://github.com/SylphxAI/flow/commit/9de3b4e330463de4655d22a7173b0c7d08e0b18d))
- move loadAgentContent and extractAgentInstructions to agent-enhancer ([8e7f466](https://github.com/SylphxAI/flow/commit/8e7f466c61330c2be1783dcbefb5e24a0824f480))
- remove deprecated flow command files ([35db15e](https://github.com/SylphxAI/flow/commit/35db15e11955fa58d92e3ff3180443630010aac8))
- improve modularity and code organization ([62ce9ca](https://github.com/SylphxAI/flow/commit/62ce9ca33ca1133a61df214aa8e0e17bea4bddf0))
- **flow:** unified target selection interface ([25daad9](https://github.com/SylphxAI/flow/commit/25daad9621c9781b177916176e59bbef2b1e625b))
- improve code modularity and organization ([bc74942](https://github.com/SylphxAI/flow/commit/bc74942cfd8c811c494c4c4612e55830ab66eeef))
- **prompts:** restructure with working modes and default behaviors ([6ecd3a7](https://github.com/SylphxAI/flow/commit/6ecd3a7175df9659b4a94d0f08de389e18accf71))
- **standards:** adopt pragmatic functional programming ([a609330](https://github.com/SylphxAI/flow/commit/a6093304ca2812b113e2cdfc36dfde49f7e34fa5))
- **prompts:** revise for MEP compliance ([7296d05](https://github.com/SylphxAI/flow/commit/7296d05d7d7b6c39e5542d30d34bea939a2d1035))
- **core:** make Character section MEP-compliant and modular ([ec23a51](https://github.com/SylphxAI/flow/commit/ec23a517156389bd3cbe2b73ffbeab65debe72b7))
- **prompts:** apply new MEP framework to all prompts ([c166b00](https://github.com/SylphxAI/flow/commit/c166b00a686222269569a48aba0a696770d84e55))
- **rules:** optimize all rules and agents with MEP principles ([9a361d0](https://github.com/SylphxAI/flow/commit/9a361d037172427726e0eb2ea6f7078b83b9906a))
- **rules:** apply MEP to workspace.md ([f9bcea7](https://github.com/SylphxAI/flow/commit/f9bcea7c9f02c3b0bd9e20aa2066fc57cf17057e))
- remove root assets/ - use packages/flow/assets as SSOT ([1f09ef1](https://github.com/SylphxAI/flow/commit/1f09ef1d6c9fbb6c9e8a942e7722ac2c9509844b))
- **sync:** complete redesign with categorization ([95dc778](https://github.com/SylphxAI/flow/commit/95dc778a076ebc4fded7b69ae69cb5f8e6b175cb))
- **sync:** redesign flow for better clarity ([558cf08](https://github.com/SylphxAI/flow/commit/558cf0870b6539b44fae05604c21b6f45bd423be))
- **flow:** apply Minimal Effective Prompt principles to all prompts ([dfbb8a0](https://github.com/SylphxAI/flow/commit/dfbb8a0d5ae0a0fbd05cdc1c8de02a4f11958021))
- remove sylphx-flow MCP server from registry ([b46c99f](https://github.com/SylphxAI/flow/commit/b46c99f61c0ab455899f7305210d9e78b52e6eb6))
- remove all knowledge and search functionality ([f21f0a8](https://github.com/SylphxAI/flow/commit/f21f0a8374f1f4839158f37dacc2a46e1eb1f06e))
- 💥 **hooks:** simplify to notification-only setup ([511fc6b](https://github.com/SylphxAI/flow/commit/511fc6bec27a09c7c407e1034a6d8a613d57b834))
- **embeddings:** convert to pure functional style ([0554f8f](https://github.com/SylphxAI/flow/commit/0554f8f2bb78f9b3804065d7c264078cee7ab599))
- **embeddings:** use createOpenAI() provider instance ([726f3b4](https://github.com/SylphxAI/flow/commit/726f3b4b04d13b13883a4a128c81c7ff7cdd1431))
- **embeddings:** use Vercel AI SDK for multi-provider support ([518e2c6](https://github.com/SylphxAI/flow/commit/518e2c69707a47624d593304816038d905852bf1))
- **search:** unify vector and tfidf search architecture ([bf907f4](https://github.com/SylphxAI/flow/commit/bf907f4979a638861e1400e3f31095246b043283))
- **config:** simplify provider selection - always ask, never save defaults ([ff692fb](https://github.com/SylphxAI/flow/commit/ff692fb9f22ee72fcb1a3d327e21479652e33f38))
- **loop:** optimize loop mode to only repeat command execution ([2e16dfe](https://github.com/SylphxAI/flow/commit/2e16dfedfdcf965a4684be8f4140536c6a12c435))
- **loop:** simplify to core concept - continuous execution ([de53838](https://github.com/SylphxAI/flow/commit/de53838508064d1cae79290589e772c6ba00e9be))
- **init:** deeply integrate init logic into flow command ([663d99a](https://github.com/SylphxAI/flow/commit/663d99a840b6047ecf1e8eff71c55f84e371fefc))
- consolidate init/run into flow command, remove duplicate default action ([be83e3b](https://github.com/SylphxAI/flow/commit/be83e3bb6f650879ea646995f03384224019587d))
- implement modular target/provider/agent selection with improved flow ([26c3f55](https://github.com/SylphxAI/flow/commit/26c3f55829bae2519cc3374126ff5e3bc345ae7b))
- 💥 rename config to .sylphx-flow.json and add intelligent flow automation ([e5f82e6](https://github.com/SylphxAI/flow/commit/e5f82e6047b8df6c01992853fc2e10518e361761))
- **search:** migrate all search service logging to debug package ([a5f7211](https://github.com/SylphxAI/flow/commit/a5f72113ac69adb00e04cf842ddda6011fbd7fef))
- use src/index.ts as CLI entry point instead of bin/ folder ([80273bb](https://github.com/SylphxAI/flow/commit/80273bb4c5b089268b0890929f83cdebfae9e0d6))

### 📚 Documentation

- update documentation to reflect Flow 2.0 philosophy ([dc37c7d](https://github.com/SylphxAI/flow/commit/dc37c7da2f251772da90d60a3f8b19619abf808f))
- **standards:** use full term 'Pragmatic Functional Programming' ([f8f34db](https://github.com/SylphxAI/flow/commit/f8f34db7cdbda69605fa2142ed32320e21ebd53b))
- **rules:** apply MEP principles to workspace rule ([bf6766e](https://github.com/SylphxAI/flow/commit/bf6766e90412b753b2a39d591f1e7714d174a125))
- improve wording clarity - "interval/cooldown" → "wait time" ([e5d5bd4](https://github.com/SylphxAI/flow/commit/e5d5bd46068d30dd1556dd2013f842daf710c072))

### ✅ Tests

- remove obsolete test files ([4b4f0a2](https://github.com/SylphxAI/flow/commit/4b4f0a219eb532c7af3674e61c3f10d45d66f501))

### 🔧 Chores

- format package.json (tabs to spaces) ([ddc6ef7](https://github.com/SylphxAI/flow/commit/ddc6ef7b457881d36ab1a535b5e4d8db5e8090ad))
- remove dead cursor target references ([0d72f5c](https://github.com/SylphxAI/flow/commit/0d72f5ccba6c7b64115abe8a67518eb9740ee866))
- apply @sylphx/doctor fixes for 100% health score ([eea3f3d](https://github.com/SylphxAI/flow/commit/eea3f3d6b652b72246bb3f45e1ee2d3ef4adc9b5))
- remove unused api.types.ts re-export file ([c4a731c](https://github.com/SylphxAI/flow/commit/c4a731c9d753ddfcb55236e393b40615e5ce02cc))
- remove dead code and unused modules ([4813b48](https://github.com/SylphxAI/flow/commit/4813b483c8a3eaeb3f653b6a22678b404a502bb4))
- remove flow-specific .claude configuration from packages/flow ([01ab9bb](https://github.com/SylphxAI/flow/commit/01ab9bb5550fd9fe5f548c033e8ec13dca1fd407))
- test CI with enterprise permissions enabled ([5374934](https://github.com/SylphxAI/flow/commit/53749345d67d8f46d75876b97634f1e68f25bbdf))
- trigger CI after enterprise settings fix ([24acb72](https://github.com/SylphxAI/flow/commit/24acb72157acbc29b6afe35b5a576d92be1c47cf))
- remove all legacy/deprecated code ([a446654](https://github.com/SylphxAI/flow/commit/a4466549ed5874fb9b0a176bfd4824bb0d59bf59))
- remove deprecated code and update comments ([cb577aa](https://github.com/SylphxAI/flow/commit/cb577aa6b503b8f1ac5b2ca9b2ce240bd7dce3a2))
- trigger workflow for temp file fix test ([7f8437b](https://github.com/SylphxAI/flow/commit/7f8437b3fdd71976867c865a965d2005a47597d4))
- trigger release workflow for completion reporting fix ([c9091f8](https://github.com/SylphxAI/flow/commit/c9091f8199c6101084fb638269a431a9476970e8))
- trigger release workflow for v1.5.1 ([51af46c](https://github.com/SylphxAI/flow/commit/51af46c4c1f8bf483d918aa7fac021fbad092bff))
- version packages [skip ci] ([79c211f](https://github.com/SylphxAI/flow/commit/79c211fa1be36684cee509ac9d0a25f16f3736e3))
- version packages [skip ci] ([807acdb](https://github.com/SylphxAI/flow/commit/807acdbd2dd33a90ff937b61802f07739583eb2a))
- version packages [skip ci] ([062a552](https://github.com/SylphxAI/flow/commit/062a552b6b4efa0c652c7e6b651ce0ba99d31960))
- version packages [skip ci] ([30c5b7e](https://github.com/SylphxAI/flow/commit/30c5b7e813d3276022f894658449955ef482ef14))
- version packages [skip ci] ([43b0818](https://github.com/SylphxAI/flow/commit/43b0818312517d7bc62cdc4634df6e0763cca181))
- version packages [skip ci] ([35a8757](https://github.com/SylphxAI/flow/commit/35a875747db815caaf6d0c575f732acd5eeacdc6))
- version packages [skip ci] ([48b4c93](https://github.com/SylphxAI/flow/commit/48b4c9311ceff1a9eb430022fde18f6a78a48f76))
- version packages [skip ci] ([fb47ae6](https://github.com/SylphxAI/flow/commit/fb47ae65105cddfe04751bc84dc1023129a9b84a))
- version packages [skip ci] ([9f988f8](https://github.com/SylphxAI/flow/commit/9f988f8e376ec9409fa84b7f1956bac178df91c5))
- version packages [skip ci] ([6c0ab87](https://github.com/SylphxAI/flow/commit/6c0ab87432d4593b4711959fe6a5d7e5a10d83dc))
- version packages [skip ci] ([3fa0d1b](https://github.com/SylphxAI/flow/commit/3fa0d1b18ec669223636aedbf80d8ff9c3582f59))
- version packages [skip ci] ([5c31bde](https://github.com/SylphxAI/flow/commit/5c31bde3f266d6e998144b398154a4d84ca88205))
- version packages [skip ci] ([9a250a1](https://github.com/SylphxAI/flow/commit/9a250a1918bbcbf386e729e29b3949659077d897))
- bump version to 1.4.8 ([ab631a4](https://github.com/SylphxAI/flow/commit/ab631a4bd3c861c4788725c8a0951603b6222583))
- bump version to 1.4.7 ([be4e33f](https://github.com/SylphxAI/flow/commit/be4e33f8b1307071203e417e8b0f2dc8d15b898b))
- version packages (#8) ([8e24285](https://github.com/SylphxAI/flow/commit/8e24285d2c45e6290f67b64c128636fe1f566e01))
- add changeset and revert version for CI ([86327a5](https://github.com/SylphxAI/flow/commit/86327a588165792acead4bfc3bb03a8f753653c9))
- remove debug logging ([b45c817](https://github.com/SylphxAI/flow/commit/b45c817a5c0c6a38e648000beb5f975e15f44b64))
- bump version to 1.4.6 ([698559a](https://github.com/SylphxAI/flow/commit/698559aac5488a8e7f5b11353c34d972b64a2f55))
- sync package.json with published v1.4.5 ([5aa5e57](https://github.com/SylphxAI/flow/commit/5aa5e573794cc7e239954b0c2de695fc8c31d1f3))
- add changeset and revert version for CI ([1674a9a](https://github.com/SylphxAI/flow/commit/1674a9a0235fa2655d19732925f8b6195cb57388))
- bump version to 1.4.5 ([bf23dce](https://github.com/SylphxAI/flow/commit/bf23dcedb27b7e5fce4305240ba8782f724982ba))
- version packages (#7) ([8cc452c](https://github.com/SylphxAI/flow/commit/8cc452c09f2d8c19e3119b78f498de25b2fb9a77))
- bump version to 1.4.3 ([9c99271](https://github.com/SylphxAI/flow/commit/9c9927166e9a083696efefdea7a82f951319d26a))
- bump version to 1.4.2 ([c553766](https://github.com/SylphxAI/flow/commit/c553766a6f14a78e7dbaa225e0bc20640a32b05f))
- bump version to 1.4.1 ([38878fc](https://github.com/SylphxAI/flow/commit/38878fc436d6ee43374a65d90c31f9d016cc664a))
- bump version to 1.4.0 ([48193e5](https://github.com/SylphxAI/flow/commit/48193e541c8b3a1e0707916a7f5d2063b8c539d5))
- bump version to 1.3.1 ([b203ec4](https://github.com/SylphxAI/flow/commit/b203ec4f98a0ae66cf140834637af60afd686e54))
- bump version to 1.3.0 ([10dd6b6](https://github.com/SylphxAI/flow/commit/10dd6b6badf4a2771f21deb693e4bb7acd83c00f))
- bump version to 1.2.1 ([800e5b8](https://github.com/SylphxAI/flow/commit/800e5b823062407f3c2f9ba0b6a8de71aa65146a))
- remove unused security imports from servers config ([c67d841](https://github.com/SylphxAI/flow/commit/c67d841dca854b990ddd2065705f2418f679fd76))
- cleanup project - remove temporary docs and backups ([66c3493](https://github.com/SylphxAI/flow/commit/66c3493ee0acf8c0a74e512c39ef11ffa310d722))
- version packages (#5) ([091a52a](https://github.com/SylphxAI/flow/commit/091a52ae278870d1a8a49c83a663163265f921a5))
- configure package for npm publishing ([35f9419](https://github.com/SylphxAI/flow/commit/35f9419918a8210e2060ce906071597b6cc638e2))
- prepare for 1.0.0 release ([6694786](https://github.com/SylphxAI/flow/commit/6694786eb50a3a86a5b1c31e211e019153bb8dfa))
- **flow:** add debug package dependency ([87e89b9](https://github.com/SylphxAI/flow/commit/87e89b9d886865ab9a4844836392a27a11f5a698))
- merge v0.2.11 hotfix from main ([0a1da3e](https://github.com/SylphxAI/flow/commit/0a1da3e3723c8d4fd34d1fd1f15d7bca875b5c6d))
- merge v0.2.10 database fixes from main ([16f90ab](https://github.com/SylphxAI/flow/commit/16f90ab11b2100cc1a9c804b7bdf229c25008752))
- merge Windows database fix v0.2.9 from main ([e4628a5](https://github.com/SylphxAI/flow/commit/e4628a54ca3dd9641a3da27e32067a41e22af9a1))
- merge Windows database fix v0.2.8 from main ([abb47f6](https://github.com/SylphxAI/flow/commit/abb47f6a65698b6ead4051c7529794aa0a739595))
- merge Windows database fix v0.2.7 from main ([e4c0393](https://github.com/SylphxAI/flow/commit/e4c039310d86b64c64ae7ad2af83162224b2ae81))
- merge Windows database fix from main (v0.2.6) ([c16dec7](https://github.com/SylphxAI/flow/commit/c16dec715bfc0e0444e368d2a5b8a6d4ebc63c13))

### ⏪ Reverts

- manual version bump - let changeset CI handle versioning ([c0b79ee](https://github.com/SylphxAI/flow/commit/c0b79ee69e026d0ce3d502dfdb476db2bbd414dc))

### 💥 Breaking Changes

- **mode:** make replace mode default, add --merge flag ([6b3539b](https://github.com/SylphxAI/flow/commit/6b3539b52f576fb307141b3e30dd513d5c5ce250))
  Default behavior changed from merge to replace
- **replace:** add --replace mode for complete settings replacement ([43c6234](https://github.com/SylphxAI/flow/commit/43c6234d6b886b3d85cef43bddae5bc66b2f6292))
  Removed --persist flag, added --replace flag instead
- **detection:** detect target by command availability, not folders ([fa6d826](https://github.com/SylphxAI/flow/commit/fa6d826483183fd9e66493bb0bd7c6184c7457f4))
  Target detection now based on installed commands
- **hooks:** simplify to notification-only setup ([511fc6b](https://github.com/SylphxAI/flow/commit/511fc6bec27a09c7c407e1034a6d8a613d57b834))
  Removed SessionStart hook that was displaying system information
- **flow:** implement --sync flag to synchronize with Flow templates ([a34f48f](https://github.com/SylphxAI/flow/commit/a34f48fea88cbf121c04bbb17a9e4adeb96fec7a))
  --clean flag renamed to --sync for clarity
- rename config to .sylphx-flow.json and add intelligent flow automation ([e5f82e6](https://github.com/SylphxAI/flow/commit/e5f82e6047b8df6c01992853fc2e10518e361761))
  Configuration file renamed from .claude-flow.json

## 2.2.0 (2025-12-01)

### ✨ Features

- **prompts:** add Research-First Principle for mandatory investigation ([c9f6b41](https://github.com/SylphxAI/flow/commit/c9f6b41ade656fe5a7a2cb707704722623dc77d8))
- **prompts:** strengthen commit policy for proactive commits ([e445931](https://github.com/SylphxAI/flow/commit/e445931dc57f17dadedcf582381466412fd364f6))
- **cli:** add 'flow' command alias ([74c7976](https://github.com/SylphxAI/flow/commit/74c79765f10a7f5779991321235afabed18871b3))

## 2.1.11 (2025-11-29)

### 🐛 Bug Fixes

- **mcp:** remove --mcp-config flag, rely on project .mcp.json ([b11af31](https://github.com/SylphxAI/flow/commit/b11af31b1f31551e820e03d6a9404382656aef93))

## 2.1.10 (2025-11-28)

### 🐛 Bug Fixes

- **upgrade:** prevent recursive self-upgrade with env flag ([43416fa](https://github.com/SylphxAI/flow/commit/43416faabf18a6ba93c4c739a7fe1300aa63cb60))
- **upgrade:** re-exec process after self-upgrade ([d2111f8](https://github.com/SylphxAI/flow/commit/d2111f800eb91e0b377d4e434ccdb214d71a1d27))

## 2.1.9 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** use process.cwd() instead of undefined cwd variable ([aa99db0](https://github.com/SylphxAI/flow/commit/aa99db0a96bb333c38da3c73c325fddf124948d8))

## 2.1.8 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** explicitly pass --mcp-config flag to Claude Code ([fa955e9](https://github.com/SylphxAI/flow/commit/fa955e95b14bbbec3ebf7e93dab5ca959e9f012b))

## 2.1.7 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** approve MCP servers for Claude Code during attach ([19cdc3b](https://github.com/SylphxAI/flow/commit/19cdc3bea9df58bc9c1fe55242a8e2858c1303c1))

## 2.1.6 (2025-11-28)

### 🐛 Bug Fixes

- **settings:** respect saved MCP server enabled state ([8447cea](https://github.com/SylphxAI/flow/commit/8447cea1b2f46e49cfc1bd7e57e557307d072163))
- **mcp:** return default servers when no config exists ([bd6c588](https://github.com/SylphxAI/flow/commit/bd6c58819cdde8e31bd18cdc2f05c2c45e4f3d39))

### ♻️ Refactoring

- **mcp:** implement SSOT for server configuration ([e0b5ee0](https://github.com/SylphxAI/flow/commit/e0b5ee01d4952e825d81005465147ce39963bbd0))

### 🔧 Chores

- format package.json (tabs to spaces) ([305096a](https://github.com/SylphxAI/flow/commit/305096a9e276a3626415d76b8f313e95dc6daeff))

## 2.1.5 (2025-11-28)

### 🐛 Bug Fixes

- **settings:** use MCP_SERVER_REGISTRY instead of hardcoded list ([79fb625](https://github.com/SylphxAI/flow/commit/79fb625c27f58f7f62902314d92c205fdc84a06e))

### ♻️ Refactoring

- **settings:** extract checkbox configuration handler ([66303bb](https://github.com/SylphxAI/flow/commit/66303bb21a5281e5f358c69b8a6c143f3866fa76))
- **attach:** extract file attachment pure functions ([5723be3](https://github.com/SylphxAI/flow/commit/5723be3817804228014ceec8de27f267c990fbe8))
- **targets:** extract shared pure functions for MCP transforms ([0bba2cb](https://github.com/SylphxAI/flow/commit/0bba2cbc4a4233e0d63a78875346a2e9c341d803))

### 🔧 Chores

- remove dead cursor target references ([bf16f75](https://github.com/SylphxAI/flow/commit/bf16f759ec4705ddf0a763ea0ef6c778c91ccbbe))

## 2.1.4 (2025-11-28)

### ♻️ Refactoring

- **flow:** eliminate hardcoded target checks with Target interface ([1dc75f9](https://github.com/SylphxAI/flow/commit/1dc75f9d4936b51554b1d09bf8576f832ce131e9))

### 🔧 Chores

- apply @sylphx/doctor fixes for 100% health score ([ae55969](https://github.com/SylphxAI/flow/commit/ae5596924dab48675ff3100b40f67651e7ebe26f))
- remove unused api.types.ts re-export file ([ad8f6a6](https://github.com/SylphxAI/flow/commit/ad8f6a6b8dcad75d2c0201f2286e52adccb728c7))
- remove dead code and unused modules ([6eaa904](https://github.com/SylphxAI/flow/commit/6eaa90438dcb40f9508953e874bf8c04204ae017))

## 2.1.3

### Patch Changes

- f571de3: Fix rules and output styles loading logic

  - Fix output styles duplication: Only attach during runtime, not during attach phase
  - Fix rules loading: Use intersection of agent frontmatter rules and globally enabled rules
  - Remove deprecated command files (execute.ts, setup.ts, run-command.ts)
  - Move loadAgentContent and extractAgentInstructions to agent-enhancer.ts

## 2.1.2

### Patch Changes

- ad6ae71: Fix upgrade command not detecting Flow CLI version

  **Bug Fix:**

  The `sylphx-flow upgrade` command was incorrectly reading the version from project config file instead of the globally installed CLI package. This caused it to always report "All components are up to date" even when a newer version was available.

  **Changes:**

  - Fixed `getCurrentFlowVersion()` to read from the running CLI's package.json
  - Added fallback to check globally installed package version
  - Now correctly detects when Flow CLI needs updating

  **Before:**

  ```bash
  $ sylphx-flow upgrade
  ✓ All components are up to date  # Wrong!
  ```

  **After:**

  ```bash
  $ sylphx-flow upgrade
  Sylphx Flow: 2.1.1 → 2.1.2
  Upgrade to latest version? (Y/n)
  ```

## 2.1.1

### Patch Changes

- 8ae48d6: Fix singleFiles location and improve settings cleanup

  **Bug Fixes:**

  1. Fixed silent.md location bug - output style files were incorrectly written to project root instead of target config directory (.claude/ or .opencode/)

  2. Enhanced clearUserSettings to ensure complete cleanup in replace mode:
     - Now clears ALL user configuration including hooks, complete MCP config, rules, and singleFiles
     - Removes entire MCP section (not just servers) to properly clear user hooks
     - Added legacy cleanup to remove incorrectly placed files from project root

  This fixes the issue where user's hooks and MCP configs were still affecting execution even in replace mode (non-merge mode).

## 2.1.0

### Minor Changes

- 09608be: Auto-installation and auto-upgrade features

  **New Features:**

  - **Auto-detection**: Automatically detects installed AI CLIs (Claude Code, OpenCode, Cursor)
  - **Auto-installation**: If no AI CLI is detected, prompts user to select and installs it automatically
  - **Auto-upgrade**: Before each Flow execution, automatically checks and upgrades Flow and target CLI to latest versions
  - **Zero-friction setup**: New users can install Flow and start using it immediately without manual setup

  **Implementation:**

  - Created `TargetInstaller` service for detecting and installing AI CLI tools
  - Created `AutoUpgrade` service for automatic version checking and upgrading
  - Integrated both services into execution flow (`execute-v2.ts`)
  - Smart package manager detection (npm, bun, pnpm, yarn)

  **User Experience:**

  Flow 2.0 now delivers on the promise of "One CLI to rule them all":

  1. **First run**: User installs Flow → Flow detects no AI CLI → Prompts to select one → Installs it automatically
  2. **Every run**: Flow checks for updates → Upgrades Flow and AI CLI to latest → Runs user's task

  Example flow:

  ```
  $ npm install -g @sylphx/flow
  $ sylphx-flow "build my app"

  🔍 Detecting installed AI CLIs...
  ⚠️  No AI CLI detected

  ? No AI CLI detected. Which would you like to use?
  ❯ Claude Code
    OpenCode
    Cursor

  ✓ Claude Code installed successfully

  🔄 Checking for updates...
  ✓ Flow is up to date
  ✓ Claude Code is up to date

  🚀 Starting Flow session...
  ```

  **Philosophy:**

  This implements Flow's core principle of "Transcendent Simplicity" - users don't need to know which AI CLI to use or how to install/upgrade it. Flow handles everything automatically.

### Patch Changes

- cc065f2: Code cleanup and refactoring

  **Removed:**

  - All legacy config migration code (~70 lines)
  - OpenCode old directory cleanup logic (~16 lines)
  - Deprecated FileInstaller and MCPInstaller classes (~60 lines)
  - Unused deprecated exports (ALL_TARGETS, IMPLEMENTED_TARGETS)

  **Refactored:**

  - Migrated from class-based installers to functional API
  - opencode.ts: Direct function calls instead of class wrappers
  - claude-code.ts: Direct function calls instead of class wrappers

  **Improved:**

  - Removed ~179 lines of dead code
  - Cleaner functional API
  - Better code organization and modularity
  - Comprehensive JSDoc documentation
  - Consistent error handling patterns

  **Result:**

  - Zero technical debt
  - Zero deprecated code
  - Modern, maintainable codebase

- edb043c: Fix target selection logic to properly distinguish between three cases

  **Fixed:**

  - Target selection now correctly handles three distinct scenarios:
    1. User explicitly set "ask-every-time" → always prompt
    2. User has no setting (undefined/null) → allow auto-detect
    3. User has specific target → use that target

  **Improved:**

  - Better code clarity with explicit case handling
  - More predictable behavior for different user preferences
  - Enhanced logic comments for maintainability

## 2.0.0

### Major Changes

- aaadcaa: Settings-based configuration and improved user experience

  **New Features:**

  - **Settings management**: Configure agents, rules, and output styles via `sylphx-flow settings`
    - Select which agents are enabled
    - Set default agent to use
    - Enable/disable specific rules (core, code-standards, workspace)
    - Enable/disable output styles (silent)
  - **Settings-driven execution**: Flow respects your settings and only loads enabled components
  - **Config files**: All settings stored in `~/.sylphx-flow/` (settings.json, flow-config.json, provider-config.json, mcp-config.json)
  - **Git skip-worktree integration**: Flow automatically hides `.claude/` and `.opencode/` changes from git
    - Uses `git update-index --skip-worktree` to hide Flow's temporary modifications
    - Prevents LLM from seeing or committing Flow's settings changes
    - Automatically restores git tracking after execution
    - Works seamlessly with version-controlled settings

  **Breaking Changes:**

  - Removed `--quick` flag - no longer needed
  - Removed first-run setup wizard - configs are created automatically with sensible defaults
  - Agent loading now respects enabled rules and output styles from settings

  **Improvements:**

  - Config files are automatically initialized on first use with default values
  - Provider selection happens inline when needed (if set to "ask-every-time")
  - Fixed Ctrl+C handling to ensure settings are restored immediately
  - Simplified CLI options - only `--merge` flag for attach strategy
  - Default agent can be set in settings (falls back to 'coder' if not set)

  **Ctrl+C Fix:**
  When users press Ctrl+C during interactive prompts, the application now:

  - Catches the cancellation gracefully
  - Runs cleanup (restores backed-up settings)
  - Shows a friendly cancellation message
  - Exits cleanly

  Previously, pressing Ctrl+C would exit immediately without restoring settings, requiring recovery on the next run.

### Minor Changes

- 9fa65d4: Add automatic upgrade detection with smart package manager support

  - Auto-detect updates on startup with non-intrusive notifications
  - Enhanced `upgrade` command with `--auto` flag for automatic installation
  - Smart package manager detection (npm, bun, pnpm, yarn)
  - Version checking against npm registry for both Flow and target platforms
  - Package-manager-specific upgrade commands in notifications
  - New UPGRADE.md documentation with package manager support
  - Silent background checks that don't block execution
  - Support for both interactive and automatic upgrade flows
  - Comprehensive test coverage for package manager detection

## 1.8.2

### Patch Changes

- 9059450: Enhance Next Actions section with suggestions when no clear next step

  Updated completion report structure to include proactive suggestions in Next Actions section:

  - Remaining work (existing functionality)
  - Suggestions when no clear next step (new)

  Benefits:

  - Guides user on potential improvements
  - Provides proactive recommendations
  - Helps prevent "what's next?" moments
  - Encourages continuous iteration

  Example updated to show suggestion format: "Consider adding rate limiting, implement refresh token rotation, add logging for security events"

## 1.8.1

### Patch Changes

- ad56fc3: Add structured completion report format to prompts

  Added comprehensive 3-tier report structure to guide task completion reporting:

  **Tier 1 - Always Required:**

  - Summary, Changes, Commits, Tests, Documentation, Breaking Changes, Known Issues

  **Tier 2 - When Relevant:**

  - Dependencies, Tech Debt, Files Cleanup/Refactor, Next Actions

  **Tier 3 - Major Changes Only:**

  - Performance, Security, Migration, Verification, Rollback, Optimization Opportunities

  Benefits:

  - Forces LLM to remember completed work (must write report)
  - Provides reviewable, structured output
  - Prevents incomplete reporting
  - Consistent format across all tasks

  Includes detailed example for authentication refactoring showing proper usage of each section.

- a4b0b48: Fix broken imports and Ctrl+C handling

  - Fix Ctrl+C gracefully exits during target selection instead of showing stack trace
  - Restore accidentally deleted object-utils.ts file
  - Correct 16 broken relative import paths from refactor reorganization:
    - target-config.ts: Fix imports to config/, core/, services/ (5 paths)
    - sync-utils.ts: Fix imports to types, servers, paths (3 paths)
    - mcp-config.ts: Fix imports to config/, core/, target-config (4 paths)
    - target-utils.ts: Fix import to types (1 path)
    - execute.ts, setup.ts, flow-orchestrator.ts: Fix sync-utils paths (3 paths)

  All module resolution errors fixed. Application now runs successfully.

- 7e3a3a1: Refactor codebase for better modularity and maintainability

  - Split flow-command.ts into focused modules (1207 → 258 lines, 78% reduction)
  - Reorganize utils into feature-based directories (config, display, files, security)
  - Extract reusable utilities (version, banner, status, prompt resolution)
  - Create modular flow command structure in src/commands/flow/
  - Add JSONC parser utility for JSON with comments support
  - Update all imports to use new modular structure
  - Improve code organization and separation of concerns

## 1.8.0

### Minor Changes

- 8ed73f9: Refactor prompts with working modes and default behaviors

  Major improvements to agent prompts:

  - **Default Behaviors**: Add automatic actions section to core.md (commits, todos, docs, testing, research)
  - **Working Modes**: Implement unified mode structure across all agents
    - Coder: 5 modes (Design, Implementation, Debug, Refactor, Optimize)
    - Orchestrator: 1 mode (Orchestration)
    - Reviewer: 4 modes (Code Review, Security, Performance, Architecture)
    - Writer: 4 modes (Documentation, Tutorial, Explanation, README)
  - **MEP Compliance**: Improve Minimal Effective Prompt standard (What + When, not Why + How)
  - **Remove Priority Markers**: Replace P0/P1/P2 with MUST/NEVER for clarity
  - **Reduce Token Usage**: 13% reduction in total content (5897 → 5097 words)

  Benefits:

  - Clear triggers for automatic behaviors (no more manual reminders needed)
  - Unified mode structure across all agents
  - Better clarity on what to do when
  - No duplicated content between files
  - Improved context efficiency

## 1.7.0

### Minor Changes

- Add orphaned hooks detection and removal to sync command

  The sync command now properly detects and prompts for removal of hooks that exist locally but are not in the configuration. This ensures full synchronization between local settings and the Flow configuration.

  **New Features:**

  - Detects orphaned hooks in `.claude/settings.json`
  - Shows orphaned hooks in sync preview
  - Allows users to select which orphaned hooks to remove
  - Properly cleans up settings.json after removal

  **Breaking Changes:**

  - Internal API: `selectUnknownFilesToRemove()` now returns `SelectedToRemove` object instead of `string[]`

## 1.6.13

### Patch Changes

- 746d576: Fix missing chalk import in claude-code target causing ReferenceError in dry-run mode
- ea6aa39: fix(sync): display hooks configuration in sync preview

  When running `sylphx-flow --sync`, the sync preview now shows that hooks will be configured/updated. This makes it clear to users that hook settings are being synchronized along with other Flow templates.

  Previously, hooks were being updated during sync but this wasn't visible in the sync preview output, leading to confusion about whether hooks were being synced.

- 6ea9757: Test repository link in Slack notification

## 1.6.12

### Patch Changes

- 5873a9f: Test Slack notification double parse fix

## 1.6.11

### Patch Changes

- 5e170c7: Test Slack notification toJSON fix

## 1.6.10

### Patch Changes

- 2efbfe4: Test Slack notification forEach fix

## 1.6.9

### Patch Changes

- 2ecbdae: Fix Slack notification JSON parsing with temp file approach.
- 2634f30: Test temp file fix for Slack notification - should now display correct package name.

## 1.6.8

### Patch Changes

- 1fbd555: Final test: Slack notification with single-quoted string concatenation.

## 1.6.7

### Patch Changes

- 5b44829: Test Slack notification with heredoc fix - YAML quoting resolved.
- 197e4af: Test Slack notification with one-liner - YAML syntax issues resolved.

## 1.6.6

### Patch Changes

- 47c1d39: Test Slack notification with string concatenation fix - template literal escaping resolved.

## 1.6.5

### Patch Changes

- bfa33df: Test Slack notification with errexit fix - bash -e handling resolved.

## 1.6.4

### Patch Changes

- 02cc912: Test Slack notification with env var fix - shell escaping resolved.

## 1.6.3

### Patch Changes

- db58e6a: Test Slack notification with fixed workflow - should now display correct package name and version.

## 1.6.2

### Patch Changes

- a5e299d: Test Slack notification integration with upgraded publish workflow.

## 1.6.1

### Patch Changes

- 8c6fb07: Use full term "Pragmatic Functional Programming" instead of abbreviation "Pragmatic FP" for clarity and searchability.

## 1.6.0

### Minor Changes

- 4a025d0: Refactor code standards to pragmatic functional programming. Replace dogmatic FP rules with flexible, pragmatic approach following MEP principles.

  **Key Changes:**

  - Programming Patterns: Merge 4 rules into "Pragmatic FP" (-58% tokens). Business logic pure, local mutations acceptable, composition default but inheritance when natural.
  - Error Handling: Support both Result types and explicit exceptions (previously forced Result/Either).
  - Anti-Patterns: Remove neverthrow enforcement, allow try/catch as valid option.

  **Philosophy Shift:** From "pure FP always" to "pragmatic: use best tool for the job". More MEP-compliant (prompt not teach), more flexible, preserves all core values.

## 1.5.4

### Patch Changes

- dfd0264: Revise completion reporting prompts for MEP compliance. Removed over-explanation, teaching language, and redundancy. Changed from prescriptive "what to include" lists to directive triggers. Reduced silent.md from 53 to 38 lines (-28%). Follows MEP principle: prompt (trigger behavior) not teach (explain rationale).

## 1.5.3

### Patch Changes

- f6d55a7: Fix LLM silent completion behavior by clarifying when to report results. Updated silent.md, coder.md, and core.md to distinguish between during-execution silence (no narration) and post-completion reporting (always report what was accomplished, verification status, and what changed). This addresses the issue where agents would complete work without telling the user what was done.

## 1.5.2

### Patch Changes

- fbf8f32: Add Personality section with research-backed trait descriptors (Methodical Scientist, Skeptical Verifier, Evidence-Driven Perfectionist) to combat rash LLM behavior. Refactor Character section to be more MEP-compliant and modular. Research shows personality priming achieves 80% behavioral compliance and is the most effective control method.

## 1.5.1

### Patch Changes

- 76b3c84: Add Playwright MCP server as default pre-configured server for browser automation and testing capabilities

## 1.5.0

### Minor Changes

- 65c2446: Refactor all prompts with research-backed MEP framework. Adds priority markers (P0/P1/P2), XML structure for complex instructions, concrete examples, and explicit verification criteria. Based on research showing underspecified prompts fail 2x more often and instruction hierarchy improves robustness by 63%. All prompts now pass "intern on first day" specificity test while remaining minimal.

## 1.4.20

### Patch Changes

- d34613f: Add comprehensive prompting guide for writing effective LLM prompts. Introduces 5 core principles: pain-triggered, default path, immediate reward, natural integration, and self-interest alignment. This is a meta-level guide for maintainers, not for agents to follow.

## 1.4.19

### Patch Changes

- c7ce3ac: Fix workspace.md execution issues with realistic strategies

  Critical fixes:

  - Fixed cold start: Check exists → create if needed → read (was: read immediately, failing if missing)
  - Changed to batch updates: Note during work, update before commit (was: update immediately, causing context switching)
  - Realistic verification: Spot-check on read, full check before commit (was: check everything on every read)
  - Objective ADR criteria: Specific measurable conditions (was: subjective "can reverse in <1 day?")
  - Added concrete examples to all templates (was: generic placeholders causing confusion)

  Additional improvements:

  - Added SSOT duplication triggers (when to reference vs duplicate)
  - Added content boundary test (README vs context.md decision criteria)
  - Added detailed drift fix patterns with conditions
  - Expanded red flags list
  - Clarified update strategy with rationale

  Result: Executable, realistic workspace management that LLM agents can actually follow.

  Before: 265 lines with execution problems
  After: 283 lines (+7%) with all critical issues fixed, higher information density

## 1.4.18

### Patch Changes

- 156db14: Optimize rules and agents with MEP principles

  - Optimized core.md: removed duplicates, agent-specific content (222→91 lines, -59%)
  - Optimized code-standards.md: removed duplicates, kept unique technical content (288→230 lines, -20%)
  - Optimized workspace.md: applied MEP, added drift resolution (317→265 lines, -16%)
  - Optimized coder.md: added Git workflow section (157→169 lines)
  - Optimized orchestrator.md: condensed orchestration flow (151→120 lines, -21%)
  - Optimized reviewer.md: condensed review modes and output format (161→128 lines, -20%)
  - Optimized writer.md: condensed writing modes (174→122 lines, -30%)

  Overall reduction: 1,470→1,125 lines (-23%)

  All files now follow MEP (Minimal Effective Prompt) principles: concise, direct, trigger-based, no step-by-step, no WHY explanations.

## 1.4.17

### Patch Changes

- ef8463c: Refactor workspace.md rule to follow Minimal Effective Prompt principles. Reduced from 486 to 244 lines (50% reduction) by removing teaching, applying trigger-based outcomes, condensing templates, and trusting LLM capability.

## 1.4.16

### Patch Changes

- 54ad8ff: Fix agent enhancement by reading rules before transformation (CRITICAL):
  - Rules field was read AFTER transformation (which strips it for Claude Code)
  - Now reads rules from original content BEFORE transformation
  - Rules field correctly stripped in final output (Claude Code doesn't use it)
  - Fixes: only core.md was loaded, code-standards and workspace were ignored

## 1.4.15

### Patch Changes

- 638418b: Fix agent enhancement by preserving rules field in frontmatter (CRITICAL):
  - convertToClaudeCodeFormat was stripping the rules field
  - Enhancement logic needs rules field to know which rules to load
  - Now preserves rules array in transformed frontmatter
  - Fixes: only core.md was being loaded, code-standards and workspace were ignored

## 1.4.14

### Patch Changes

- 11abdf2: Add workspace.md rule to agent frontmatter:

  - Coder: added workspace (creates .sylphx/ documentation)
  - Reviewer: added workspace (checks workspace conventions)
  - Writer: added workspace (documents .sylphx/ patterns)
  - Orchestrator: kept core only (coordination, no file creation)

  Ensures workspace documentation rule is properly embedded in Claude Code agent files.

## 1.4.13

### Patch Changes

- 1d0ac4e: Add startup check for new templates:
  - Detects missing templates on startup (new templates not installed locally)
  - Shows notification with count of new agents/commands/rules
  - Prompts user to run --sync to install
  - Ignores unknown files (custom user files)
  - Non-blocking - just informational

## 1.4.12

### Patch Changes

- d88d280: Show missing templates in sync preview:
  - Added "Will install (new templates)" section
  - Users can now see which templates will be newly installed
  - Better visibility into what changes sync will make

## 1.4.11

### Patch Changes

- 22ddfb9: Fix sync to dynamically scan templates instead of hardcoding (CRITICAL):
  - Now scans assets/ directory at runtime for agents, slash commands, and rules
  - Prevents sync from breaking when templates change
  - Old commands (commit, context, explain, review, test) now correctly detected as unknown files
  - New commands (cleanup, improve, polish, quality, release) properly recognized as Flow templates

## 1.4.10

### Patch Changes

- 126de1e: Fix CI auto-publish workflow NPM authentication

## 1.4.9

### Patch Changes

- 4493ee0: Remove root assets directory and simplify publish flow:

  **Cleanup:**

  - Removed duplicate root assets/ directory (4080 lines)
  - packages/flow/assets/ is now single source of truth
  - Updated prepublishOnly to no-op (assets already in package)

  **Templates (now correctly published):**

  - Agents: coder, orchestrator, reviewer, writer (MEP optimized)
  - Rules: core, code-standards, workspace (MEP optimized + NEW)
  - Slash commands: cleanup, improve, polish, quality, release (NEW)
  - Output styles: silent (prevent report files)

  **Root cause:** Root assets/ was copied to package during publish, causing template sync issues.

## 1.4.6

### Patch Changes

- b4a5087: Restore MEP-optimized templates accidentally reverted in v1.3.0:

  **Agents (MEP optimized):**

  - Coder, Orchestrator, Reviewer, Writer - streamlined prompts with 40% token reduction

  **Rules (MEP optimized + new):**

  - core.md - universal rules with behavioral triggers
  - code-standards.md - shared quality standards
  - workspace.md - NEW: auto-create .sylphx/ workspace documentation

  **Slash Commands (complete replacement):**

  - Removed: commit, context, explain, review, test
  - Added: cleanup, improve, polish, quality, release
  - Essential workflows over granular utilities

  **Output Styles:**

  - silent.md - prevent agents from creating report files

  **Root cause:** Working on sync feature from stale branch without latest templates.

## 1.4.4

### Patch Changes

- 4de084e: Add comprehensive debug logging to trace sync file operations:

  - **Deletion verification**: Check file exists before/after unlink to verify actual deletion
  - **Installation logging**: Show force flag status, file paths, and write verification
  - **Force flag propagation**: Log when force mode is activated for agents and slash commands

  This diagnostic release helps identify why sync appears successful but git shows no changes.

## 1.4.3

### Patch Changes

- Fix sync not actually updating files (CRITICAL):
  - Installation was comparing content and skipping writes
  - Even after deletion, files weren't updated if content "matched"
  - Add force mode that always overwrites during sync
  - Sync now properly updates all files regardless of content

## 1.4.2

### Patch Changes

- Add visible deletion output during sync:
  - Show each file being deleted with checkmark
  - Display MCP servers being removed
  - Clear visual feedback of the full sync process
  - Users can now see exactly what's happening

## 1.4.1

### Patch Changes

- Fix rules scanning showing all project markdown files:
  - Skip rules scanning for Claude Code (rules embedded in agent files)
  - Only scan when target has explicit rulesFile config
  - Prevent scanning entire project directory

## 1.4.0

### Minor Changes

- Complete sync redesign with intelligent file categorization:
  - Categorize all files: agents, commands, rules, MCP servers
  - Separate Flow templates (auto-sync) from unknown files (user decides)
  - New flow: preview → select unknowns → summary → confirm → execute
  - Preserve user custom files by default (no accidental deletion)
  - Multi-select UI for unknown files
  - Clear visibility: what syncs, what's removed, what's preserved
  - Remove all Chinese text (English only)

## 1.3.1

### Patch Changes

- Redesign sync flow for better clarity:
  - Remove duplicate config files in preserved list
  - Show MCP check in preview upfront (not after confirmation)
  - Combined preview: templates + MCP servers + preserved files
  - Clear sections with emojis for easy scanning

## 1.3.0

### Minor Changes

- Enhanced --sync with MCP registry checking:
  - Detect servers not in Flow registry (removed or custom)
  - Interactive selection for removal
  - Clean removal from .mcp.json
  - Flow: sync templates → check MCP → remove selected

## 1.2.1

### Patch Changes

- Apply MEP principles to workspace documentation rule:
  - Condensed from verbose instructions to condition→action format
  - Removed step-by-step teaching and command examples
  - Embedded verification in directives
  - 31% reduction while maintaining clarity

## 1.2.0

### Minor Changes

- 2272596: Enhanced agent system prompts with Minimal Effective Prompt principles:

  - **Workflow Standards**: Added continuous atomic commits, semver discipline (minor-first), TypeScript release workflow with changeset + CI, and proactive pre-commit cleanup
  - **Research-First Mindset**: Enforced research before implementation to prevent outdated approaches
  - **Silent Mode Fix**: Prevented agents from creating report files to compensate for not speaking
  - **Proactive Cleanup**: Added mandatory pre-commit hygiene - refactor, remove unused code, delete outdated docs, fix tech debt
  - **MEP Refactor**: Refactored all prompts (coder, orchestrator, reviewer, writer, core, code-standards, silent) using Minimal Effective Prompt principles - trust LLM, WHAT+WHEN not HOW+WHY, condition→action format, ~40% token reduction

  Prime directive: Never accumulate misleading artifacts. Research is mandatory. Tests and benchmarks required (.test.ts, .bench.ts).

## 1.1.1

### Patch Changes

- 5b1adfb: Fix missing runtime dependencies in package.json

  Add missing dependencies that are required when the package is installed globally:

  - react and ink (for UI components)
  - drizzle-orm and @libsql/client (for database operations)
  - @modelcontextprotocol/sdk (for MCP features)
  - @lancedb/lancedb (for vector storage)
  - @huggingface/transformers (for tokenization)
  - chokidar (for file watching)
  - ignore (for gitignore parsing)
  - ai (for AI SDK features)

  This fixes the error: "Cannot find module 'react/jsx-dev-runtime'" when running sylphx-flow -v after global installation.

## 1.1.0

### Minor Changes

- 7fdb9f2: Simplify provider selection - always ask, never save defaults

  **Breaking Change**: Removed smart defaults for provider/agent selection

  **Before:**

  - Initial setup saved default provider
  - Runtime choices were automatically saved
  - Smart defaults applied on next run
  - Complex conditional logic with useDefaults flags

  **After:**

  - Initial setup only configures API keys
  - Always prompts for provider/agent each run
  - No automatic saving of runtime choices
  - Simple: want to skip prompts? Use `--provider` / `--agent` args

  **Migration:**
  Users who relied on saved defaults should now:

  - Use `--provider default --agent coder` in scripts
  - Or accept the prompt on each run

  **Example:**

  ```bash
  # Always prompts (new default behavior)
  sylphx-flow "your prompt"

  # Skip prompts with args
  sylphx-flow --provider default --agent coder "your prompt"
  ```

  This change reduces code complexity by 155 lines and makes behavior more predictable.

## 1.0.6

### Patch Changes

- 841929e: Include assets directory with agents, rules, and templates in npm package

## 1.0.5

### Patch Changes

- Fix Claude Code component detection - rules and output styles are included in agent files

## 1.0.4

### Patch Changes

- Fix false "missing components" warning by checking if directories contain files

## 1.0.3

### Patch Changes

- Publish source code instead of bundled dist to fix Unicode and native binding issues

## 1.0.2

### Patch Changes

- Fix missing dist directory in npm package by adding prepublishOnly script

## 1.0.0

### Major Changes

- 2ee21db: 🎉 **Sylphx Flow v1.0.0 - Production Release**

  Major release with autonomous loop mode, auto-initialization, and production-ready features.

  ## 🚀 Major Features

  ### Loop Mode - Autonomous Continuous Execution

  - **Revolutionary autonomous AI** that keeps working until you stop it
  - Zero wait time by default (task execution time is natural interval)
  - Optional wait time for polling scenarios: `--loop [seconds]`
  - Max runs limit: `--max-runs <count>`
  - Smart configuration: Saves provider/agent preferences automatically
  - **Platform Support**: Claude Code (full support), OpenCode (coming soon)

  ```bash
  # Continuous autonomous work
  sylphx-flow "process all github issues" --loop --target claude-code

  # With wait time and limits
  sylphx-flow "check for updates" --loop 300 --max-runs 20
  ```

  ### Auto-Initialization

  - **Zero configuration required** - setup happens automatically on first use
  - Smart platform detection (Claude Code, OpenCode)
  - Intelligent defaults that learn from your choices
  - Manual setup still available: `sylphx-flow --init-only`

  ### Template Synchronization

  - New `--sync` flag to synchronize with latest Flow templates
  - Updates agents, rules, output styles, and slash commands
  - Safe sync: Won't overwrite user customizations
  - Platform-specific sync: `--sync --target opencode`

  ### File Input Support

  - Load prompts from files: `sylphx-flow "@task.txt"`
  - No shell escaping issues
  - Perfect for complex, reusable instructions
  - Works with loop mode: `sylphx-flow "@prompt.md" --loop`

  ## ✨ Enhancements

  ### CLI Improvements

  - Simplified command structure - direct execution without subcommands
  - Better error messages and validation
  - Improved verbose output for debugging
  - Command printing in headless/loop mode

  ### Platform Support

  - **Claude Code**: Full support with headless execution
  - **OpenCode**: Full support (loop mode coming soon due to TTY requirements)
  - Auto-detection of target platform
  - Manual override: `--target claude-code` or `--target opencode`

  ### Branding & Documentation

  - Modern flow infinity symbol icon system
  - Comprehensive documentation with VitePress
  - Clear platform support matrix
  - Updated examples and guides

  ## 🐛 Bug Fixes

  - Fix targetId undefined in loop mode initialization
  - Remove problematic flags from OpenCode headless mode
  - Resolve init command never executing - agents now install properly
  - Fix ConfigDirectoryTypoError by cleaning up old 'commands' directory

  ## 📦 Package Configuration

  - Configured for npm publishing
  - Proper entry points and exports
  - Type definitions included
  - MIT license

  ## 🔄 Breaking Changes

  - Loop mode default interval changed from 60s to 0s (no wait time)
  - Command structure simplified (subcommands still work but not required)
  - Init/run commands consolidated into flow command

  ## 📚 Documentation

  - Complete rewrite emphasizing auto-initialization
  - Loop mode clearly marked as Claude Code only
  - New --sync flag documentation
  - Simplified getting started guide
  - Updated CLI commands reference

  ## 🙏 Migration Guide

  ### From pre-1.0 versions:

  ```bash
  # Old way
  sylphx-flow init
  sylphx-flow run "task"
  sylphx-flow run "task" --loop

  # New way (auto-initializes)
  sylphx-flow "task"
  sylphx-flow "task" --loop --target claude-code
  ```

  ### Loop mode interval:

  ```bash
  # Old default: 60s wait time
  sylphx-flow "task" --loop

  # New default: 0s wait time (immediate)
  sylphx-flow "task" --loop

  # If you want wait time, specify explicitly:
  sylphx-flow "task" --loop 60
  ```

  ## 🔗 Links

  - [Documentation](https://flow.sylphx.ai)
  - [GitHub Repository](https://github.com/sylphxltd/flow)
  - [Getting Started Guide](https://flow.sylphx.ai/guide/getting-started)

## 1.0.0

### Major Changes

- # 1.0.0 - Major Release

  Sylphx Flow 1.0.0 is a complete reimagination of AI-powered development workflow automation. This release represents months of refinement, optimization, and user feedback integration.

  ## 🚀 Major Features

  ### Loop Mode - Autonomous Continuous Execution

  Revolutionary loop mode that enables truly autonomous AI agents:

  - **Continuous execution** with automatic context preservation
  - **Zero wait time default** - task execution is the natural interval
  - **Smart continue mode** - auto-enables from 2nd iteration
  - **Graceful shutdown** - Ctrl+C handling with summaries
  - **Configurable wait times** for rate limiting or polling scenarios

  ```bash
  # Continuous autonomous work
  sylphx-flow "process all github issues" --loop

  # With wait time for polling
  sylphx-flow "check for new commits" --loop 300 --max-runs 20
  ```

  ### File Input Support

  Load prompts from files for complex, reusable instructions:

  - **@file syntax** - `@prompt.txt` or `@/path/to/prompt.txt`
  - **No shell escaping issues** - write natural language prompts
  - **Version control friendly** - commit prompts alongside code
  - **Works seamlessly with loop mode**

  ```bash
  # Use file input
  sylphx-flow "@task.txt" --loop --max-runs 10
  ```

  ### Smart Configuration System

  Intelligent defaults that learn from your choices:

  - **Auto-saves preferences** - provider, agent, target selections
  - **Smart defaults** - uses saved preferences automatically
  - **Selective override** - `--select-provider` / `--select-agent` flags
  - **Inline API key setup** - configure keys when selecting providers
  - **No repeated prompts** - set once, use forever

  ### OpenCode Integration

  Full support for OpenCode (Claude Code alternative):

  - **Auto-detection** of OpenCode installation
  - **Target-aware component checking**
  - **JSONC config parsing** for OpenCode's commented configs
  - **Directory structure adaptation** (singular vs plural naming)
  - **Automatic migration** from old directory structures

  ## 🔧 Major Improvements

  ### Flow Orchestrator Architecture

  Complete refactor for separation of concerns:

  - **Modular design** - clean separation of init/setup/launch phases
  - **State-driven decisions** - smart detection of project state
  - **Positive logic patterns** - explicit conditions instead of negative flags
  - **Component integrity** - automatic detection and repair of missing components

  ### Performance Optimizations

  - **Loop mode optimization** - setup once, execute repeatedly (no redundant checks)
  - **Parallel execution** - concurrent independent operations
  - **Smart caching** - reuse configuration across runs
  - **Reduced overhead** - streamlined initialization flow

  ### Developer Experience

  - **Better error messages** - actionable feedback with suggestions
  - **Progress indicators** - clear feedback during long operations
  - **Dry-run mode** - preview commands before execution
  - **Verbose mode** - detailed output for debugging
  - **Headless mode** - `-p` for non-interactive execution

  ## 🐛 Bug Fixes

  ### Critical Fixes

  - **Init command execution** - fixed Commander.js action() misuse that prevented initialization
  - **State detection timing** - only check components after target is known
  - **MCP detection** - proper JSONC parsing for OpenCode configs
  - **Directory naming** - fixed OpenCode command/commands mismatch
  - **Continue flag logic** - proper handling of conversation context

  ### OpenCode Specific

  - **YAML field compatibility** - removed unsupported fields (name, mode, rules)
  - **Automatic cleanup** - removes legacy directories to prevent crashes
  - **Config validation** - proper error handling for invalid configurations

  ### Memory & Settings

  - **Persistent settings** - fixed "re-prompt every run" issue
  - **Target-specific configs** - separate settings per platform
  - **Environment variables** - proper inheritance to spawned processes

  ## 📚 Documentation

  ### Comprehensive Guides

  - **LOOP_MODE.md** - Complete loop mode documentation (English)
  - **Updated help text** - clearer, more descriptive option descriptions
  - **Inline examples** - usage examples in help output
  - **Consistent terminology** - "wait time" instead of mixed "interval/cooldown"

  ### API Reference

  - Clear parameter descriptions
  - Recommended values for all options
  - When to use each feature
  - Troubleshooting guides

  ## ⚠️ Breaking Changes

  ### Configuration File Rename

  - Old: `.sylphx-flow/config.json`
  - New: `.sylphx-flow/settings.json`
  - Migration: Automatic on first run

  ### Default Behavior Changes

  - **Loop interval default**: 60s → 0s (immediate execution)
  - **Init logic**: Negative logic → Positive logic (explicit conditions)
  - **Provider selection**: Opt-in defaults → Smart defaults (auto-use saved)

  ### Removed Features

  - **Deprecated commands**: Old separate init/run commands (use integrated `flow` command)
  - **Complex loop strategies**: Removed over-engineered exit conditions (until-success, until-stable)

  ## 🔄 Migration Guide

  ### From 0.x to 1.0

  1. **Update package**:

  ```bash
  bun update @sylphx/flow
  ```

  2. **Config auto-migrates** on first run - no manual steps needed

  3. **Loop mode users**: If you were using `--loop 60`, consider removing the number for faster continuous execution:

  ```bash
  # Before (0.x)
  sylphx-flow "task" --loop 60

  # After (1.0 - faster)
  sylphx-flow "task" --loop

  # Or keep wait time if needed
  sylphx-flow "task" --loop 60
  ```

  4. **Provider/Agent selection**: No longer need `--use-defaults` - it's automatic now

  ## 🙏 Acknowledgments

  This release incorporates extensive user feedback and addresses real-world usage patterns. Thank you to all contributors and early adopters who helped shape this release.

  ## 📊 Stats

  - **50+ commits** since 0.3.0
  - **15+ major features** added
  - **20+ bug fixes**
  - **Full OpenCode support**
  - **10x faster loop execution** (setup overhead removed)
