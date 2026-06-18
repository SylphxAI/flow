import { describe, expect, it } from 'vitest';
import { deleteNestedProperty, getNestedProperty, setNestedProperty } from '../object-utils';

describe('object utilities', () => {
  describe('getNestedProperty', () => {
    it('reads a deeply nested value via dot notation', () => {
      expect(getNestedProperty({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1);
    });

    it('reads a top-level value', () => {
      expect(getNestedProperty({ x: 42 }, 'x')).toBe(42);
    });

    it('returns undefined when an intermediate key is missing', () => {
      expect(getNestedProperty({ a: 1 }, 'a.b.c')).toBeUndefined();
    });

    it('returns undefined when traversing through null', () => {
      // Optional chaining short-circuits on null/undefined rather than throwing.
      expect(getNestedProperty({ a: null }, 'a.b')).toBeUndefined();
    });

    it('returns undefined for a missing top-level key', () => {
      expect(getNestedProperty({ a: 1 }, 'nope')).toBeUndefined();
    });

    it('splits on dots, so a literal dotted key is not addressable', () => {
      // 'a.b' is split into ['a', 'b'], never matching the literal key "a.b".
      expect(getNestedProperty({ 'a.b': 9 } as Record<string, unknown>, 'a.b')).toBeUndefined();
    });

    it('treats an empty path as the empty-string key', () => {
      // ''.split('.') === [''], so the lookup targets the '' key.
      expect(getNestedProperty({ '': 5 }, '')).toBe(5);
    });
  });

  describe('setNestedProperty', () => {
    it('creates intermediate objects for a missing path', () => {
      const obj: Record<string, unknown> = {};
      setNestedProperty(obj, 'a.b.c', 1);
      expect(obj).toEqual({ a: { b: { c: 1 } } });
    });

    it('overwrites an existing leaf value', () => {
      const obj: Record<string, unknown> = { a: { b: { c: 1 } } };
      setNestedProperty(obj, 'a.b.c', 2);
      expect(obj).toEqual({ a: { b: { c: 2 } } });
    });

    it('replaces a non-object intermediate with a fresh object', () => {
      // 'a.b' is the number 1; it is clobbered to {} so the path can continue.
      const obj: Record<string, unknown> = { a: { b: 1 } };
      setNestedProperty(obj, 'a.b.c', 9);
      expect(obj).toEqual({ a: { b: { c: 9 } } });
    });

    it('sets a top-level key', () => {
      const obj: Record<string, unknown> = {};
      setNestedProperty(obj, 'top', 7);
      expect(obj).toEqual({ top: 7 });
    });

    it('is a no-op when the path is empty', () => {
      // ''.split('.').pop() === '', which is falsy, so the function returns early.
      const obj: Record<string, unknown> = { x: 1 };
      setNestedProperty(obj, '', 5);
      expect(obj).toEqual({ x: 1 });
    });
  });

  describe('deleteNestedProperty', () => {
    it('removes a deeply nested key, leaving siblings intact', () => {
      const obj: Record<string, unknown> = { a: { b: { c: 1, d: 2 } } };
      deleteNestedProperty(obj, 'a.b.c');
      expect(obj).toEqual({ a: { b: { d: 2 } } });
    });

    it('removes a top-level key', () => {
      const obj: Record<string, unknown> = { x: 1 };
      deleteNestedProperty(obj, 'x');
      expect(obj).toEqual({});
    });

    it('is a no-op when the path is empty', () => {
      // Empty lastKey is falsy, so the function returns before touching the object.
      const obj: Record<string, unknown> = { a: { b: 1 } };
      deleteNestedProperty(obj, '');
      expect(obj).toEqual({ a: { b: 1 } });
    });

    it('materializes missing intermediates while walking to a non-existent leaf', () => {
      // Documents current behavior: deleting a path through an empty object still
      // creates the intermediate objects along the way.
      const obj: Record<string, unknown> = {};
      deleteNestedProperty(obj, 'a.b');
      expect(obj).toEqual({ a: {} });
    });

    it('clobbers a non-object intermediate when deleting through it', () => {
      // Documents current behavior: 'a' is the number 1, but walking 'a.b.c'
      // overwrites it with {} (then deletes the missing leaf 'c').
      const obj: Record<string, unknown> = { a: 1 };
      deleteNestedProperty(obj, 'a.b.c');
      expect(obj).toEqual({ a: { b: {} } });
    });
  });
});
