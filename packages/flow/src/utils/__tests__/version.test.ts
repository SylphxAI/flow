import { describe, expect, it } from 'vitest';
import { compareVersions, isVersionOutdated, parseVersion } from '../version';

describe('version utilities', () => {
  describe('compareVersions', () => {
    it('returns 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('10.20.30', '10.20.30')).toBe(0);
    });

    it('returns a negative number when the first version is lower', () => {
      expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(compareVersions('1.9.9', '2.0.0')).toBeLessThan(0);
    });

    it('returns a positive number when the first version is higher', () => {
      expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
      expect(compareVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
    });

    it('compares numerically, not lexically', () => {
      // '1.10.0' must rank above '1.9.0' even though '10' sorts before '9' as text.
      expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0);
      expect(compareVersions('1.9.0', '1.10.0')).toBeLessThan(0);
    });

    it('treats a longer version with otherwise-equal parts as greater', () => {
      expect(compareVersions('1.2.0', '1.2')).toBeGreaterThan(0);
      expect(compareVersions('1.2', '1.2.0')).toBeLessThan(0);
    });

    it('compares only the shared leading segments before falling back to length', () => {
      // First differing shared segment wins regardless of trailing segments.
      expect(compareVersions('1.3', '1.2.9')).toBeGreaterThan(0);
      expect(compareVersions('1.2.9', '1.3')).toBeLessThan(0);
    });

    it('yields NaN when a segment is not numeric (documents current behavior)', () => {
      // Non-numeric segments parse to NaN; the subtraction at the first differing
      // index therefore returns NaN rather than throwing.
      expect(Number.isNaN(compareVersions('1.0.0', '1.0.x'))).toBe(true);
      expect(Number.isNaN(compareVersions('v1.0.0', '1.0.0'))).toBe(true);
    });
  });

  describe('isVersionOutdated', () => {
    it('reports true only when current is strictly lower than latest', () => {
      expect(isVersionOutdated('1.0.0', '1.0.1')).toBe(true);
      expect(isVersionOutdated('1.9.0', '1.10.0')).toBe(true);
    });

    it('reports false when current is equal to or higher than latest', () => {
      expect(isVersionOutdated('1.0.0', '1.0.0')).toBe(false);
      expect(isVersionOutdated('1.0.1', '1.0.0')).toBe(false);
      expect(isVersionOutdated('2.0.0', '1.9.9')).toBe(false);
    });

    it('fails safe (false) when versions are not comparable', () => {
      // A NaN comparison is not < 0, so unparseable input is treated as up to date
      // rather than triggering a spurious upgrade prompt.
      expect(isVersionOutdated('1.0.x', '1.0.1')).toBe(false);
      expect(isVersionOutdated('1.0.0', '1.0.x')).toBe(false);
    });
  });

  describe('parseVersion', () => {
    it('parses a standard three-part version into components', () => {
      expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
      expect(parseVersion('10.20.30')).toEqual({ major: 10, minor: 20, patch: 30 });
    });

    it('uses only the first three segments when extra segments are present', () => {
      expect(parseVersion('1.2.3.4')).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('returns null when there are fewer than three segments', () => {
      expect(parseVersion('1.2')).toBeNull();
      expect(parseVersion('1')).toBeNull();
      expect(parseVersion('')).toBeNull();
    });

    it('returns null when any segment is not numeric', () => {
      expect(parseVersion('1.2.x')).toBeNull();
      expect(parseVersion('v1.2.3')).toBeNull();
      expect(parseVersion('1.2.beta')).toBeNull();
    });
  });
});
