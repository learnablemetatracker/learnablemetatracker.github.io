import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRecord,
  validateRecord,
  exportData,
  importData,
  exportRecord,
  importRecord,
  saveToStorage,
  loadFromStorage,
} from '../js/model.js';

beforeEach(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
});

describe('createRecord', () => {
  it('creates a flora record with scientificName', () => {
    const r = createRecord('flora', { name: 'Roble', scientificName: 'Quercus robur' });
    assert.equal(r.type, 'flora');
    assert.equal(r.name, 'Roble');
    assert.equal(r.scientificName, 'Quercus robur');
    assert.ok(r.id);
    assert.deepEqual(r.polygons, []);
  });

  it('creates a meta record without scientificName', () => {
    const r = createRecord('meta', { name: 'España peninsula' });
    assert.equal(r.type, 'meta');
    assert.equal(r.name, 'España peninsula');
    assert.equal('scientificName' in r, false);
  });

  it('rejects unknown type', () => {
    assert.throws(() => createRecord('other'), /type/);
  });
});

describe('validateRecord', () => {
  it('validates a complete flora record', () => {
    const r = createRecord('flora', { name: 'Roble', scientificName: 'Quercus robur' });
    assert.equal(validateRecord(r), true);
  });

  it('requires name', () => {
    const r = createRecord('flora', { name: '' });
    assert.equal(validateRecord(r), false);
  });

  it('requires polygons to have at least 3 points', () => {
    const r = createRecord('meta', { name: 'X' });
    r.polygons = [[[0, 0], [1, 1]]];
    assert.equal(validateRecord(r), false);
  });

  it('allows empty polygons array', () => {
    const r = createRecord('meta', { name: 'X' });
    assert.equal(validateRecord(r), true);
  });

  it('rejects scientificName on meta', () => {
    const r = createRecord('meta', { name: 'X' });
    r.scientificName = 'Bad';
    assert.equal(validateRecord(r), false);
  });

  it('rejects unsafe colors and malformed display fields', () => {
    const r = createRecord('meta', { name: 'X' });
    r.color = 'red\"><img src=x onerror=alert(1)>';
    assert.equal(validateRecord(r), false);

    const malformed = createRecord('meta', { name: 'X' });
    malformed.description = null;
    assert.equal(validateRecord(malformed), false);
  });

  it('rejects invalid visual settings', () => {
    const r = createRecord('flora', { name: 'X', scientificName: 'Plantus x' });
    r.fillOpacity = 1.1;
    assert.equal(validateRecord(r), false);

    r.fillOpacity = 0.25;
    r.strokeWidth = Infinity;
    assert.equal(validateRecord(r), false);

    r.strokeWidth = 2;
    r.strokeLinejoin = 'url(javascript:alert(1))';
    assert.equal(validateRecord(r), false);

    r.strokeLinejoin = 'round';
    r.labelMode = 'unknown';
    assert.equal(validateRecord(r), false);

    r.labelMode = 'hidden';
    r.visible = 'yes';
    assert.equal(validateRecord(r), false);

    r.visible = true;
    r.description = null;
    assert.equal(validateRecord(r), false);
  });

  it('rejects non-finite and out-of-range geographic coordinates', () => {
    const r = createRecord('meta', { name: 'X' });
    r.polygons = [[[0, 0], [Infinity, 1], [2, 2]]];
    assert.equal(validateRecord(r), false);

    r.polygons = [[[0, 0], [181, 1], [2, 2]]];
    assert.equal(validateRecord(r), false);
  });
});

