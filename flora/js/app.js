import {
  createRecord, validateRecord, exportData, importData, exportRecord, importRecord,
  saveToStorage, loadFromStorage
} from './model.js';
import {
  toLeafletLatLngs, fromLeafletLatLng, polygonPathOptions, previewPointOptions, labelTextFor, centroid,
  clonePolygon, validateVertex, moveVertex, removeVertex, insertVertex
} from './geo.js?v=5';

const MAP_CENTER = [20, 0];
const MAP_ZOOM = 2;
const LABEL_MIN_ZOOM = 4;

const state = {
  records: [],
  viewType: 'flora',
  floraSubview: 'map', // 'map' | 'cards'
  selectedId: null,
  mode: 'navigate', // 'navigate' | 'draw'
  currentPolygon: [],
  world: null,
  map: null,
  worldLayer: null,
  polygonLayer: null,
  previewLayer: null,
  previewGuide: null,
  labelLayer: null,
  editLayer: null, // polygon being edited
  editHandlesLayer: null,
  mouseLatLng: null,
  editingPolygon: null, // { recordId, polygonIndex, draftPolygon, selectedVertexIndex }
};

const els = {
  tabFlora: document.getElementById('tab-flora'),
  tabMetas: document.getElementById('tab-metas'),
  btnExport: document.getElementById('btn-export'),
  btnImport: document.getElementById('btn-import'),
  btnExportRecord: document.getElementById('btn-export-record'),
  btnImportRecord: document.getElementById('btn-import-record'),
  btnImportRecordList: document.getElementById('btn-import-record-list'),
  btnChooseRecordFile: document.getElementById('btn-choose-record-file'),
  importRecordFile: document.getElementById('import-record-file'),
  btnNew: document.getElementById('btn-new'),
  recordList: document.getElementById('record-list'),
  emptyList: document.getElementById('empty-list'),
  search: document.getElementById('search-records'),
  panelList: document.getElementById('panel-list'),
  panelEditor: document.getElementById('panel-editor'),
  editorForm: document.getElementById('editor-form'),
  fieldScientific: document.getElementById('field-scientific'),
  editName: document.getElementById('edit-name'),
  editScientific: document.getElementById('edit-scientific'),
  editDescription: document.getElementById('edit-description'),
  editColor: document.getElementById('edit-color'),
  editOpacity: document.getElementById('edit-opacity'),
  editOpacityVal: document.getElementById('edit-opacity-val'),
  editStroke: document.getElementById('edit-stroke'),
  editJoin: document.getElementById('edit-join'),
  editLabel: document.getElementById('edit-label'),
  editVisible: document.getElementById('edit-visible'),
  btnDeleteRecord: document.getElementById('btn-delete-record'),
  polygonList: document.getElementById('polygon-list'),
  floraSubviews: document.getElementById('flora-subviews'),
  subviewMap: document.getElementById('subview-map'),
  subviewCards: document.getElementById('subview-cards'),
  panelCards: document.getElementById('panel-cards'),
  speciesCardsList: document.getElementById('species-cards-list'),
  btnNewArea: document.getElementById('btn-new-area'),
  drawActions: document.getElementById('draw-actions'),
  btnFinish: document.getElementById('btn-finish'),
  btnUndo: document.getElementById('btn-undo'),
  btnCancel: document.getElementById('btn-cancel'),
  editActions: document.getElementById('edit-actions'),
  btnSaveEdit: document.getElementById('btn-save-edit'),
  btnCancelEdit: document.getElementById('btn-cancel-edit'),
  vertexEditor: document.getElementById('vertex-editor'),
  vertexLon: document.getElementById('vertex-lon'),
  vertexLat: document.getElementById('vertex-lat'),
  btnAddVertex: document.getElementById('btn-add-vertex'),
  btnRemoveVertex: document.getElementById('btn-remove-vertex'),
  editHint: document.getElementById('edit-hint'),
  drawHint: document.getElementById('draw-hint'),
  btnBackToList: document.getElementById('btn-back-to-list'),
  mapContainer: document.getElementById('map-container'),
  btnMode: document.getElementById('btn-mode'),
  btnZoomIn: document.getElementById('btn-zoom-in'),
  btnZoomOut: document.getElementById('btn-zoom-out'),
  btnReset: document.getElementById('btn-reset'),
  legend: document.getElementById('legend'),
  storageWarning: document.getElementById('storage-warning'),
  importModal: document.getElementById('import-modal'),
  importModalTitle: document.getElementById('import-modal-title'),
  importModalText: document.getElementById('import-modal-text'),
  importText: document.getElementById('import-text'),
  importError: document.getElementById('import-error'),
};

