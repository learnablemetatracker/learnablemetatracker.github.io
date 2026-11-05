// Data model, validation, import/export, and localStorage persistence for Flora/Meta records.

const STORAGE_KEY = 'floraMapRecords';

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createRecord(type, overrides = {}) {
  if (type !== 'flora' && type !== 'meta') {
    throw new Error(`Invalid record type: ${type}`);
  }
  const record = {
    id: overrides.id ?? uid(),
    type,
    name: overrides.name ?? '',
    description: overrides.description ?? '',
    color: overrides.color ?? '#338833',
    fillOpacity: overrides.fillOpacity ?? 0.25,
    strokeWidth: overrides.strokeWidth ?? 2,
    strokeLinejoin: overrides.strokeLinejoin ?? 'round',
    labelMode: overrides.labelMode ?? 'hidden',
    visible: overrides.visible ?? true,
    polygons: overrides.polygons ?? [],
  };
  if (type === 'flora') {
    record.scientificName = overrides.scientificName ?? '';
  }
  return record;
}

function isPoint(p) {
  return Array.isArray(p) && p.length === 2 &&
    Number.isFinite(p[0]) && Number.isFinite(p[1]) &&
    p[0] >= -180 && p[0] <= 180 && p[1] >= -90 && p[1] <= 90;
}

function isPolygon(poly) {
  return Array.isArray(poly) && poly.every(isPoint);
}

export function validateRecord(record) {
  if (!record || typeof record !== 'object') return false;
  if (record.type !== 'flora' && record.type !== 'meta') return false;
  if (typeof record.id !== 'string' || record.id.trim() === '') return false;
  if (typeof record.name !== 'string' || record.name.trim() === '') return false;
  if (typeof record.description !== 'string') return false;
  if (typeof record.color !== 'string' || !/^#[\da-f]{6}$/i.test(record.color)) return false;
  if (!Number.isFinite(record.fillOpacity) || record.fillOpacity < 0 || record.fillOpacity > 1) return false;
  if (!Number.isFinite(record.strokeWidth) || record.strokeWidth < 0.5 || record.strokeWidth > 8) return false;
  if (!['round', 'miter', 'bevel'].includes(record.strokeLinejoin)) return false;
  if (!['hidden', 'common', 'scientific', 'both'].includes(record.labelMode)) return false;
  if (typeof record.visible !== 'boolean') return false;
  if (record.type === 'meta' && 'scientificName' in record) return false;
  if (record.type === 'flora' && typeof record.scientificName !== 'string') return false;
  if (!Array.isArray(record.polygons)) return false;
  for (const poly of record.polygons) {
    if (!isPolygon(poly) || poly.length < 3) return false;
  }
  return true;
}

export function exportData(records) {
  return JSON.stringify(records, null, 2);
}

export function exportRecord(record) {
  if (!validateRecord(record)) throw new Error('Invalid record');
  return JSON.stringify(record, null, 2);
}

export function importRecord(jsonText, existingRecords = []) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return null;
  }
  const record = Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : parsed;
  if (!validateRecord(record)) return null;
  const index = existingRecords.findIndex((item) => item.id === record.id);
  const records = index === -1
    ? [...existingRecords, record]
    : existingRecords.map((item, position) => position === index ? record : item);
  return { records, record, replaced: index !== -1 };
}

function parseRecords(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || !parsed.every(validateRecord)) return null;
  return parsed;
}

export function importData(jsonText, existingRecords = []) {
  const parsed = parseRecords(jsonText);
  return parsed === null || parsed.length === 0 ? existingRecords : parsed;
}

export function saveToStorage(records) {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, exportData(records));
    return true;
  } catch {
    return false;
  }
}

export function loadFromStorage() {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return { status: 'unavailable', records: [] };
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { status: 'missing', records: [] };
    const records = parseRecords(raw);
    if (records === null) return { status: 'invalid', records: [] };
    return { status: 'loaded', records };
  } catch {
    return { status: 'unavailable', records: [] };
  }
}
