import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  linkPersonalMap,
  discardUnverifiedSyncHistory,
  unlinkPersonalMap,
  setPersonalMapAutoSync,
  startPersonalMapSync,
  startPersonalMapReadd, confirmPersonalMapRestored,
  selectReaddBatch,
  finishPersonalMapSync, setPersonalMapSyncError,
  failPersonalMapSync
} from './personal-map-sync.js';
import { setMetaStatus, clearMetaStatus } from './storage.js';

const progress = () => ({ language: 'es', currentMapId: null, addedMaps: {}, metaStatus: {} });

test('linking a personal map queues already mastered metas by ID', () => {
  let state = setMetaStatus(progress(), '159', 'mastered');
  state = setMetaStatus(state, '137', 'learning');
  const linked = linkPersonalMap(state, 'https://learnablemeta.com/personal/42');
  assert.equal(linked.personalMap.id, 42);
  assert.deepEqual(linked.personalMap.pendingMetaIds, ['159']);
  assert.equal(linked.personalMap.historyVerified, true);
  assert.throws(() => linkPersonalMap(state, 'https://other.example/personal/42'), /LearnableMeta/);
});

test('old unverified removal history is discarded without changing statuses or pending removals', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '137', 'mastered'), '42');
  state.personalMap.historyVerified = undefined;
  state.personalMap.removedMetaIds = ['159'];
  state.personalMap.readdMetaIds = ['159'];
  const upgraded = discardUnverifiedSyncHistory(state);
  assert.deepEqual(upgraded.personalMap.removedMetaIds, []);
  assert.deepEqual(upgraded.personalMap.readdMetaIds, []);
  assert.deepEqual(upgraded.personalMap.pendingMetaIds, ['137']);
  assert.equal(upgraded.personalMap.historyVerified, true);
  assert.equal(upgraded.personalMap.historyResetNotice, true);
  assert.equal(discardUnverifiedSyncHistory(upgraded), upgraded);
});

test('unlinking forgets only the personal map and keeps the visitor progress', () => {
  const state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  const unlinked = unlinkPersonalMap(state);
  assert.equal(Object.hasOwn(unlinked, 'personalMap'), false);
  assert.equal(unlinked.metaStatus['159'].status, 'mastered');
});

test('automatic sync is a per-visitor opt-in setting', () => {
  const state = linkPersonalMap(progress(), '42');
  assert.equal(state.personalMap.autoSync, false);
  assert.equal(setPersonalMapAutoSync(state, true).personalMap.autoSync, true);
  assert.equal(setPersonalMapAutoSync(state, false).personalMap.autoSync, false);
});

test('mastering a meta queues it once and changing it back cancels a pending removal', () => {
  let state = linkPersonalMap(progress(), '42');
  state = setMetaStatus(state, '159', 'mastered');
  state = setMetaStatus(state, '159', 'mastered');
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
  state = clearMetaStatus(state, '159');
  assert.deepEqual(state.personalMap.pendingMetaIds, []);
});

test('only the matching successful request clears pending removals and asks for GeoGuessr upload', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = startPersonalMapSync(state, 'request-1');
  assert.equal(state.personalMap.inFlight.requestId, 'request-1');
  assert.deepEqual(finishPersonalMapSync(state, 'wrong-request').personalMap.pendingMetaIds, ['159']);
  state = finishPersonalMapSync(state, 'request-1', { removedMetaIds: ['159'] });
  assert.deepEqual(state.personalMap.pendingMetaIds, []);
  assert.equal(state.personalMap.needsUpload, true);
});

test('an absent meta is cleared from the removal queue but never becomes eligible for re-adding', () => {
  let state = linkPersonalMap(progress(), '42');
  state = setMetaStatus(state, '159', 'mastered');
  state = setMetaStatus(state, '137', 'mastered');
  state = startPersonalMapSync(state, 'remove');
  state = finishPersonalMapSync(state, 'remove', { removedMetaIds: ['159'] });
  assert.deepEqual(state.personalMap.pendingMetaIds, []);
  assert.deepEqual(state.personalMap.removedMetaIds, ['159']);
  assert.equal(state.personalMap.skippedCount, 1);
  state = clearMetaStatus(state, '137');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  state = clearMetaStatus(state, '159');
  assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
});

test('an absent-only removal does not request a GeoGuessr upload or later restoration', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '999', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: [] });
  assert.equal(state.personalMap.needsUpload, false);
  assert.deepEqual(state.personalMap.removedMetaIds, []);
  state = setMetaStatus(state, '999', 'learning');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
});

test('a failed request leaves mastered metas queued for retry', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = startPersonalMapSync(state, 'request-1');
  state = failPersonalMapSync(state, 'request-1', 'Session expired');
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
  assert.equal(state.personalMap.inFlight, null);
  assert.equal(state.personalMap.error, 'Session expired');
});

test('changing a previously removed meta back to learning flags it for re-adding', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'request-1'), 'request-1', { removedMetaIds: ['159'] });
  state = setMetaStatus(state, '159', 'learning');
  assert.deepEqual(state.personalMap.pendingMetaIds, []);
  assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
  state = setMetaStatus(state, '159', 'mastered');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
});