function init() {
  const stored = loadFromStorage();
  state.records = stored.records;
  if (stored.status === 'missing') {
    state.records = [createRecord('flora', { name: 'Ejemplo: Encina', scientificName: 'Quercus ilex', description: 'Borra este ejemplo y dibuja tus propias áreas.' })];
  }
  els.storageWarning.hidden = stored.status !== 'invalid' && stored.status !== 'unavailable';
  initMap();
  loadWorld().then(() => {
    render();
  });
  bindEvents();
  setView('flora');
}

function initMap() {
  state.map = L.map('map', {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    minZoom: 1,
    zoomControl: false,
    worldCopyJump: true,
    attributionControl: true,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | Made with <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
    maxZoom: 19,
  }).addTo(state.map);

  state.map.createPane('offlineBase');
  state.map.getPane('offlineBase').style.zIndex = '150';
  state.worldLayer = L.geoJSON(null, {
    pane: 'offlineBase',
    style: { fillColor: '#e8f4ea', fillOpacity: 1, color: '#9bbba0', weight: 0.5 },
    interactive: false,
  }).addTo(state.map);

  state.polygonLayer = L.layerGroup().addTo(state.map);
  state.previewLayer = L.layerGroup().addTo(state.map);
  state.labelLayer = L.layerGroup().addTo(state.map);
  state.editLayer = L.layerGroup().addTo(state.map);
  state.editHandlesLayer = L.layerGroup().addTo(state.map);

  state.map.on('click', (e) => {
    if (state.mode !== 'draw') return;
    state.currentPolygon.push(fromLeafletLatLng(e.latlng));
    state.mouseLatLng = e.latlng;
    updateModeUI();
    renderPreview();
  });

  state.map.on('mousemove', (e) => {
    if (state.mode !== 'draw') return;
    state.mouseLatLng = e.latlng;
    renderPreviewGuide();
  });

  state.map.on('mouseout', () => {
    state.mouseLatLng = null;
    renderPreviewGuide();
  });

  state.map.on('zoomend moveend', () => {
    renderMap();
  });

  // Exposed for manual debugging and automated browser checks.
  if (typeof window !== 'undefined') {
    window.__floraMap = state.map;
    window.__floraApp = state;
    window.__floraRender = render;
  }
}

async function loadWorld() {
  try {
    const res = await fetch('data/world.geojson');
    state.world = await res.json();
    state.worldLayer.addData(state.world);
  } catch (err) {
    console.error('No se pudo cargar el mapa base', err);
    state.world = { type: 'FeatureCollection', features: [] };
  }
}

function setView(type) {
  state.viewType = type;
  state.floraSubview = 'map';
  state.selectedId = null;
  state.mode = 'navigate';
  state.currentPolygon = [];
  cancelPolygonEdit({ silent: true });
  els.tabFlora.setAttribute('aria-pressed', type === 'flora');
  els.tabMetas.setAttribute('aria-pressed', type === 'meta');
  render();
}

function getSelectedRecord() {
  return state.records.find(r => r.id === state.selectedId) || null;
}

function filteredRecords() {
  const q = els.search.value.trim().toLowerCase();
  return state.records
    .filter(r => r.type === state.viewType)
    .filter(r => {
      if (!q) return true;
      return r.name.toLowerCase().includes(q) ||
        (r.scientificName && r.scientificName.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q);
    });
}

function save() {
  els.storageWarning.hidden = saveToStorage(state.records);
  render();
}

