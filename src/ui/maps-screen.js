// web/src/ui/maps-screen.js
import {
  myMaps,
  summarizeMyMaps,
  summarizeByRegion,
  summarizeByDifficulty,
  availableMapsToAdd,
  isReadyForNextMap,
  filterByText,
  filterByRegion
} from '../state.js';
import { addMap, removeMap } from '../storage.js';
import { t } from '../i18n.js';
import { renderSearchInput, renderRegionTabs, regionLabel } from './status-labels.js';

function difficultyLabel(language, tier) {
  const key = `difficulty${tier.charAt(0).toUpperCase()}${tier.slice(1)}`;
  return t(language, key);
}

// Persists the browse-catalog search text and region filter across
// re-renders (app.js rebuilds this whole screen from scratch on every
// add/remove/set-current click).
let browseSearchQuery = '';
let browseRegion = 'all';

export function renderMapsScreen(catalog, progress, onChange) {
  const container = document.createElement('div');
  container.className = 'maps-screen';

  const myMapsList = myMaps(catalog, progress);
  container.appendChild(renderStatRow(summarizeMyMaps(myMapsList), progress.language));

  if (myMapsList.length > 0) {
    const byRegion = renderBreakdownSection(
      t(progress.language, 'masteredByRegionHeading'),
      summarizeByRegion(myMapsList),
      (region) => regionLabel(progress.language, region)
    );
    if (byRegion) container.appendChild(byRegion);

    const byDifficulty = renderBreakdownSection(
      t(progress.language, 'masteredByDifficultyHeading'),
      summarizeByDifficulty(myMapsList),
      (tier) => difficultyLabel(progress.language, tier)
    );
    if (byDifficulty) container.appendChild(byDifficulty);
  }

  const mine = document.createElement('section');
  mine.className = 'map-grid';
  if (myMapsList.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = t(progress.language, 'noMapsYet');
    mine.appendChild(empty);
  } else {
    for (const map of myMapsList) {
      mine.appendChild(renderMapCard(map, progress, onChange));
    }
  }
  container.appendChild(mine);

  container.appendChild(renderBrowseSection(catalog, progress, onChange));

  return container;
}

function renderStatRow(summary, language) {
  const row = document.createElement('section');
  row.className = 'stat-row';

  row.appendChild(renderStatCard('◈', t(language, 'statTotalMetas'), summary.totalMetas));
  row.appendChild(renderStatCard('✓', t(language, 'statMastered'), summary.totalMastered, 'mastered'));
  row.appendChild(
    renderStatCard('%', t(language, 'statAvgCompletion'), `${Math.round(summary.avgCompletion * 100)}%`)
  );

  return row;
}

function renderStatCard(icon, label, value, tone) {
  const card = document.createElement('div');
  card.className = tone ? `stat-card stat-card--${tone}` : 'stat-card';

  const iconEl = document.createElement('span');
  iconEl.className = 'stat-card-icon';
  iconEl.textContent = icon;
  iconEl.setAttribute('aria-hidden', 'true');
  card.appendChild(iconEl);

  const labelEl = document.createElement('span');
  labelEl.className = 'stat-card-label';
  labelEl.textContent = label;
  card.appendChild(labelEl);

  const valueEl = document.createElement('span');
  valueEl.className = 'stat-card-value';
  valueEl.textContent = String(value);
  card.appendChild(valueEl);

  return card;
}

function renderBreakdownSection(heading, buckets, labelFor) {
  const keys = Object.keys(buckets);
  if (keys.length === 0) return null;

  const section = document.createElement('section');
  section.className = 'breakdown-section';

  const title = document.createElement('h2');
  title.textContent = heading;
  section.appendChild(title);

  const row = document.createElement('div');
  row.className = 'stat-row breakdown-row';
  for (const key of keys) {
    const { total, mastered } = buckets[key];
    const card = document.createElement('div');
    card.className = mastered === total ? 'stat-card stat-card--mastered' : 'stat-card';

    const labelEl = document.createElement('span');
    labelEl.className = 'stat-card-label';
    labelEl.textContent = labelFor(key);
    card.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'stat-card-value';
    valueEl.textContent = `${mastered}/${total}`;
    card.appendChild(valueEl);

    row.appendChild(card);
  }
  section.appendChild(row);

  return section;
}