test('every non-mastered status queues only metas previously removed by this tracker', () => {
  for (const status of ['learning', 'reviewing', 'new']) {
    let state = linkPersonalMap(progress(), '42');
    state = setMetaStatus(state, '159', 'mastered');
    state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: ['159'] });
    state = status === 'new' ? clearMetaStatus(state, '159') : setMetaStatus(state, '159', status);
    assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
    state = setMetaStatus(state, '137', status === 'new' ? 'learning' : status);
    assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
  }
});

test('a successful re-add clears its queue and records that GeoGuessr needs another upload', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: ['159'] });
  state = setMetaStatus(state, '159', 'reviewing');
  state = startPersonalMapReadd(state, 'add', ['159']);
  assert.equal(state.personalMap.inFlight.operation, 'add');
  state = finishPersonalMapSync(state, 'add');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  assert.deepEqual(state.personalMap.removedMetaIds, []);
  assert.equal(state.personalMap.needsUpload, true);
});

test('a failed re-add stays queued and a return to Mastered requests removal again', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: ['159'] });
  state = setMetaStatus(state, '159', 'learning');
  state = failPersonalMapSync(startPersonalMapReadd(state, 'add', ['159']), 'add', 'Session expired');
  assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
  assert.equal(state.personalMap.error, 'Session expired');
  state = setMetaStatus(state, '159', 'mastered');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
});

test('confirming a manual restoration clears only queued re-adds and preserves other removed metas', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: ['159'] });
  state = setMetaStatus(state, '159', 'reviewing');
  state = setMetaStatus(state, '137', 'mastered');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove-2'), 'remove-2', { removedMetaIds: ['137'] });
  state = confirmPersonalMapRestored(state);
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  assert.deepEqual(state.personalMap.removedMetaIds, ['137']);
  assert.equal(state.metaStatus['159'].status, 'reviewing');
  assert.equal(state.personalMap.needsUpload, true);
  state = setMetaStatus(state, '159', 'learning');
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  state = setMetaStatus(state, '137', 'learning');
  assert.deepEqual(state.personalMap.readdMetaIds, ['137']);
});

test('a queued re-add changed back to Mastered becomes a pending removal, leaving other removed metas tracked', () => {
  let state = linkPersonalMap(progress(), '42');
  state = setMetaStatus(state, '159', 'mastered');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove-1'), 'remove-1', { removedMetaIds: ['159'] });
  state = clearMetaStatus(state, '159');
  state = setMetaStatus(state, '137', 'mastered');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove-2'), 'remove-2', { removedMetaIds: ['137'] });
  assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
  state = setMetaStatus(state, '159', 'mastered');
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
  assert.deepEqual(state.personalMap.readdMetaIds, []);
  assert.deepEqual(state.personalMap.removedMetaIds, ['159', '137']);
});

test('manual restoration does not interrupt a request already in flight', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = startPersonalMapSync(state, 'remove');
  assert.equal(confirmPersonalMapRestored(state), state);
});

test('an obsolete bridge upgrade error can be cleared after installing the new bridge', () => {
  let state = linkPersonalMap(progress(), '42');
  state = setPersonalMapSyncError(state, 'Upgrade bridge');
  state = setPersonalMapSyncError(state, null);
  assert.equal(state.personalMap.error, null);
});

test('marking Mastered while a re-add is in flight queues removal after the re-add succeeds', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = finishPersonalMapSync(startPersonalMapSync(state, 'remove'), 'remove', { removedMetaIds: ['159'] });
  state = startPersonalMapReadd(setMetaStatus(state, '159', 'learning'), 'add', ['159']);
  state = setMetaStatus(state, '159', 'mastered');
  state = finishPersonalMapSync(state, 'add');
  assert.deepEqual(state.personalMap.pendingMetaIds, ['159']);
  assert.deepEqual(state.personalMap.removedMetaIds, []);
});

test('leaving Mastered during removal queues a re-add after the removal succeeds', () => {
  let state = linkPersonalMap(setMetaStatus(progress(), '159', 'mastered'), '42');
  state = startPersonalMapSync(state, 'remove');
  state = setMetaStatus(state, '159', 'reviewing');
  state = finishPersonalMapSync(state, 'remove', { removedMetaIds: ['159'] });
  assert.deepEqual(state.personalMap.readdMetaIds, ['159']);
});

test('re-add requests group only metas found in the same source map', () => {
  const catalog = { maps: [
    { geoguessrId: '67655173ff4ef64687b7ac08', metaIds: ['159', '137'] },
    { geoguessrId: 'aaaaaaaaaaaaaaaaaaaaaaaa', metaIds: ['200'] }
  ] };
  assert.deepEqual(selectReaddBatch(catalog, ['159', '200', '137']), {
    sourceMapId: '67655173ff4ef64687b7ac08', metaIds: ['159', '137']
  });
  assert.equal(selectReaddBatch(catalog, ['999']), null);
});