function render() {
  renderSidebarPanels();
  renderList();
  renderCards();
  renderEditor();
  renderMap();
  renderLegend();
  updateModeUI();
}

function renderSidebarPanels() {
  const showFloraSubviews = state.viewType === 'flora';
  els.floraSubviews.hidden = !showFloraSubviews;
  els.subviewMap.setAttribute('aria-pressed', String(state.floraSubview === 'map'));
  els.subviewCards.setAttribute('aria-pressed', String(state.floraSubview === 'cards'));

  if (state.selectedId) {
    els.panelList.hidden = true;
    els.panelCards.hidden = true;
    els.panelEditor.hidden = false;
    return;
  }

  if (showFloraSubviews && state.floraSubview === 'cards') {
    els.panelList.hidden = true;
    els.panelCards.hidden = false;
    els.panelEditor.hidden = true;
    return;
  }

  els.panelList.hidden = false;
  els.panelCards.hidden = true;
  els.panelEditor.hidden = true;
  document.getElementById('list-title').textContent = 'Registros';
}

function renderList() {
  const records = filteredRecords();
  els.recordList.innerHTML = '';
  els.emptyList.hidden = records.length > 0;
  for (const r of records) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'record-item';
    button.setAttribute('aria-pressed', String(r.id === state.selectedId));
    if (!r.visible) button.classList.add('invisible');

    const color = document.createElement('span');
    color.className = 'record-color';
    color.style.backgroundColor = r.color;
    button.appendChild(color);

    const info = document.createElement('span');
    info.className = 'record-info';
    const name = document.createElement('span');
    name.className = 'record-name';
    name.textContent = r.name;
    info.appendChild(name);
    const meta = document.createElement('span');
    meta.className = 'record-meta';
    meta.textContent = `${r.polygons.length} polígono${r.polygons.length === 1 ? '' : 's'}`;
    info.appendChild(meta);
    button.appendChild(info);

    button.addEventListener('click', () => {
      cancelPolygonEdit({ silent: true });
      state.selectedId = r.id;
      render();
    });
    li.appendChild(button);
    els.recordList.appendChild(li);
  }
}

function renderEditor() {
  const r = getSelectedRecord();
  if (!r) {
    return;
  }

  els.fieldScientific.hidden = r.type !== 'flora';
  const labelOpts = els.editLabel.querySelectorAll('option');
  for (const opt of labelOpts) {
    opt.disabled = opt.value === 'scientific' && r.type === 'meta';
  }

  if (document.activeElement !== els.editName) els.editName.value = r.name;
  if (document.activeElement !== els.editScientific) els.editScientific.value = r.scientificName || '';
  if (document.activeElement !== els.editDescription) els.editDescription.value = r.description;
  if (document.activeElement !== els.editColor) els.editColor.value = r.color;
  if (document.activeElement !== els.editOpacity) els.editOpacity.value = r.fillOpacity;
  els.editOpacityVal.textContent = String(r.fillOpacity);
  if (document.activeElement !== els.editStroke) els.editStroke.value = r.strokeWidth;
  if (document.activeElement !== els.editJoin) els.editJoin.value = r.strokeLinejoin;
  if (document.activeElement !== els.editLabel) els.editLabel.value = r.labelMode;
  if (document.activeElement !== els.editVisible) els.editVisible.checked = r.visible;

  renderPolygonList(r);

  if (state.editingPolygon) {
    els.vertexEditor.hidden = false;
    els.drawHint.hidden = true;
    updateVertexInputs();
  } else {
    els.vertexEditor.hidden = true;
    els.drawHint.hidden = false;
  }
}

