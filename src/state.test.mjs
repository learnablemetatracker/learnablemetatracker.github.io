import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMapProgress,
  myMaps,
  summarizeMyMaps,
  availableMapsToAdd,
  isReadyForNextMap,
  mapMetas,
  allTrackedMetas,
  filterByStatus,
  filterByText,
  countsByStatus,
  filterByRegion,
  inferMetaRegions,
  summarizeByRegion,
  inferDifficulty,
  summarizeByDifficulty
} from './state.js';

const catalog = {
  maps: [
    { geoguessrId: 'map-a', name: 'Map A', description: '', authors: 'trausi', metaIds: ['1', '2'] },
    { geoguessrId: 'map-b', name: 'Map B', description: '', authors: 'trausi', metaIds: ['2', '3'] }
  ],
  metas: {
    '1': { name: 'Meta One', locationCount: 20 },
    '2': { name: 'Meta Two', locationCount: 10 },
    '3': { name: 'Meta Three', locationCount: 5 }
  }
};

function progressWith(overrides) {
  return { language: 'en', currentMapId: null, addedMaps: {}, metaStatus: {}, ...overrides };
}

test('computeMapProgress counts mastered metas and percentage', () => {
  const progress = progressWith({
    addedMaps: { 'map-a': { addedAt: 1 } },
    metaStatus: { '1': { status: 'mastered', updatedAt: 1 } }
  });
  const result = computeMapProgress(catalog.maps[0], progress);
  assert.equal(result.total, 2);
  assert.equal(result.mastered, 1);
  assert.equal(result.percentMastered, 0.5);
  assert.equal(result.isCurrent, false);
  assert.equal(result.authors, 'trausi');
  assert.deepEqual(result.regions, []);
});

test('myMaps only includes maps present in addedMaps', () => {
  const progress = progressWith({ addedMaps: { 'map-a': { addedAt: 1 } } });
  const result = myMaps(catalog, progress);
  assert.equal(result.length, 1);
  assert.equal(result[0].geoguessrId, 'map-a');
});

test('summarizeMyMaps sums metas/mastered and averages completion across followed maps', () => {
  const summary = summarizeMyMaps([
    { total: 10, mastered: 5, percentMastered: 0.5 },
    { total: 20, mastered: 4, percentMastered: 0.2 }
  ]);
  assert.deepEqual(summary, { totalMetas: 30, totalMastered: 9, avgCompletion: 0.35 });
});

test('summarizeMyMaps returns zeros for an empty list without dividing by zero', () => {
  assert.deepEqual(summarizeMyMaps([]), { totalMetas: 0, totalMastered: 0, avgCompletion: 0 });
});

test('availableMapsToAdd excludes already-added maps', () => {
  const progress = progressWith({ addedMaps: { 'map-a': { addedAt: 1 } } });
  const result = availableMapsToAdd(catalog, progress);
  assert.deepEqual(result.map((m) => m.geoguessrId), ['map-b']);
});

test('isReadyForNextMap uses a 0.9 default threshold', () => {
  assert.equal(isReadyForNextMap({ total: 10, mastered: 9, percentMastered: 0.9 }), true);
  assert.equal(isReadyForNextMap({ total: 10, mastered: 8, percentMastered: 0.8 }), false);
  assert.equal(isReadyForNextMap({ total: 0, mastered: 0, percentMastered: 0 }), false);
});

test('mapMetas resolves each meta id to its name and current status', () => {
  const progress = progressWith({ metaStatus: { '1': { status: 'learning', updatedAt: 1 } } });
  const result = mapMetas(catalog.maps[0], catalog, progress);
  assert.deepEqual(result, [
    { id: '1', name: 'Meta One', locationCount: 20, status: 'learning' },
    { id: '2', name: 'Meta Two', locationCount: 10, status: 'new' }
  ]);
});

