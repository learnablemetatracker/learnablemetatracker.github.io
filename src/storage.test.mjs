// web/src/storage.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadProgress,
  saveProgress,
  addMap,
  removeMap,
  setMetaStatus,
  getMetaStatus,
  clearMetaStatus,
  exportProgressJson,
  importProgressJson
} from './storage.js';

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

test('loadProgress returns sane defaults when nothing is stored', () => {
  const progress = loadProgress(fakeStorage());
  assert.equal(progress.language, null);
  assert.equal(progress.currentMapId, null);
  assert.deepEqual(progress.addedMaps, {});
  assert.deepEqual(progress.metaStatus, {});
});

test('loadProgress returns defaults (not a throw) when stored JSON is corrupt', () => {
  const storage = fakeStorage();
  storage.setItem('geometa-tracker:progress', '{not valid json');
  const progress = loadProgress(storage);
  assert.deepEqual(progress.metaStatus, {});
});

test('saveProgress then loadProgress round-trips', () => {
  const storage = fakeStorage();
  const original = { language: 'es', currentMapId: 'map-a', addedMaps: {}, metaStatus: {} };
  saveProgress(original, storage);
  assert.deepEqual(loadProgress(storage), original);
});

test('addMap adds a map with a timestamp and is idempotent', () => {
  const before = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  const after = addMap(before, 'map-a');
  assert.ok(after.addedMaps['map-a'].addedAt > 0);

  const again = addMap(after, 'map-a');
  assert.equal(again.addedMaps['map-a'].addedAt, after.addedMaps['map-a'].addedAt);
});

test('removeMap drops the map but leaves per-meta status untouched', () => {
  let progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  progress = addMap(progress, 'map-a');
  progress = setMetaStatus(progress, '159', 'mastered');

  const after = removeMap(progress, 'map-a');
  assert.ok(!('map-a' in after.addedMaps));
  assert.equal(after.metaStatus['159'].status, 'mastered');
});

test('removeMap clears currentMapId when removing the current map, leaves it alone otherwise', () => {
  let progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  progress = addMap(progress, 'map-a');
  progress = addMap(progress, 'map-b');
  progress.currentMapId = 'map-a';

  const removedCurrent = removeMap(progress, 'map-a');
  assert.equal(removedCurrent.currentMapId, null);

  const removedOther = removeMap(progress, 'map-b');
  assert.equal(removedOther.currentMapId, 'map-a');
});

test('removeMap on a map that was never added is a safe no-op', () => {
  const before = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  const after = removeMap(before, 'map-a');
  assert.deepEqual(after, before);
});

test('setMetaStatus records status and updatedAt, rejecting invalid statuses', () => {
  const before = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  const after = setMetaStatus(before, '159', 'mastered');
  assert.equal(after.metaStatus['159'].status, 'mastered');
  assert.ok(after.metaStatus['159'].updatedAt > 0);

  assert.throws(() => setMetaStatus(before, '159', 'bogus'), /Invalid status/);
});

test('getMetaStatus defaults to "new" for an untouched meta', () => {
  const progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  assert.equal(getMetaStatus(progress, '159'), 'new');
});

test('export then import round-trips progress', () => {
  const original = {
    language: 'en',
    currentMapId: 'map-a',
    addedMaps: { 'map-a': { addedAt: 1000 } },
    metaStatus: { '159': { status: 'mastered', updatedAt: 2000 } }
  };
  const imported = importProgressJson(exportProgressJson(original));
  assert.deepEqual(imported, original);
});

test('importProgressJson rejects a file missing required fields', () => {
  assert.throws(() => importProgressJson('{"language":"en"}'), /missing metaStatus/);
  assert.throws(() => importProgressJson('not json'), SyntaxError);
});

test('loadProgress returns defaults (not a throw) when storage.getItem throws', () => {
  const storage = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {},
    removeItem: () => {}
  };
  const progress = loadProgress(storage);
  assert.deepEqual(progress, {
    language: null,
    currentMapId: null,
    addedMaps: {},
    metaStatus: {}
  });
});

test('saveProgress does not throw when storage.setItem throws, and reports failure', () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {}
  };
  const progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  assert.doesNotThrow(() => {
    const result = saveProgress(progress, storage);
    assert.equal(result, false);
  });
});

test('saveProgress returns true on success', () => {
  const storage = fakeStorage();
  const progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  assert.equal(saveProgress(progress, storage), true);
});

test('clearMetaStatus removes an existing entry, resetting it to "new"', () => {
  const before = setMetaStatus(
    { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} },
    '159',
    'mastered'
  );
  const after = clearMetaStatus(before, '159');
  assert.equal(getMetaStatus(after, '159'), 'new');
  assert.ok(!('159' in after.metaStatus));
});

test('clearMetaStatus on a metaId with no existing entry is a safe no-op', () => {
  const before = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  const after = clearMetaStatus(before, '159');
  assert.deepEqual(after, before);
});

test('loadProgress with storage: null returns defaultProgress without throwing', () => {
  const progress = loadProgress(null);
  assert.deepEqual(progress, {
    language: null,
    currentMapId: null,
    addedMaps: {},
    metaStatus: {}
  });
});

test('saveProgress with storage: null returns false without throwing', () => {
  const progress = { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
  assert.doesNotThrow(() => {
    const result = saveProgress(progress, null);
    assert.equal(result, false);
  });
});