function renderPolygonList(r) {
  els.polygonList.innerHTML = '';
  r.polygons.forEach((poly, idx) => {
    const li = document.createElement('li');
    li.className = 'polygon-item';
    const isEditing = state.editingPolygon && state.editingPolygon.recordId === r.id && state.editingPolygon.polygonIndex === idx;
    li.innerHTML = `
      <span>Polígono ${idx + 1} · ${poly.length} puntos${isEditing ? ' · editando' : ''}</span>
      <span class="polygon-actions">
        <button class="btn btn--secondary btn--small" data-action="edit" data-idx="${idx}" type="button">Editar</button>
        <button class="btn btn--danger btn--small" data-action="delete" data-idx="${idx}" type="button">Borrar</button>
      </span>
    `;
    li.querySelector('[data-action="edit"]').addEventListener('click', () => startPolygonEdit(r.id, idx));
    li.querySelector('[data-action="delete"]').addEventListener('click', () => {
      if (isEditing) cancelPolygonEdit({ silent: true });
      r.polygons.splice(idx, 1);
      save();
    });
    els.polygonList.appendChild(li);
  });
}

function renderMap() {
  state.polygonLayer.clearLayers();
  state.previewLayer.clearLayers();
  state.labelLayer.clearLayers();
  state.editLayer.clearLayers();
  state.editHandlesLayer.clearLayers();
  renderUserPolygons();
  renderPreview();
  renderEditLayers();
  renderLabels();
}

function renderUserPolygons() {
  const selected = getSelectedRecord();
  for (const r of state.records) {
    if (!r.visible || r.type !== state.viewType) continue;
    const isSelected = selected && selected.id === r.id;
    r.polygons.forEach((poly, idx) => {
      if (state.editingPolygon && state.editingPolygon.recordId === r.id && state.editingPolygon.polygonIndex === idx) return;
      const latlngs = toLeafletLatLngs(poly);
      if (latlngs.length < 3) return;
      const layer = L.polygon(latlngs, polygonPathOptions(r, isSelected));
      layer.on('click', () => {
        if (state.mode === 'navigate' && !state.editingPolygon) {
          state.selectedId = r.id;
          render();
        }
      });
      layer.addTo(state.polygonLayer);
    });
  }
}

function renderPreview() {
  state.previewLayer.clearLayers();
  state.previewGuide = null;
  if (state.mode !== 'draw' || state.currentPolygon.length === 0) return;
  const latlngs = toLeafletLatLngs(state.currentPolygon);

  if (latlngs.length > 1) {
    L.polyline(latlngs, { interactive: false, className: 'preview-line', dashArray: '4 3', weight: 1.5 }).addTo(state.previewLayer);
  }

  const selected = getSelectedRecord();
  const color = selected ? selected.color : '#338833';
  for (const ll of latlngs) {
    L.circleMarker(ll, previewPointOptions(color)).addTo(state.previewLayer);
  }

  renderPreviewGuide();
}

function renderPreviewGuide() {
  if (state.mode !== 'draw' || !state.mouseLatLng || !state.currentPolygon.length) {
    if (state.previewGuide) state.previewLayer.removeLayer(state.previewGuide);
    state.previewGuide = null;
    return;
  }
  const [lon, lat] = state.currentPolygon[state.currentPolygon.length - 1];
  const line = [[lat, lon], state.mouseLatLng];
  if (state.previewGuide) {
    state.previewGuide.setLatLngs(line);
  } else {
    state.previewGuide = L.polyline(line, {
      interactive: false, className: 'preview-line', dashArray: '4 3', weight: 1.5
    }).addTo(state.previewLayer);
  }
}

function renderEditLayers() {
  state.editLayer.clearLayers();
  state.editHandlesLayer.clearLayers();
  if (!state.editingPolygon) return;

  const { draftPolygon, selectedVertexIndex } = state.editingPolygon;
  const r = getSelectedRecord();
  const color = r ? r.color : '#338833';
  const latlngs = toLeafletLatLngs(draftPolygon);

  L.polygon(latlngs, {
    color: '#ffffff',
    fillColor: color,
    fillOpacity: 0.15,
    weight: Math.max(3, (r ? r.strokeWidth : 2) + 1.5),
    lineJoin: r ? r.strokeLinejoin : 'round',
    dashArray: '4 3',
  }).addTo(state.editLayer);

  draftPolygon.forEach((point, idx) => {
    const [lon, lat] = point;
    const marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: `vertex-handle${idx === selectedVertexIndex ? ' selected' : ''}`,
        html: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
      draggable: true,
    }).addTo(state.editHandlesLayer);

    marker.on('dragend', (e) => {
      const ll = e.target.getLatLng();
      const newLon = parseFloat(ll.lng.toFixed(6));
      const newLat = parseFloat(ll.lat.toFixed(6));
      if (!validateVertex(newLon, newLat)) {
        renderEditLayers();
        return;
      }
      state.editingPolygon.draftPolygon = moveVertex(state.editingPolygon.draftPolygon, idx, [newLon, newLat]);
      state.editingPolygon.selectedVertexIndex = idx;
      renderEditLayers();
      updateVertexInputs();
    });

    marker.on('click', () => {
      state.editingPolygon.selectedVertexIndex = idx;
      renderEditLayers();
      updateVertexInputs();
    });
  });
}

