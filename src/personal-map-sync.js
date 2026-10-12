function personalMapId(value) {
  const text = String(value ?? '').trim();
  if (/^[1-9]\d*$/.test(text)) return Number(text);
  try {
    const url = new URL(text);
    const match = url.pathname.match(/^\/personal\/([1-9]\d*)\/?$/);
    if (url.protocol === 'https:' && url.hostname === 'learnablemeta.com' && match) {
      return Number(match[1]);
    }
  } catch { /* Invalid URL. */ }
  throw new Error('Introduce la URL de un mapa personal de LearnableMeta.');
}

export function linkPersonalMap(progress, input) {
  const id = personalMapId(input);
  if (!Number.isSafeInteger(id)) throw new Error('El identificador del mapa no es válido.');
  if (progress.personalMap?.id === id) return progress;
  const pendingMetaIds = Object.entries(progress.metaStatus)
    .filter(([metaId, entry]) => /^\d+$/.test(metaId) && entry?.status === 'mastered')
    .map(([metaId]) => metaId);
  return { ...progress, personalMap: { id, autoSync: false, pendingMetaIds, removedMetaIds: [], readdMetaIds: [], historyVerified: true, historyResetNotice: false, skippedCount: 0, inFlight: null, needsUpload: false, error: null } };
}

export function discardUnverifiedSyncHistory(progress) {
  const sync = progress.personalMap;
  if (!sync || sync.historyVerified) return progress;
  const hadHistory = Boolean(sync.removedMetaIds?.length || sync.readdMetaIds?.length);
  return { ...progress, personalMap: {
    ...sync, removedMetaIds: [], readdMetaIds: [], historyVerified: true,
    historyResetNotice: hadHistory, skippedCount: 0, error: null
  } };
}

export function setPersonalMapAutoSync(progress, enabled) {
  const sync = progress.personalMap;
  return sync ? { ...progress, personalMap: { ...sync, autoSync: Boolean(enabled) } } : progress;
}

export function unlinkPersonalMap(progress) {
  if (!progress.personalMap || progress.personalMap.inFlight) return progress;
  const { personalMap, ...rest } = progress;
  return rest;
}

export function queueMasteredMeta(progress, metaId) {
  const sync = progress.personalMap;
  const id = String(metaId);
  if (!sync || !/^\d+$/.test(id)) return progress;
  if (sync.readdMetaIds?.includes(id)) {
    return { ...progress, personalMap: {
      ...sync,
      pendingMetaIds: [...new Set([...sync.pendingMetaIds, id])],
      readdMetaIds: sync.readdMetaIds.filter((item) => item !== id),
      error: null
    } };
  }
  if (sync.removedMetaIds?.includes(id)) {
    return progress;
  }
  if (sync.pendingMetaIds.includes(id)) return progress;
  return { ...progress, personalMap: { ...sync, pendingMetaIds: [...sync.pendingMetaIds, id] } };
}

export function cancelPendingMeta(progress, metaId) {
  const sync = progress.personalMap;
  if (!sync) return progress;
  const id = String(metaId);
  const readdMetaIds = sync.removedMetaIds?.includes(id)
    ? [...new Set([...(sync.readdMetaIds ?? []), id])]
    : (sync.readdMetaIds ?? []);
  return { ...progress, personalMap: {
    ...sync,
    pendingMetaIds: sync.pendingMetaIds.filter((item) => item !== id),
    readdMetaIds
  } };
}

export function confirmPersonalMapRestored(progress) {
  const sync = progress.personalMap;
  if (!sync || sync.inFlight || !sync.readdMetaIds?.length) return progress;
  const restored = new Set(sync.readdMetaIds);
  return {
    ...progress,
    personalMap: {
      ...sync,
      removedMetaIds: (sync.removedMetaIds ?? []).filter((id) => !restored.has(id)),
      readdMetaIds: [],
      needsUpload: true,
      error: null
    }
  };
}

export function startPersonalMapSync(progress, requestId) {
  const sync = progress.personalMap;
  if (!sync || sync.inFlight || sync.pendingMetaIds.length === 0) return progress;
  return {
    ...progress,
    personalMap: {
      ...sync,
      inFlight: { requestId, operation: 'remove', metaIds: [...sync.pendingMetaIds] },
      error: null
    }
  };
}

export function startPersonalMapReadd(progress, requestId, metaIds) {
  const sync = progress.personalMap;
  if (!sync || sync.inFlight) return progress;
  const selected = (sync.readdMetaIds ?? []).filter((id) => metaIds.includes(id));
  if (selected.length === 0) return progress;
  return {
    ...progress,
    personalMap: {
      ...sync,
      inFlight: { requestId, operation: 'add', metaIds: selected },
      error: null
    }
  };
}

export function selectReaddBatch(catalog, readdMetaIds) {
  for (const id of readdMetaIds) {
    const map = catalog.maps.find((item) =>
      /^[a-f\d]{24}$/i.test(item.geoguessrId) && item.metaIds.includes(id));
    if (map) {
      return {
        sourceMapId: map.geoguessrId,
        metaIds: readdMetaIds.filter((item) => map.metaIds.includes(item))
      };
    }
  }
  return null;
}

export function setPersonalMapSyncError(progress, message) {
  const sync = progress.personalMap;
  return sync ? { ...progress, personalMap: { ...sync, error: message == null ? null : String(message) } } : progress;
}

export function finishPersonalMapSync(progress, requestId, result = {}) {
  const sync = progress.personalMap;
  if (!sync?.inFlight || sync.inFlight.requestId !== requestId) return progress;
  const completed = new Set(sync.inFlight.metaIds);
  if (sync.inFlight.operation === 'add') {
    return {
      ...progress,
      personalMap: {
        ...sync,
        pendingMetaIds: [...new Set([
          ...sync.pendingMetaIds,
          ...[...completed].filter((id) => progress.metaStatus[id]?.status === 'mastered')
        ])],
        removedMetaIds: (sync.removedMetaIds ?? []).filter((id) => !completed.has(id)),
        readdMetaIds: (sync.readdMetaIds ?? []).filter((id) => !completed.has(id)),
        inFlight: null,
        needsUpload: true,
        skippedCount: 0,
        error: null
      }
    };
  }
  const confirmed = new Set(Array.isArray(result.removedMetaIds)
    ? result.removedMetaIds.filter((id) => typeof id === 'string' && completed.has(id))
    : []);
  return {
    ...progress,
    personalMap: {
      ...sync,
      pendingMetaIds: sync.pendingMetaIds.filter((id) => !completed.has(id)),
      removedMetaIds: [...new Set([...(sync.removedMetaIds ?? []).filter((id) => !completed.has(id)), ...confirmed])],
      readdMetaIds: [...new Set([
        ...(sync.readdMetaIds ?? []).filter((id) => !completed.has(id)),
        ...[...confirmed].filter((id) => progress.metaStatus[id]?.status !== 'mastered')
      ])],
      inFlight: null,
      needsUpload: sync.needsUpload || confirmed.size > 0,
      skippedCount: completed.size - confirmed.size,
      error: null
    }
  };
}

export function failPersonalMapSync(progress, requestId, message) {
  const sync = progress.personalMap;
  if (!sync?.inFlight || sync.inFlight.requestId !== requestId) return progress;
  return { ...progress, personalMap: { ...sync, inFlight: null, error: String(message) } };
}

export function markGeoGuessrUpdated(progress) {
  const sync = progress.personalMap;
  return sync ? { ...progress, personalMap: { ...sync, needsUpload: false } } : progress;
}
