/**
 * Module-level cache — lives as long as the browser tab is open.
 * Pages load from cache instantly, then silently re-fetch in the background.
 */
const _store = new Map();

export const pageCache = {
  get: (key) => _store.get(key) ?? null,
  set: (key, value) => _store.set(key, value),
  has: (key) => _store.has(key),
  clear: (key) => key ? _store.delete(key) : _store.clear(),
};