function startPolygonEdit(recordId, polygonIndex) {
  const r = state.records.find(x => x.id === recordId);
  if (!r || polygonIndex < 0 || polygonIndex >= r.polygons.length) return;
  state.mode = 'navigate';
  state.currentPolygon = [];
  state.mouseLatLng = null;
  state.editingPolygon = {
    recordId,
    polygonIndex,
    draftPolygon: clonePolygon(r.polygons[polygonIndex]),
    selectedVertexIndex: 0,
  };
  render();
}

function cancelPolygonEdit({ silent = false } = {}) {
  if (!state.editingPolygon) return;
  state.editingPolygon = null;
  state.editLayer.clearLayers();
  state.editHandlesLayer.clearLayers();
  if (!silent) render();
}

function savePolygonEdit() {
  if (!state.editingPolygon) return;
  const { recordId, polygonIndex, draftPolygon } = state.editingPolygon;
  const r = state.records.find(x => x.id === recordId);
  if (!r) return;
  r.polygons[polygonIndex] = draftPolygon;
  state.editingPolygon = null;
  state.editLayer.clearLayers();
  state.editHandlesLayer.clearLayers();
  save();
}

function updateVertexInputs() {
  if (!state.editingPolygon) return;
  const [lon, lat] = state.editingPolygon.draftPolygon[state.editingPolygon.selectedVertexIndex];
  els.vertexLon.value = lon;
  els.vertexLat.value = lat;
}

function renderLabels() {
  if (state.map.getZoom() < LABEL_MIN_ZOOM) return;
  const selected = getSelectedRecord();
  for (const r of state.records) {
    if (!r.visible || r.type !== state.viewType) continue;
    if (selected && selected.id !== r.id && r.labelMode === 'hidden') continue;
    const text = labelTextFor(r);
    if (!text) continue;
    for (const poly of r.polygons) {
      const [lon, lat] = centroid(poly);
      L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'map-label',
          html: `<span class="map-label-text">${escapeHtml(text)}</span>`,
          iconSize: null,
        }),
        interactive: false,
      }).addTo(state.labelLayer);
    }
  }
}

function renderLegend() {
  const visible = state.records.filter(r => r.visible && r.type === state.viewType);
  els.legend.innerHTML = '';
  if (visible.length === 0) {
    els.legend.innerHTML = '<span class="legend-item">Sin capas visibles</span>';
    return;
  }
  for (const r of visible) {
    const span = document.createElement('span');
    span.className = 'legend-item';
    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.backgroundColor = r.color;
    span.appendChild(swatch);
    const name = document.createElement('span');
    name.textContent = r.name;
    span.appendChild(name);
    els.legend.appendChild(span);
  }
}

