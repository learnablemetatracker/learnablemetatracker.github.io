// web/src/ui/map-detail-screen.js
import { mapMetas, filterByStatus, filterByText, countsByStatus, computeMapProgress } from '../state.js';
import { setMetaStatus, clearMetaStatus } from '../storage.js';
import { t } from '../i18n.js';
import { renderFilterTabs, renderStatusControl, renderStatusDot, renderSearchInput } from './status-labels.js';

// Persists across re-renders (app.js rebuilds this screen from scratch on
// every status change), so picking a status doesn't yank the visitor back
// to "All" / clear their search. Reset only when they navigate to a
// different map, so state never leaks between two different maps.
let listState = { mapId: null, activeFilter: 'all', searchQuery: '' };

export function renderMapDetailScreen(catalog, progress, mapId, onChange) {
  const container = document.createElement('div');
  container.className = 'map-detail-screen';

  const catalogMap = catalog.maps.find((m) => m.geoguessrId === mapId);
  if (!catalogMap) {
    container.textContent = t(progress.language, 'mapNotFound');
    return container;
  }

  if (listState.mapId !== mapId) {
    listState = { mapId, activeFilter: 'all', searchQuery: '' };
  }

  const backLink = document.createElement('a');
  backLink.className = 'back-link';
  backLink.href = '#/';
  backLink.textContent = `← ${t(progress.language, 'myMaps')}`;
  container.appendChild(backLink);

  const title = document.createElement('h2');
  title.textContent = catalogMap.name;
  container.appendChild(title);

  const counter = document.createElement('p');
  counter.className = 'map-progress-counter';
  container.appendChild(counter);

  const toolbar = document.createElement('div');
  toolbar.className = 'list-toolbar';
  container.appendChild(toolbar);

  const filterSlot = document.createElement('div');
  toolbar.appendChild(filterSlot);
  toolbar.appendChild(
    renderSearchInput(progress.language, listState.searchQuery, (value) => {
      listState.searchQuery = value;
      renderList();
    })
  );

  const metasContainer = document.createElement('ul');
  metasContainer.className = 'meta-list';
  container.appendChild(metasContainer);

  function renderFilter(metas) {
    filterSlot.textContent = '';
    filterSlot.appendChild(
      renderFilterTabs(
        listState.activeFilter,
        progress.language,
        (value) => {
          listState.activeFilter = value;
          renderList();
        },
        countsByStatus(metas)
      )
    );
  }

  function renderList() {
    const mapProgress = computeMapProgress(catalogMap, progress);
    counter.textContent = `${mapProgress.mastered}/${mapProgress.total}`;

    const allMetas = mapMetas(catalogMap, catalog, progress);
    renderFilter(allMetas);

    const visible = filterByText(filterByStatus(allMetas, listState.activeFilter), listState.searchQuery);
    metasContainer.textContent = '';
    for (const meta of visible) {
      metasContainer.appendChild(renderMetaRow(meta));
    }
  }

  function renderMetaRow(meta) {
    const li = document.createElement('li');
    li.className = 'meta-row';

    const nameGroup = document.createElement('span');
    nameGroup.className = 'meta-row-name-group';
    nameGroup.appendChild(renderStatusDot(meta.status));

    const name = document.createElement('span');
    name.className = 'meta-row-name';
    name.textContent = meta.name;
    nameGroup.appendChild(name);

    if (typeof meta.locationCount === 'number') {
      const count = document.createElement('span');
      count.className = 'meta-row-location-count';
      count.textContent = `${meta.locationCount} ${t(progress.language, 'locationsLabel')}`;
      nameGroup.appendChild(count);
    }

    li.appendChild(nameGroup);

    li.appendChild(
      renderStatusControl(meta.status, progress.language, (value) => {
        if (value === 'new') {
          Object.assign(progress, clearMetaStatus(progress, meta.id));
        } else {
          Object.assign(progress, setMetaStatus(progress, meta.id, value));
        }
        onChange();
      })
    );

    return li;
  }

  renderList();
  return container;
}
