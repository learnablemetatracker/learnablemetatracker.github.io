// web/src/app.js
import { loadCatalog } from './catalog.js';
import { loadProgress, saveProgress, exportProgressJson, importProgressJson } from './storage.js';
import { resolveLanguage, t } from './i18n.js?v=20261012-release';
import { renderMapsScreen } from './ui/maps-screen.js?v=20261012-release';
import { renderMapDetailScreen } from './ui/map-detail-screen.js';
import { renderAllMetasScreen } from './ui/all-metas-screen.js';
import { renderHelpScreen } from './ui/help-screen.js?v=20261012-public';
import { renderPersonalMapSync } from './ui/personal-map-sync.js?v=20261012-public';
import {
  linkPersonalMap, discardUnverifiedSyncHistory, unlinkPersonalMap, setPersonalMapAutoSync,
  startPersonalMapSync, startPersonalMapReadd, selectReaddBatch, confirmPersonalMapRestored,
  finishPersonalMapSync, failPersonalMapSync, setPersonalMapSyncError,
  markGeoGuessrUpdated
} from './personal-map-sync.js';

const root = document.getElementById('app-root');

let catalog = null;
let progress = discardUnverifiedSyncHistory(loadProgress());
progress.language = resolveLanguage(progress.language, navigator.language);
saveProgress(progress);

function applyStaticText() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(progress.language, el.dataset.i18n);
  });
  document.getElementById('download-data-btn').textContent = t(progress.language, 'downloadData');
  document.getElementById('import-data-label').textContent = t(progress.language, 'importData');
  document.getElementById('language-select').value = progress.language;
}

function persistAndRerender() {
  saveProgress(progress);
  render();
}

function requestPersonalMapSync(autoOpen = false, operation = 'remove') {
  if (!progress.personalMap || progress.personalMap.inFlight) return;
  const bridgeVersion = Number(document.documentElement.dataset.lmSyncBridgeVersion);
  if (!(bridgeVersion >= 5)) {
    progress = setPersonalMapSyncError(progress, t(progress.language, 'syncBridgeUpgrade'));
    persistAndRerender();
    return;
  }
  const batch = operation === 'add'
    ? selectReaddBatch(catalog, progress.personalMap.readdMetaIds ?? [])
    : null;
  if (operation === 'add' && !batch) {
    if (progress.personalMap.readdMetaIds?.length) {
      progress = setPersonalMapSyncError(progress, t(progress.language, 'syncSourceMissing'));
      persistAndRerender();
    }
    return;
  }
  const requestId = crypto.randomUUID();
  progress = operation === 'add'
    ? startPersonalMapReadd(progress, requestId, batch.metaIds)
    : startPersonalMapSync(progress, requestId);
  if (progress.personalMap?.inFlight?.requestId !== requestId) return;
  const { id, inFlight } = progress.personalMap;
  persistAndRerender();
  window.dispatchEvent(new CustomEvent(operation === 'add' ? 'lm-sync-request-v3' : 'lm-sync-request', {
    detail: JSON.stringify({
      requestId, operation, personalMapId: id, metaIds: inFlight.metaIds,
      sourceMapId: batch?.sourceMapId, autoOpen
    })
  }));
}

function maybeAutoSync() {
  const sync = progress.personalMap;
  if (!catalog || !sync?.autoSync || sync.inFlight ||
      document.documentElement.dataset.lmSyncBridge !== 'ready' ||
      Number(document.documentElement.dataset.lmSyncBridgeVersion) < 5) return;
  if (sync.pendingMetaIds.length) requestPersonalMapSync(true);
  else if (sync.readdMetaIds?.length) requestPersonalMapSync(true, 'add');
}

function handleMetaChange() {
  persistAndRerender();
  maybeAutoSync();
}

function updateActiveNav(hash) {
  const onMapsScreen = hash === '#/' || hash.startsWith('#/map/');
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    const isActive = link.getAttribute('href') === '#/' ? onMapsScreen : link.getAttribute('href') === hash;
    link.classList.toggle('is-active', isActive);
  });
}

