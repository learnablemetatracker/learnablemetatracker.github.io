import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLanguage, t } from './i18n.js';

test('resolveLanguage keeps a valid saved language regardless of browser language', () => {
  assert.equal(resolveLanguage('es', 'en-US'), 'es');
  assert.equal(resolveLanguage('en', 'es-ES'), 'en');
});

test('resolveLanguage falls back to the browser language when nothing is saved', () => {
  assert.equal(resolveLanguage(null, 'es-ES'), 'es');
  assert.equal(resolveLanguage(null, 'es'), 'es');
});

test('resolveLanguage defaults to English for anything not Spanish or unset', () => {
  assert.equal(resolveLanguage(null, 'fr-FR'), 'en');
  assert.equal(resolveLanguage(null, undefined), 'en');
  assert.equal(resolveLanguage('fr', 'fr-FR'), 'en');
});

test('t returns the label for a known key in each language', () => {
  assert.equal(t('en', 'statusMastered'), 'Mastered');
  assert.equal(t('es', 'statusMastered'), 'Dominado');
});

test('t falls back to English then to the raw key for unknown languages/keys', () => {
  assert.equal(t('fr', 'statusMastered'), 'Mastered');
  assert.equal(t('en', 'notARealKey'), 'notARealKey');
});

test('t returns the map-not-found label in each language', () => {
  assert.equal(t('en', 'mapNotFound'), 'Map not found.');
  assert.equal(t('es', 'mapNotFound'), 'Mapa no encontrado.');
});

test('t returns the catalog-load-failed label in each language', () => {
  assert.equal(t('en', 'catalogLoadFailed'), 'Failed to load catalog.');
  assert.equal(t('es', 'catalogLoadFailed'), 'No se pudo cargar el catálogo.');
});

test('t returns the dashboard/table labels added for the redesign in each language', () => {
  assert.equal(t('en', 'statTotalMetas'), 'Metas tracked');
  assert.equal(t('es', 'statTotalMetas'), 'Metas seguidas');
  assert.equal(t('en', 'notYetUpdated'), 'Not yet');
  assert.equal(t('es', 'notYetUpdated'), 'Sin marcar');
});

test('t returns the search/author/location labels added in the polish pass', () => {
  assert.equal(t('en', 'searchPlaceholder'), 'Search metas…');
  assert.equal(t('es', 'searchPlaceholder'), 'Buscar metas…');
  assert.equal(t('en', 'byAuthor'), 'by');
  assert.equal(t('es', 'byAuthor'), 'por');
  assert.equal(t('en', 'locationsLabel'), 'locations');
  assert.equal(t('es', 'locationsLabel'), 'ubicaciones');
});

test('t returns the remove-map/browse-catalog labels added for the browsable catalog', () => {
  assert.equal(t('en', 'removeMap'), 'Remove');
  assert.equal(t('es', 'removeMap'), 'Quitar');
  assert.equal(t('en', 'searchMapsPlaceholder'), 'Search maps…');
  assert.equal(t('es', 'searchMapsPlaceholder'), 'Buscar mapas…');
});

test('t returns the help-screen and external-link labels in each language', () => {
  assert.equal(t('en', 'help'), 'Help');
  assert.equal(t('es', 'help'), 'Ayuda');
  assert.equal(t('en', 'helpTitle'), 'How this works');
  assert.equal(t('es', 'helpTitle'), 'Cómo funciona');
  assert.equal(t('en', 'quizLink'), 'Super Duper');
  assert.equal(t('es', 'quizLink'), 'Super Duper');
  assert.equal(t('en', 'mapMakingManualLink'), 'Map Making Manual');
  assert.equal(t('es', 'mapMakingManualLink'), 'Map Making Manual');
});

test('t returns the LearnableMeta credit link and region filter labels in each language', () => {
  assert.equal(t('en', 'learnableMetaLink'), 'Browse maps on LearnableMeta');
  assert.equal(t('es', 'learnableMetaLink'), 'Ver mapas en LearnableMeta');
  assert.equal(t('en', 'regionSouthAmerica'), 'South America');
  assert.equal(t('es', 'regionSouthAmerica'), 'Sudamérica');
  assert.equal(t('en', 'regionAll'), 'All');
  assert.equal(t('es', 'regionAll'), 'Todas');
});

test('t returns the mastered-by-region/difficulty labels in each language', () => {
  assert.equal(t('en', 'masteredByRegionHeading'), 'Mastered by region');
  assert.equal(t('es', 'masteredByRegionHeading'), 'Dominados por región');
  assert.equal(t('en', 'masteredByDifficultyHeading'), 'Mastered by difficulty (estimated)');
  assert.equal(t('es', 'masteredByDifficultyHeading'), 'Dominados por dificultad (estimado)');
  assert.equal(t('en', 'difficultyUnclassified'), 'Unclassified');
  assert.equal(t('es', 'difficultyUnclassified'), 'Sin clasificar');
});

test('t returns the meta-region-is-estimated note in each language', () => {
  assert.equal(
    t('en', 'metaRegionEstimateNote'),
    "Region is estimated from each meta's own name, since a map's region can mix several continents."
  );
  assert.equal(
    t('es', 'metaRegionEstimateNote'),
    'La región es una estimación según el nombre de cada meta, ya que un mapa puede mezclar varios continentes.'
  );
});