describe('exportData / importData', () => {
  it('round-trips records', () => {
    const flora = createRecord('flora', { name: 'Roble', scientificName: 'Quercus robur', color: '#338833' });
    const meta = createRecord('meta', { name: 'Península', description: 'Meta fácil' });
    const json = exportData([flora, meta]);
    const imported = importData(json);
    assert.equal(imported.length, 2);
    assert.equal(imported[0].type, 'flora');
    assert.equal(imported[0].scientificName, 'Quercus robur');
    assert.equal(imported[1].type, 'meta');
    assert.equal('scientificName' in imported[1], false);
  });

  it('does not overwrite existing records on invalid JSON', () => {
    const existing = [createRecord('flora', { name: 'Pino' })];
    const result = importData('not json', existing);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Pino');
  });

  it('does not overwrite existing records on invalid shape', () => {
    const existing = [createRecord('flora', { name: 'Pino' })];
    const result = importData(JSON.stringify([{ type: 'flora', name: 123 }]), existing);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Pino');
  });

  it('does not partially import a file containing an invalid record', () => {
    const existing = [createRecord('flora', { name: 'Pino' })];
    const invalidMeta = { ...createRecord('meta', { name: 'Incorrecta' }), scientificName: 'No permitido' };
    const incoming = JSON.stringify([createRecord('meta', { name: 'Nueva' }), invalidMeta]);
    assert.equal(importData(incoming, existing), existing);
  });

  it('replaces records on valid JSON', () => {
    const existing = [createRecord('flora', { name: 'Pino' })];
    const incoming = JSON.stringify([createRecord('meta', { name: 'Nueva' })]);
    const result = importData(incoming, existing);
    assert.equal(result.length, 1);
    assert.equal(result[0].type, 'meta');
    assert.equal(result[0].name, 'Nueva');
  });
});

describe('single-record transfer', () => {
  it('exports and imports one flora record without replacing other records', () => {
    const flora = createRecord('flora', { id: 'oak', name: 'Roble', scientificName: 'Quercus robur' });
    const other = createRecord('meta', { id: 'road', name: 'Carretera' });
    const result = importRecord(exportRecord(flora), [other]);
    assert.deepEqual(result.records, [other, flora]);
    assert.equal(result.replaced, false);
  });

  it('updates only the matching record ID and accepts a one-item full export', () => {
    const old = createRecord('meta', { id: 'road', name: 'Antiguo' });
    const other = createRecord('flora', { id: 'oak', name: 'Roble' });
    const updated = createRecord('meta', { id: 'road', name: 'Nuevo' });
    const result = importRecord(exportData([updated]), [old, other]);
    assert.deepEqual(result.records, [updated, other]);
    assert.equal(result.replaced, true);
  });

  it('rejects invalid or multi-record input without changing existing records', () => {
    const existing = [createRecord('meta', { id: 'road', name: 'Carretera' })];
    assert.equal(importRecord('not json', existing), null);
    assert.equal(importRecord(exportData([existing[0], existing[0]]), existing), null);
    assert.equal(importRecord('{"type":"flora"}', existing), null);
    assert.equal(existing.length, 1);
  });
});

describe('localStorage persistence', () => {
  it('saves and loads records', () => {
    const r = createRecord('flora', { name: 'Encina', scientificName: 'Quercus ilex' });
    assert.equal(saveToStorage([r]), true);
    const loaded = loadFromStorage();
    assert.equal(loaded.status, 'loaded');
    assert.equal(loaded.records.length, 1);
    assert.equal(loaded.records[0].name, 'Encina');
    assert.equal(loaded.records[0].scientificName, 'Quercus ilex');
  });

  it('distinguishes no saved data from a saved empty list', () => {
    assert.deepEqual(loadFromStorage(), { status: 'missing', records: [] });
    assert.equal(saveToStorage([]), true);
    assert.deepEqual(loadFromStorage(), { status: 'loaded', records: [] });
  });

  it('does not throw when storage reads or writes fail', () => {
    globalThis.localStorage = {
      getItem() { throw new Error('SecurityError'); },
      setItem() { throw new Error('QuotaExceededError'); },
    };
    assert.deepEqual(loadFromStorage(), { status: 'unavailable', records: [] });
    assert.equal(saveToStorage([]), false);
  });

  it('does not load malformed stored records into the app', () => {
    localStorage.setItem('floraMapRecords', JSON.stringify([{ type: 'meta', name: null }]));
    assert.deepEqual(loadFromStorage(), { status: 'invalid', records: [] });
  });
});
