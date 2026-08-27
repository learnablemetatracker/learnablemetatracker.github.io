// web/src/storage.js
const PROGRESS_KEY = 'geometa-tracker:progress';
const VALID_STATUSES = ['learning', 'reviewing', 'mastered'];

function defaultProgress() {
  return { language: null, currentMapId: null, addedMaps: {}, metaStatus: {} };
}

function safeStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadProgress(storage = safeStorage()) {
  if (!storage) return defaultProgress();
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress, storage = safeStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function addMap(progress, mapId) {
  if (progress.addedMaps[mapId]) return progress;
  return {
    ...progress,
    addedMaps: { ...progress.addedMaps, [mapId]: { addedAt: Date.now() } }
  };
}

export function removeMap(progress, mapId) {
  if (!progress.addedMaps[mapId]) return progress;
  const addedMaps = Object.fromEntries(
    Object.entries(progress.addedMaps).filter(([id]) => id !== mapId)
  );
  return {
    ...progress,
    addedMaps,
    // Untracking a map only stops following it — per-meta status is left
    // alone, since it may be shared with a sibling map from the same
    // author, or the visitor may re-add this map later and expect their
    // progress to still be there.
    currentMapId: progress.currentMapId === mapId ? null : progress.currentMapId
  };
}

export function setMetaStatus(progress, metaId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  return {
    ...progress,
    metaStatus: { ...progress.metaStatus, [metaId]: { status, updatedAt: Date.now() } }
  };
}

export function getMetaStatus(progress, metaId) {
  return progress.metaStatus[metaId]?.status ?? 'new';
}

export function clearMetaStatus(progress, metaId) {
  const metaStatus = Object.fromEntries(
    Object.entries(progress.metaStatus).filter(([id]) => id !== metaId)
  );
  return { ...progress, metaStatus };
}

export function exportProgressJson(progress) {
  return JSON.stringify(progress, null, 2);
}

export function importProgressJson(json) {
  const parsed = JSON.parse(json);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid progress file: not an object');
  }
  if (typeof parsed.metaStatus !== 'object' || parsed.metaStatus === null) {
    throw new Error('Invalid progress file: missing metaStatus');
  }
  if (typeof parsed.addedMaps !== 'object' || parsed.addedMaps === null) {
    throw new Error('Invalid progress file: missing addedMaps');
  }
  return { ...defaultProgress(), ...parsed };
}
