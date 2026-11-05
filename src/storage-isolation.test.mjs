import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadProgress, saveProgress } from './storage.js';
import { createRecord, loadFromStorage, saveToStorage } from '../flora/js/model.js';

test('Flora and tracker persist independently on the same origin', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value))
  };
  const oldStorage = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    const progress = {
      language: 'es', currentMapId: 'map-a',
      addedMaps: { 'map-a': { addedAt: 123 } },
      metaStatus: { '42': { status: 'mastered', updatedAt: 456 } }
    };
    saveProgress(progress, storage);
    const trackerBeforeFlora = values.get('geometa-tracker:progress');
    const record = createRecord('flora', { id: 'oak', name: 'Roble' });
    assert.equal(saveToStorage([record]), true);
    assert.equal(values.get('geometa-tracker:progress'), trackerBeforeFlora);
    assert.deepEqual(loadProgress(storage), progress);

    const floraBeforeTracker = values.get('floraMapRecords');
    saveProgress({ ...progress, language: 'en' }, storage);
    assert.equal(values.get('floraMapRecords'), floraBeforeTracker);
    assert.deepEqual(loadFromStorage().records, [record]);
  } finally {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  }
});