function renderCards() {
  if (state.viewType !== 'flora' || state.floraSubview !== 'cards' || state.selectedId) return;
  els.speciesCardsList.innerHTML = '';
  const records = filteredRecords();
  if (records.length === 0) {
    els.speciesCardsList.innerHTML = '<p class="empty-state">No hay especies.</p>';
    return;
  }
  for (const r of records) {
    const card = document.createElement('article');
    card.className = 'species-card';
    card.innerHTML = `
      <div class="species-card-header">
        <span class="species-card-color" style="background-color: ${escapeHtml(r.color)}"></span>
        <div class="species-card-titles">
          <h3 class="species-card-name">${escapeHtml(r.name)}</h3>
          ${r.scientificName ? `<p class="species-card-scientific">${escapeHtml(r.scientificName)}</p>` : ''}
        </div>
      </div>
      <p class="species-card-desc">${escapeHtml(r.description || 'Sin descripción.')}</p>
      <p class="species-card-meta">${r.polygons.length} área${r.polygons.length === 1 ? '' : 's'}</p>
      <div class="species-card-actions">
        <button class="btn btn--secondary btn--small" data-action="edit" type="button">Editar ficha</button>
        <button class="btn btn--primary btn--small" data-action="view" type="button">Ver en mapa</button>
      </div>
    `;
    card.querySelector('[data-action="edit"]').addEventListener('click', () => {
      state.selectedId = r.id;
      state.floraSubview = 'map';
      render();
    });
    card.querySelector('[data-action="view"]').addEventListener('click', () => {
      state.selectedId = r.id;
      state.floraSubview = 'map';
      render();
      fitRecordBounds(r);
    });
    els.speciesCardsList.appendChild(card);
  }
}

function fitRecordBounds(r) {
  const allPoints = r.polygons.flat();
  if (allPoints.length === 0) return;
  const latlngs = toLeafletLatLngs(allPoints);
  state.map.fitBounds(latlngs, { padding: [20, 20], maxZoom: 16 });
}

function updateModeUI() {
  els.btnMode.textContent = `Modo: ${state.mode === 'draw' ? 'dibujar' : 'navegar'}`;
  els.mapContainer.classList.toggle('drawing', state.mode === 'draw');

  const idle = state.mode === 'navigate' && !state.editingPolygon;
  const drawing = state.mode === 'draw';
  const editing = !!state.editingPolygon;
  if (drawing) {
    state.map.dragging.disable();
    state.map.doubleClickZoom.disable();
  } else {
    state.map.dragging.enable();
    state.map.doubleClickZoom.enable();
  }

  const r = getSelectedRecord();
  els.btnNewArea.hidden = !idle || !r;
  els.drawActions.hidden = !drawing;
  els.editActions.hidden = !editing;

  if (els.btnFinish) els.btnFinish.disabled = state.currentPolygon.length < 3;
  if (els.btnUndo) els.btnUndo.disabled = state.currentPolygon.length === 0;
  if (els.btnCancel) els.btnCancel.disabled = false;

  if (editing) {
    els.drawHint.textContent = `Editando polígono ${state.editingPolygon.polygonIndex + 1}. Guarda o cancela los cambios.`;
  } else if (drawing) {
    els.drawHint.textContent = `${state.currentPolygon.length} puntos colocados. Clic o toque para añadir; mínimo 3 para finalizar. Modo Navegar para mover el mapa.`;
  } else {
    els.drawHint.textContent = 'Modo navegar: arrastra o desplaza el mapa. Usa +/− para zoom.';
  }
}

function bindEvents() {
  els.tabFlora.addEventListener('click', () => setView('flora'));
  els.tabMetas.addEventListener('click', () => setView('meta'));

  els.btnNew.addEventListener('click', () => {
    cancelPolygonEdit({ silent: true });
    const r = createRecord(state.viewType, {
      name: state.viewType === 'flora' ? 'Nueva flora' : 'Nueva meta',
      color: state.viewType === 'flora' ? '#338833' : '#336699'
    });
    state.records.push(r);
    state.selectedId = r.id;
    state.floraSubview = 'map';
    state.mode = 'draw';
    state.currentPolygon = [];
    save();
  });

  els.btnDeleteRecord.addEventListener('click', () => {
    const r = getSelectedRecord();
    if (!r) return;
    if (!confirm(`¿Borrar "${r.name}"?`)) return;
    cancelPolygonEdit({ silent: true });
    state.records = state.records.filter(x => x.id !== r.id);
    state.selectedId = null;
    save();
  });

  els.search.addEventListener('input', render);

  bindEditorEvents();
  bindMapEvents();
  bindDrawEvents();
  bindSubviewEvents();
  bindVertexEditorEvents();
  bindImportExport();
  els.btnBackToList.addEventListener('click', () => {
    cancelPolygonEdit({ silent: true });
    state.selectedId = null;
    render();
  });
}

