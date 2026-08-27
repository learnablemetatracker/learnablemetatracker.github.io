// web/src/ui/status-labels.js
import { t } from '../i18n.js';
import { REGIONS } from '../state.js';

export const FILTER_VALUES = ['all', 'new', 'learning', 'reviewing', 'mastered'];
export const ASSIGNABLE_STATUSES = ['learning', 'reviewing', 'mastered'];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function statusLabel(language, value) {
  return value === 'all' ? t(language, 'filterAll') : t(language, `status${capitalize(value)}`);
}

// A small colored dot reflecting a meta's current status at a glance —
// used next to the meta name, independent of the pill control itself.
export function renderStatusDot(status) {
  const dot = document.createElement('span');
  dot.className = `status-dot status-dot--${status}`;
  dot.setAttribute('aria-hidden', 'true');
  return dot;
}

// Renders a row of pill buttons (New / Learning / Reviewing / Mastered), one
// of which carries `.is-active`. Clicking a non-active pill calls onSelect
// with that status value ('new' included, callers decide what that means).
export function renderStatusControl(currentStatus, language, onSelect) {
  const group = document.createElement('div');
  group.className = 'status-control';
  group.setAttribute('role', 'group');

  for (const value of ['new', ...ASSIGNABLE_STATUSES]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `status-pill status-pill--${value}`;
    button.textContent = statusLabel(language, value);
    button.setAttribute('aria-pressed', String(value === currentStatus));
    if (value === currentStatus) button.classList.add('is-active');
    button.addEventListener('click', () => onSelect(value));
    group.appendChild(button);
  }

  return group;
}

// Renders the "All / New / Learning / Reviewing / Mastered" filter tabs used
// atop both meta-listing screens. Re-invokes onSelect(value) on click; the
// caller owns the active-filter state and re-renders. `counts` (from
// state.js's countsByStatus) is optional — when given, each tab shows its
// count so the visitor can see e.g. "Mastered (12)" without counting rows.
export function renderFilterTabs(activeFilter, language, onSelect, counts = null) {
  const tabs = document.createElement('div');
  tabs.className = 'filter-tabs';
  tabs.setAttribute('role', 'tablist');

  for (const value of FILTER_VALUES) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'filter-tab';
    tab.textContent = counts ? `${statusLabel(language, value)} (${counts[value] ?? 0})` : statusLabel(language, value);
    tab.setAttribute('aria-selected', String(value === activeFilter));
    if (value === activeFilter) tab.classList.add('is-active');
    tab.addEventListener('click', () => onSelect(value));
    tabs.appendChild(tab);
  }

  return tabs;
}

const REGION_I18N_KEYS = {
  World: 'regionWorld',
  Europe: 'regionEurope',
  Asia: 'regionAsia',
  Africa: 'regionAfrica',
  'North America': 'regionNorthAmerica',
  'South America': 'regionSouthAmerica',
  Oceania: 'regionOceania'
};

export function regionLabel(language, region) {
  return region === 'all' ? t(language, 'regionAll') : t(language, REGION_I18N_KEYS[region] ?? region);
}

// Optional continent filter for the browse-catalog list — "All" (no
// filtering) is the default so nobody has to touch this to add a map.
export function renderRegionTabs(activeRegion, language, onSelect) {
  const tabs = document.createElement('div');
  tabs.className = 'filter-tabs region-tabs';
  tabs.setAttribute('role', 'tablist');

  for (const region of ['all', ...REGIONS]) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'filter-tab';
    tab.textContent = regionLabel(language, region);
    tab.setAttribute('aria-selected', String(region === activeRegion));
    if (region === activeRegion) tab.classList.add('is-active');
    tab.addEventListener('click', () => onSelect(region));
    tabs.appendChild(tab);
  }

  return tabs;
}

// A debounce-free search input; calls onInput(value) on every keystroke and
// lets the caller decide how to filter/re-render. `placeholderKey` lets
// different screens use a placeholder matching what's actually being
// searched (metas vs. maps).
export function renderSearchInput(language, currentValue, onInput, placeholderKey = 'searchPlaceholder') {
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-input';
  input.placeholder = t(language, placeholderKey);
  input.value = currentValue;
  input.addEventListener('input', () => onInput(input.value));
  return input;
}
