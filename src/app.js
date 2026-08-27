// web/src/app.js
import { loadCatalog } from './catalog.js';
import { loadProgress, saveProgress, exportProgressJson, importProgressJson } from './storage.js';
import { resolveLanguage, t } from './i18n.js';
import { renderMapsScreen } from './ui/maps-screen.js';
import { renderMapDetailScreen } from './ui/map-detail-screen.js';
import { renderAllMetasScreen } from './ui/all-metas-screen.js';
import { renderHelpScreen } from './ui/help-screen.js';

const root = document.getElementById('app-root');

let catalog = null;
let progress = loadProgress();
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

  if (hash.startsWith('#/map/')) {
    const mapId = decodeURIComponent(hash.slice('#/map/'.length));
    root.appendChild(renderMapDetailScreen(catalog, progress, mapId, persistAndRerender));
  } else if (hash === '#/metas') {
    root.appendChild(renderAllMetasScreen(catalog, progress, persistAndRerender));
  } else if (hash === '#/help') {
    root.appendChild(renderHelpScreen(progress));
  } else {
    root.appendChild(renderMapsScreen(catalog, progress, persistAndRerender));
  }
}

window.addEventListener('hashchange', render);

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
    progress = importProgressJson(await file.text());
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
  })
  .catch((err) => {
    root.textContent = `${t(progress.language, 'catalogLoadFailed')} ${err.message}`;
  });