function bindEditorEvents() {
  const update = () => {
    const r = getSelectedRecord();
    if (!r) return;
    const name = els.editName.value.trim();
    if (name === '') {
      els.editName.classList.add('input--invalid');
      return;
    }
    els.editName.classList.remove('input--invalid');
    r.name = name;
    if (r.type === 'flora') r.scientificName = els.editScientific.value.trim();
    r.description = els.editDescription.value;
    r.color = els.editColor.value;
    r.fillOpacity = parseFloat(els.editOpacity.value);
    r.strokeWidth = parseFloat(els.editStroke.value);
    r.strokeLinejoin = els.editJoin.value;
    r.labelMode = els.editLabel.value;
    r.visible = els.editVisible.checked;
    if (r.labelMode === 'scientific' && r.type === 'meta') r.labelMode = 'common';
    save();
  };
  for (const el of [els.editName, els.editScientific, els.editDescription, els.editColor, els.editOpacity, els.editStroke, els.editJoin, els.editLabel, els.editVisible]) {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  }
  els.editName.addEventListener('blur', () => {
    const r = getSelectedRecord();
    if (!r) return;
    if (els.editName.value.trim() === '') {
      els.editName.value = r.name;
      els.editName.classList.remove('input--invalid');
    }
  });
}

function bindMapEvents() {
  els.btnMode.addEventListener('click', () => {
    cancelPolygonEdit({ silent: true });
    state.mode = state.mode === 'navigate' ? 'draw' : 'navigate';
    state.currentPolygon = [];
    state.mouseLatLng = null;
    render();
  });
  els.btnZoomIn.addEventListener('click', () => state.map.zoomIn());
  els.btnZoomOut.addEventListener('click', () => state.map.zoomOut());
  els.btnReset.addEventListener('click', () => {
    state.map.setView(MAP_CENTER, MAP_ZOOM);
  });
}

function bindDrawEvents() {
  const startDraw = () => {
    cancelPolygonEdit({ silent: true });
    state.mode = 'draw';
    state.currentPolygon = [];
    state.mouseLatLng = null;
    render();
  };

  els.btnNewArea.addEventListener('click', startDraw);

  els.btnFinish.addEventListener('click', () => {
    if (state.currentPolygon.length < 3) return;
    const r = getSelectedRecord();
    if (!r) return;
    r.polygons.push([...state.currentPolygon]);
    state.currentPolygon = [];
    state.mouseLatLng = null;
    state.mode = 'navigate';
    save();
  });

  els.btnUndo.addEventListener('click', () => {
    state.currentPolygon.pop();
    state.mouseLatLng = null;
    updateModeUI();
    renderPreview();
  });

  els.btnCancel.addEventListener('click', () => {
    state.currentPolygon = [];
    state.mouseLatLng = null;
    state.mode = 'navigate';
    updateModeUI();
    renderPreview();
  });

  els.btnSaveEdit.addEventListener('click', savePolygonEdit);
  els.btnCancelEdit.addEventListener('click', () => cancelPolygonEdit());
}

function bindSubviewEvents() {
  els.subviewMap.addEventListener('click', () => {
    state.floraSubview = 'map';
    render();
  });
  els.subviewCards.addEventListener('click', () => {
    cancelPolygonEdit({ silent: true });
    state.selectedId = null;
    state.floraSubview = 'cards';
    render();
  });
}