test('allTrackedMetas deduplicates a meta shared between two added maps and lists both map names', () => {
  const progress = progressWith({
    addedMaps: { 'map-a': { addedAt: 1 }, 'map-b': { addedAt: 2 } }
  });
  const result = allTrackedMetas(catalog, progress);
  const metaTwo = result.find((m) => m.id === '2');
  assert.deepEqual(metaTwo.mapNames.sort(), ['Map A', 'Map B']);
  assert.equal(result.length, 3);
});

test('allTrackedMetas surfaces updatedAt from metaStatus, or null when never touched', () => {
  const progress = progressWith({
    addedMaps: { 'map-a': { addedAt: 1 } },
    metaStatus: { '1': { status: 'learning', updatedAt: 12345 } }
  });
  const result = allTrackedMetas(catalog, progress);
  assert.equal(result.find((m) => m.id === '1').updatedAt, 12345);
  assert.equal(result.find((m) => m.id === '2').updatedAt, null);
});

test('inferMetaRegions matches a plain country name and returns unclassified (empty array) otherwise', () => {
  assert.deepEqual(inferMetaRegions('Australia - Bollard'), ['Oceania']);
  assert.deepEqual(inferMetaRegions('Brazil - Pole'), ['South America']);
  assert.deepEqual(inferMetaRegions('Infrastructure Meta'), []);
});

test('inferMetaRegions returns both continents for a country LearnableMeta itself splits (Russia, Turkey)', () => {
  assert.deepEqual(inferMetaRegions('Russia - Black sock sign post').sort(), ['Asia', 'Europe']);
  assert.deepEqual(inferMetaRegions("Turkey - BabeLincoln's marker").sort(), ['Asia', 'Europe']);
});

test('inferMetaRegions matches a non-country regional keyword (Nordic) and a two-region phrase (Latin America)', () => {
  assert.deepEqual(inferMetaRegions('A Learnable Meta - Nordic Buses'), ['Europe']);
  assert.deepEqual(inferMetaRegions('Latin America - Beginner').sort(), ['North America', 'South America']);
});

test('inferMetaRegions does not let a shorter place name inside a longer one win ("New Jersey" vs "Jersey")', () => {
  assert.deepEqual(inferMetaRegions('New Jersey Highway Sign'), ['North America']);
  assert.deepEqual(inferMetaRegions('Jersey - Red Granite'), ['Europe']);
  assert.deepEqual(inferMetaRegions('United States - New Jersey license plates'), ['North America']);
});

test('inferMetaRegions matches on a real word boundary, not as a substring of an unrelated word', () => {
  assert.deepEqual(inferMetaRegions('Icelandic-style architecture study'), []);
});

test('allTrackedMetas infers each meta\'s region from its own name, not the map\'s region tag', () => {
  // A single "World" map mixes metas from every continent — tagging every
  // meta with the map's own ["World"] region made per-meta filtering
  // useless, so this comes from the meta's name instead.
  const worldCatalog = {
    maps: [{ geoguessrId: 'world-map', name: 'World Map', authors: '', regions: ['World'], metaIds: ['1', '2', '3'] }],
    metas: {
      '1': { name: 'Australia - Bollard', locationCount: 1 },
      '2': { name: 'Brazil - Pole', locationCount: 1 },
      '3': { name: 'Infrastructure Meta', locationCount: 1 }
    }
  };
  const progress = progressWith({ addedMaps: { 'world-map': { addedAt: 1 } } });
  const result = allTrackedMetas(worldCatalog, progress);

  assert.deepEqual(result.find((m) => m.id === '1').regions, ['Oceania']);
  assert.deepEqual(result.find((m) => m.id === '2').regions, ['South America']);
  assert.deepEqual(result.find((m) => m.id === '3').regions, []);
});

test('allTrackedMetas only considers added maps, not the full catalog', () => {
  const progress = progressWith({ addedMaps: { 'map-a': { addedAt: 1 } } });
  const result = allTrackedMetas(catalog, progress);
  assert.deepEqual(result.map((m) => m.id).sort(), ['1', '2']);
});