function renderBrowseSection(catalog, progress, onChange) {
  const section = document.createElement('section');
  section.className = 'add-map';

  const addTitle = document.createElement('h2');
  addTitle.textContent = t(progress.language, 'addMap');
  section.appendChild(addTitle);

  const available = availableMapsToAdd(catalog, progress);
  if (available.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = t(progress.language, 'allMapsAdded');
    section.appendChild(empty);
    return section;
  }

  const regionSlot = document.createElement('div');
  section.appendChild(regionSlot);

  section.appendChild(
    renderSearchInput(
      progress.language,
      browseSearchQuery,
      (value) => {
        browseSearchQuery = value;
        renderList();
      },
      'searchMapsPlaceholder'
    )
  );

  const list = document.createElement('ul');
  list.className = 'browse-map-list';
  section.appendChild(list);

  function renderRegionFilter() {
    regionSlot.textContent = '';
    regionSlot.appendChild(
      renderRegionTabs(browseRegion, progress.language, (region) => {
        browseRegion = region;
        renderRegionFilter();
        renderList();
      })
    );
  }

  function renderList() {
    list.textContent = '';
    const visible = filterByText(filterByRegion(available, browseRegion), browseSearchQuery);

    if (visible.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = t(progress.language, 'noMapsMatchSearch');
      list.appendChild(empty);
      return;
    }

    for (const map of visible) {
      list.appendChild(renderBrowseRow(map));
    }
  }

  function renderBrowseRow(map) {
    const li = document.createElement('li');
    li.className = 'browse-map-row';

    const info = document.createElement('span');
    info.className = 'browse-map-info';
    const name = document.createElement('span');
    name.className = 'browse-map-name';
    name.textContent = map.name;
    info.appendChild(name);
    if (map.authors) {
      const byline = document.createElement('span');
      byline.className = 'browse-map-byline';
      byline.textContent = `${t(progress.language, 'byAuthor')} ${map.authors}`;
      info.appendChild(byline);
    }
    li.appendChild(info);

    const addButton = document.createElement('button');
    addButton.className = 'btn-primary';
    addButton.textContent = t(progress.language, 'addMap');
    addButton.addEventListener('click', () => {
      Object.assign(progress, addMap(progress, map.geoguessrId));
      onChange();
    });
    li.appendChild(addButton);

    return li;
  }

  renderRegionFilter();
  renderList();
  return section;
}

function renderMapCard(map, progress, onChange) {
  const card = document.createElement('article');
  card.className = 'map-card';

  const titleRow = document.createElement('div');
  titleRow.className = 'map-card-title-row';

  const titleLink = document.createElement('a');
  titleLink.className = 'map-card-title';
  titleLink.href = `#/map/${encodeURIComponent(map.geoguessrId)}`;
  titleLink.textContent = map.name;
  titleRow.appendChild(titleLink);

  if (map.isCurrent) {
    const badge = document.createElement('span');
    badge.className = 'badge-current';
    badge.textContent = t(progress.language, 'currentMap');
    titleRow.appendChild(badge);
  }
  card.appendChild(titleRow);

  if (map.authors) {
    const byline = document.createElement('span');
    byline.className = 'map-card-byline';
    byline.textContent = `${t(progress.language, 'byAuthor')} ${map.authors}`;
    card.appendChild(byline);
  }

  const percent = map.total === 0 ? 0 : Math.round((map.mastered / map.total) * 100);
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-track';
  progressBar.title = `${percent}%`;
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressFill.style.width = `${percent}%`;
  progressBar.appendChild(progressFill);
  card.appendChild(progressBar);

  const count = document.createElement('span');
  count.className = 'map-card-count';
  count.textContent = `${map.mastered}/${map.total}`;
  card.appendChild(count);

  const actions = document.createElement('div');
  actions.className = 'map-card-actions';

  if (!map.isCurrent) {
    const setCurrentBtn = document.createElement('button');
    setCurrentBtn.className = 'btn-ghost';
    setCurrentBtn.textContent = t(progress.language, 'setAsCurrent');
    setCurrentBtn.addEventListener('click', () => {
      progress.currentMapId = map.geoguessrId;
      onChange();
    });
    actions.appendChild(setCurrentBtn);
  }

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn-ghost btn-danger';
  removeBtn.textContent = t(progress.language, 'removeMap');
  removeBtn.addEventListener('click', () => {
    Object.assign(progress, removeMap(progress, map.geoguessrId));
    onChange();
  });
  actions.appendChild(removeBtn);

  card.appendChild(actions);

  if (isReadyForNextMap(map)) {
    const banner = document.createElement('p');
    banner.className = 'ready-banner';
    banner.textContent = t(progress.language, 'readyForNextMap');
    card.appendChild(banner);
  }

  return card;
}