function bindVertexEditorEvents() {
  const updateFromInputs = () => {
    if (!state.editingPolygon) return;
    const lon = parseFloat(els.vertexLon.value);
    const lat = parseFloat(els.vertexLat.value);
    if (!validateVertex(lon, lat)) {
      updateVertexInputs();
      return;
    }
    const idx = state.editingPolygon.selectedVertexIndex;
    state.editingPolygon.draftPolygon = moveVertex(state.editingPolygon.draftPolygon, idx, [lon, lat]);
    renderEditLayers();
  };
  els.vertexLon.addEventListener('change', updateFromInputs);
  els.vertexLat.addEventListener('change', updateFromInputs);

  els.btnAddVertex.addEventListener('click', () => {
    if (!state.editingPolygon) return;
    const idx = state.editingPolygon.selectedVertexIndex;
    const [lon, lat] = state.editingPolygon.draftPolygon[idx];
    const nextIdx = (idx + 1) % state.editingPolygon.draftPolygon.length;
    const [nextLon, nextLat] = state.editingPolygon.draftPolygon[nextIdx];
    const midLon = parseFloat(((lon + nextLon) / 2).toFixed(6));
    const midLat = parseFloat(((lat + nextLat) / 2).toFixed(6));
    state.editingPolygon.draftPolygon = insertVertex(state.editingPolygon.draftPolygon, idx, [midLon, midLat]);
    state.editingPolygon.selectedVertexIndex = idx + 1;
    renderEditLayers();
    updateVertexInputs();
  });

  els.btnRemoveVertex.addEventListener('click', () => {
    if (!state.editingPolygon) return;
    const idx = state.editingPolygon.selectedVertexIndex;
    state.editingPolygon.draftPolygon = removeVertex(state.editingPolygon.draftPolygon, idx);
    state.editingPolygon.selectedVertexIndex = Math.min(idx, state.editingPolygon.draftPolygon.length - 1);
    renderEditLayers();
    updateVertexInputs();
  });
}

function bindImportExport() {
  let importMode = 'all';
  const downloadJson = (contents, filename) => {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const openImportModal = (mode, text = '') => {
    importMode = mode;
    els.importModalTitle.textContent = mode === 'record' ? 'Importar un registro' : 'Importar todos los registros';
    els.importModalText.textContent = mode === 'record'
      ? 'Elige un JSON o pégalo aquí. Se añadirá un registro; si su ID ya existe, se actualizará solo ese registro.'
      : 'Pega el contenido JSON. Si es válido, reemplazará todos los registros actuales.';
    els.btnChooseRecordFile.hidden = mode !== 'record';
    els.importText.value = text;
    els.importError.textContent = '';
    els.importModal.returnValue = '';
    els.importModal.showModal();
  };

  els.btnExport.addEventListener('click', () => {
    downloadJson(exportData(state.records), `flora-metas-${new Date().toISOString().slice(0, 10)}.json`);
  });

  els.btnExportRecord.addEventListener('click', () => {
    const record = getSelectedRecord();
    if (!record) return;
    const name = record.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'registro';
    downloadJson(exportRecord(record), `${record.type}-${name}.json`);
  });

  els.btnImportRecord.addEventListener('click', () => openImportModal('record'));
  els.btnImportRecordList.addEventListener('click', () => openImportModal('record'));
  els.btnChooseRecordFile.addEventListener('click', () => els.importRecordFile.click());
  els.importRecordFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    els.importText.value = await file.text();
    els.importError.textContent = '';
    event.target.value = '';
  });

  els.btnImport.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    openImportModal('all', text);
    e.target.value = '';
  });

  els.importModal.addEventListener('close', () => {
    if (els.importModal.returnValue !== 'import') return;
    if (importMode === 'record') {
      const imported = importRecord(els.importText.value, state.records);
      if (!imported) {
        els.importError.textContent = 'El registro no es válido; no se cambiaron los datos.';
        els.importModal.showModal();
        return;
      }
      state.records = imported.records;
      setView(imported.record.type);
      state.selectedId = imported.record.id;
      save();
      return;
    }
    const next = importData(els.importText.value, state.records);
    if (next === state.records) {
      els.importError.textContent = 'El JSON no es válido; no se cambiaron los datos.';
      els.importModal.showModal();
      return;
    }
    state.records = next;
    state.selectedId = null;
    cancelPolygonEdit({ silent: true });
    save();
    els.importError.textContent = '';
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