test('filterByStatus returns everything for "all" and filters otherwise', () => {
  const metas = [{ status: 'new' }, { status: 'mastered' }];
  assert.equal(filterByStatus(metas, 'all').length, 2);
  assert.deepEqual(filterByStatus(metas, 'mastered'), [{ status: 'mastered' }]);
});

test('filterByRegion returns everything for "all"/falsy, and matches maps whose regions array includes it', () => {
  const maps = [
    { geoguessrId: 'europe-map', regions: ['Europe'] },
    { geoguessrId: 'border-map', regions: ['Europe', 'Asia'] },
    { geoguessrId: 'oceania-map', regions: ['Oceania'] }
  ];
  assert.equal(filterByRegion(maps, 'all').length, 3);
  assert.equal(filterByRegion(maps, undefined).length, 3);
  assert.deepEqual(
    filterByRegion(maps, 'Europe').map((m) => m.geoguessrId),
    ['europe-map', 'border-map']
  );
});

test('filterByRegion treats a map with no regions field as matching nothing region-specific', () => {
  const maps = [{ geoguessrId: 'legacy-map' }];
  assert.deepEqual(filterByRegion(maps, 'Europe'), []);
  assert.equal(filterByRegion(maps, 'all').length, 1);
});

test('summarizeByRegion counts fully-mastered maps per region, counting a multi-region map in each, and omits untouched regions', () => {
  const myMapsList = [
    { name: 'Europe map', total: 10, mastered: 10, regions: ['Europe'] }, // mastered
    { name: 'Border map', total: 5, mastered: 3, regions: ['Europe', 'Asia'] }, // not mastered
    { name: 'Oceania map', total: 4, mastered: 4, regions: ['Oceania'] } // mastered
  ];
  const summary = summarizeByRegion(myMapsList);
  assert.deepEqual(summary.Europe, { total: 2, mastered: 1 });
  assert.deepEqual(summary.Asia, { total: 1, mastered: 0 });
  assert.deepEqual(summary.Oceania, { total: 1, mastered: 1 });
  assert.ok(!('Africa' in summary), 'a region with no added maps should be omitted entirely');
});

test('inferDifficulty matches the first keyword found in the map name, case-insensitively, else "unclassified"', () => {
  assert.equal(inferDifficulty('A Learnable Meta World - Basics'), 'basics');
  assert.equal(inferDifficulty('ultimate kazakhstan - rookie explorer'), 'ultimate');
  assert.equal(inferDifficulty('A Learnable Kazakhstan - Advanced'), 'advanced');
  assert.equal(inferDifficulty('A Major Bajor Oman'), 'unclassified');
});

test('summarizeByDifficulty buckets added maps by inferred tier and omits empty tiers', () => {
  const myMapsList = [
    { name: 'World - Basics', total: 10, mastered: 10, regions: [] },
    { name: 'World - Beginner', total: 10, mastered: 2, regions: [] },
    { name: 'Some Random Map Name', total: 5, mastered: 5, regions: [] }
  ];
  const summary = summarizeByDifficulty(myMapsList);
  assert.deepEqual(summary.basics, { total: 1, mastered: 1 });
  assert.deepEqual(summary.beginner, { total: 1, mastered: 0 });
  assert.deepEqual(summary.unclassified, { total: 1, mastered: 1 });
  assert.ok(!('advanced' in summary));
});

test('filterByText matches case-insensitively on name, and returns everything for an empty query', () => {
  const metas = [{ name: 'Australia - Bollard' }, { name: 'Brazil - Pole' }];
  assert.deepEqual(filterByText(metas, 'bollard'), [{ name: 'Australia - Bollard' }]);
  assert.deepEqual(filterByText(metas, ''), metas);
  assert.deepEqual(filterByText(metas, '   '), metas);
  assert.deepEqual(filterByText(metas, undefined), metas);
});

test('countsByStatus tallies each status plus a running "all" total', () => {
  const metas = [{ status: 'new' }, { status: 'new' }, { status: 'mastered' }];
  assert.deepEqual(countsByStatus(metas), { all: 3, new: 2, learning: 0, reviewing: 0, mastered: 1 });
});
