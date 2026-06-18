import { describe, expect, it } from 'vitest';
import { formatBytes, formatFileSize } from '../bytes';

describe('byte formatting', () => {
  describe('formatBytes', () => {
    it('formats zero with the long unit label by default', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats zero with the short unit label when shortUnits is set', () => {
      expect(formatBytes(0, { shortUnits: true })).toBe('0 B');
    });

    it('keeps sub-kilobyte values in the base unit', () => {
      expect(formatBytes(1)).toBe('1 Bytes');
      expect(formatBytes(512)).toBe('512 Bytes');
      expect(formatBytes(1023)).toBe('1023 Bytes');
    });

    it('promotes to the next unit at each 1024 boundary', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 ** 2)).toBe('1 MB');
      expect(formatBytes(1024 ** 3)).toBe('1 GB');
      expect(formatBytes(1024 ** 4)).toBe('1 TB');
    });

    it('trims trailing zeros and a dangling decimal point', () => {
      // 1.50 -> 1.5, and a whole number drops the decimal portion entirely.
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('honors a custom decimals count and rounds before trimming', () => {
      expect(formatBytes(1536, { decimals: 1 })).toBe('1.5 KB');
      // toFixed rounds half-up, so 1.5 KB renders as "2 KB" at zero decimals.
      expect(formatBytes(1536, { decimals: 0 })).toBe('2 KB');
      // A small fraction at high precision keeps every requested place.
      expect(formatBytes(1126, { decimals: 4 })).toBe('1.0996 KB');
    });

    it('does not trim when decimals is zero (rendered value is already integral)', () => {
      expect(formatBytes(100, { decimals: 0 })).toBe('100 Bytes');
      expect(formatBytes(2048, { decimals: 0 })).toBe('2 KB');
    });

    it('uses short unit labels for non-zero values when requested', () => {
      expect(formatBytes(1024, { shortUnits: true })).toBe('1 KB');
      expect(formatBytes(512, { shortUnits: true })).toBe('512 B');
    });

    it('clamps at the largest known unit (TB) for petabyte-scale inputs', () => {
      // There is no PB unit, so values above 1 TB stay expressed in TB.
      expect(formatBytes(5 * 1024 ** 5)).toBe('5120 TB');
    });

    it('propagates NaN for non-positive inputs (documents current behavior)', () => {
      // Math.log of a non-positive number is NaN, so the unit index is NaN and
      // units[NaN] is undefined; the function returns the literal "NaN undefined".
      expect(formatBytes(-1024)).toBe('NaN undefined');
      expect(formatBytes(Number.NaN)).toBe('NaN undefined');
    });
  });

  describe('formatFileSize', () => {
    it('delegates to formatBytes with one decimal and short units', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('trims the trailing zero so whole megabytes drop the decimal', () => {
      // The docstring example shows "1.0 MB", but trailing-zero trimming yields "1 MB".
      expect(formatFileSize(1024 ** 2)).toBe('1 MB');
    });

    it('formats zero with the short base unit', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });
});