function render() {
  applyStaticText();
  if (!catalog) return;

  const hash = window.location.hash || '#/';
  updateActiveNav(hash);
  root.textContent = '';

  let practiceMap = null;
  if (hash === '#/' || hash.startsWith('#/map/') || hash === '#/metas') {
    practiceMap = renderPersonalMapSync(progress, {
      onLink: (value) => {
        progress = linkPersonalMap(progress, value);
        persistAndRerender();
      },
      onUnlink: () => {
        const unlinked = unlinkPersonalMap(progress);
        if (unlinked === progress) return;
        progress = unlinked;
        persistAndRerender();
        window.dispatchEvent(new Event('lm-sync-clear'));
      },
      onAutoSyncChange: (enabled) => {
        progress = setPersonalMapAutoSync(progress, enabled);
        persistAndRerender();
        if (enabled) maybeAutoSync();
      },
      onSync: () => requestPersonalMapSync(false),
      onReadd: () => requestPersonalMapSync(false, 'add'),
      onRestored: () => {
        progress = confirmPersonalMapRestored(progress);
        persistAndRerender();
      },
      onRetry: () => {
        progress = failPersonalMapSync(progress, progress.personalMap.inFlight.requestId, '');
        persistAndRerender();
      },
      onUploadDone: () => {
        progress = markGeoGuessrUpdated(progress);
        persistAndRerender();
      }
    });
  }

  if (hash === '#/') {
    const intro = document.createElement('header');
    intro.className = 'dashboard-intro';
    const title = document.createElement('h1');
    title.textContent = t(progress.language, 'dashboardTitle');
    const subtitle = document.createElement('p');
    subtitle.textContent = t(progress.language, 'dashboardSubtitle');
    intro.append(title, subtitle);
    root.appendChild(intro);

    const layout = document.createElement('div');
    layout.className = 'dashboard-layout';
    const rail = document.createElement('aside');
    rail.className = 'dashboard-rail';
    rail.appendChild(practiceMap);
    const main = document.createElement('div');
    main.className = 'dashboard-main';
    main.appendChild(renderMapsScreen(catalog, progress, persistAndRerender));
    layout.append(rail, main);
    root.appendChild(layout);
  } else if (hash.startsWith('#/map/')) {
    root.appendChild(practiceMap);
    const mapId = decodeURIComponent(hash.slice('#/map/'.length));
    root.appendChild(renderMapDetailScreen(catalog, progress, mapId, handleMetaChange));
  } else if (hash === '#/metas') {
    root.appendChild(practiceMap);
    root.appendChild(renderAllMetasScreen(catalog, progress, handleMetaChange));
  } else if (hash === '#/help') {
    root.appendChild(renderHelpScreen(progress));
  } else {
    if (practiceMap) root.appendChild(practiceMap);
    root.appendChild(renderMapsScreen(catalog, progress, persistAndRerender));
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('lm-sync-bridge-ready', () => {
  if (Number(document.documentElement.dataset.lmSyncBridgeVersion) >= 5 &&
      progress.personalMap?.error === t(progress.language, 'syncBridgeUpgrade')) {
    progress = setPersonalMapSyncError(progress, null);
    saveProgress(progress);
  }
  render();
  maybeAutoSync();
});
window.addEventListener('lm-sync-result', (event) => {
  try {
    const result = JSON.parse(event.detail);
    const previous = progress;
    progress = result.status === 'success'
      ? finishPersonalMapSync(progress, result.requestId, result)
      : failPersonalMapSync(progress, result.requestId, result.message ?? 'Sync failed');
    if (progress === previous) return;
    persistAndRerender();
    if (result.status === 'success') maybeAutoSync();
  } catch { /* Ignore malformed bridge messages. */ }
});
window.dispatchEvent(new Event('lm-sync-check-result'));

document.getElementById('language-select').addEventListener('change', (event) => {
  progress.language = event.target.value;
  persistAndRerender();
});

document.getElementById('download-data-btn').addEventListener('click', () => {
  const blob = new Blob([exportProgressJson(progress)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'geometa-progress.json';
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-data-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    progress = discardUnverifiedSyncHistory(importProgressJson(await file.text()));
    persistAndRerender();
  } catch (err) {
    window.alert(`${t(progress.language, 'importData')}: ${err.message}`);
  } finally {
    event.target.value = '';
  }
});

loadCatalog()
  .then((data) => {
    catalog = data;
    render();
    maybeAutoSync();
  })
  .catch((err) => {
    root.textContent = `${t(progress.language, 'catalogLoadFailed')} ${err.message}`;
  });
