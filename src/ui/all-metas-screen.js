// web/src/ui/all-metas-screen.js
import { allTrackedMetas, filterByStatus, filterByText, filterByRegion, countsByStatus } from '../state.js';
import { setMetaStatus, clearMetaStatus } from '../storage.js';
import { t } from '../i18n.js';
import {
  renderFilterTabs,
  renderStatusControl,
  renderStatusDot,
  renderSearchInput,
  renderRegionTabs
} from './status-labels.js';

// Persists across re-renders (app.js rebuilds this screen from scratch on
// every status change), so picking a status doesn't yank the visitor back
// to "All" / clear their search or region.
let listState = { activeFilter: 'all', searchQuery: '', region: 'all' };

export function renderAllMetasScreen(catalog, progress, onChange) {
  const container = document.createElement('div');
  container.className = 'all-metas-screen';

  const title = document.createElement('h2');
  title.textContent = t(progress.language, 'allMetas');
  container.appendChild(title);

  const regionSlot = document.createElement('div');
  container.appendChild(regionSlot);

  const regionNote = document.createElement('p');
  regionNote.className = 'region-estimate-note';
  regionNote.textContent = t(progress.language, 'metaRegionEstimateNote');
  container.appendChild(regionNote);

  const toolbar = document.createElement('div');
  toolbar.className = 'list-toolbar';
  container.appendChild(toolbar);

  const filterSlot = document.createElement('div');
  toolbar.appendChild(filterSlot);
  toolbar.appendChild(
    renderSearchInput(progress.language, listState.searchQuery, (value) => {
      listState.searchQuery = value;
      renderRows();
    })
  );

  const table = document.createElement('table');
  table.className = 'meta-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const key of ['metaColumn', 'foundInMaps', 'statusColumn', 'lastUpdatedColumn']) {
    const th = document.createElement('th');
    th.textContent = t(progress.language, key);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  container.appendChild(table);

  function renderFilter(metas) {
    filterSlot.textContent = '';
    filterSlot.appendChild(
      renderFilterTabs(
        listState.activeFilter,
        progress.language,
        (value) => {
          listState.activeFilter = value;
          renderRows();
        },
        countsByStatus(metas)
      )
    );
  }

  function renderRegionFilter() {
    regionSlot.textContent = '';
    regionSlot.appendChild(
      renderRegionTabs(listState.region, progress.language, (region) => {
        listState.region = region;
        renderRows();
      })
    );
  }

  function renderRows() {
    renderRegionFilter();
    const inRegion = filterByRegion(allTrackedMetas(catalog, progress), listState.region);
    renderFilter(inRegion);

    const visible = filterByText(filterByStatus(inRegion, listState.activeFilter), listState.searchQuery);
    tbody.textContent = '';
    for (const meta of visible) {
      tbody.appendChild(renderMetaRow(meta));
    }
  }

  function renderMetaRow(meta) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameGroup = document.createElement('span');
    nameGroup.className = 'meta-row-name-group';
    nameGroup.appendChild(renderStatusDot(meta.status));
    const nameText = document.createElement('span');
    nameText.textContent = meta.name;
    nameGroup.appendChild(nameText);
    nameCell.appendChild(nameGroup);
    row.appendChild(nameCell);

    const mapsCell = document.createElement('td');
    const chipGroup = document.createElement('span');
    chipGroup.className = 'map-chip-cell';
    for (const mapName of meta.mapNames) {
      const chip = document.createElement('span');
      chip.className = 'map-chip';
      chip.textContent = mapName;
      chipGroup.appendChild(chip);
    }
    mapsCell.appendChild(chipGroup);
    row.appendChild(mapsCell);

    const statusCell = document.createElement('td');
    statusCell.appendChild(
      renderStatusControl(meta.status, progress.language, (value) => {
        if (value === 'new') {
          Object.assign(progress, clearMetaStatus(progress, meta.id));
        } else {
          Object.assign(progress, setMetaStatus(progress, meta.id, value));
        }
        onChange();
      })
    );
    row.appendChild(statusCell);

    const updatedCell = document.createElement('td');
    updatedCell.className = 'updated-cell';
    updatedCell.textContent = meta.updatedAt
      ? new Date(meta.updatedAt).toLocaleDateString(progress.language)
      : t(progress.language, 'notYetUpdated');
    row.appendChild(updatedCell);

    return row;
  }

  renderRows();
  return container;
}
