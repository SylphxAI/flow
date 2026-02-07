import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CLAUDE_CODE_ENV,
  generateHookCommands,
  processSettings,
} from '../../../packages/flow/src/targets/functional/claude-code-logic';

describe('claude-code-logic', () => {
  describe('DEFAULT_CLAUDE_CODE_ENV', () => {
    it('should include max output tokens', () => {
      expect(DEFAULT_CLAUDE_CODE_ENV.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe('128000');
    });

    it('should enable agent teams', () => {
      expect(DEFAULT_CLAUDE_CODE_ENV.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBe('1');
    });
  });

  describe('generateHookCommands', () => {
    it('should generate notification command for target', async () => {
      const config = await generateHookCommands('claude-code');
      expect(config.notificationCommand).toContain('hook --type notification');
      expect(config.notificationCommand).toContain('--target claude-code');
    });
  });

  describe('processSettings', () => {
    it('should create new settings when content is null', () => {
      const result = processSettings(null);

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.hooks.Notification).toBeDefined();
        expect(parsed.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe('128000');
        expect(parsed.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBe('1');
        expect(parsed.alwaysThinkingEnabled).toBe(true);
      }
    });

    it('should create new settings when content is empty', () => {
      const result = processSettings('');

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.hooks.Notification).toBeDefined();
      }
    });

    it('should merge with existing valid settings', () => {
      const existing = JSON.stringify({ test: 'value', hooks: {} });
      const result = processSettings(existing);

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.test).toBe('value');
        expect(parsed.hooks.Notification).toBeDefined();
        expect(parsed.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe('128000');
      }
    });

    it('should preserve existing env vars while adding defaults', () => {
      const existing = JSON.stringify({
        env: { CUSTOM_VAR: 'custom' },
      });
      const result = processSettings(existing);

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.env.CUSTOM_VAR).toBe('custom');
        expect(parsed.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe('128000');
      }
    });

    it('should create new settings when existing is invalid JSON', () => {
      const result = processSettings('{invalid}');

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.hooks.Notification).toBeDefined();
      }
    });

    it('should use custom hook config', () => {
      const result = processSettings(null, {
        notificationCommand: 'custom-notification',
      });

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.hooks.Notification[0].hooks[0].command).toBe('custom-notification');
      }
    });

    it('should override existing Notification hook', () => {
      const existing = JSON.stringify({
        hooks: {
          Notification: [{ hooks: [{ type: 'command', command: 'old' }] }],
          ExistingHook: [{ hooks: [{ type: 'command', command: 'keep' }] }],
        },
      });
      const result = processSettings(existing);

      expect(result._tag).toBe('Success');
      if (result._tag === 'Success') {
        const parsed = JSON.parse(result.value);
        expect(parsed.hooks.Notification[0].hooks[0].command).toContain('hook --type notification');
        expect(parsed.hooks.ExistingHook).toBeDefined();
      }
    });
  });
});
