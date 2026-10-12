import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../learnablemeta-sync.user.js', import.meta.url), 'utf8');

test('the tracker bridge opens a manual request and closes its tab after confirmed success', () => {
  const values = new Map();
  const opened = [];
  let onResult;
  const browserWindow = new EventTarget();
  runInNewContext(source, {
    location: { hostname: 'learnablemetatracker.github.io', pathname: '/' },
    document: { documentElement: { dataset: {} } },
    window: browserWindow,
    Event,
    CustomEvent,
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: (_key, callback) => { onResult = callback; },
    GM_openInTab: (url, options) => {
      const tab = { url, options, closed: false, close() { this.closed = true; } };
      opened.push(tab);
      return tab;
    },
    console
  });
  browserWindow.dispatchEvent(new CustomEvent('lm-sync-request', {
    detail: JSON.stringify({ requestId: 'r1', personalMapId: 42, metaIds: ['159'] })
  }));
  assert.equal(values.get('lm-tracker:request').requestId, 'r1');
  assert.equal(opened[0].url, 'https://learnablemeta.com/personal/42');
  assert.equal(opened[0].options.active, false);
  onResult('lm-tracker:result', undefined, { requestId: 'r1', status: 'success' });
  assert.equal(opened[0].closed, true);
  browserWindow.dispatchEvent(new Event('lm-sync-clear'));
  assert.equal(values.has('lm-tracker:request'), false);
  assert.equal(values.has('lm-tracker:result'), false);
});

test('a failed manual request leaves its LearnableMeta tab open for inspection', () => {
  const values = new Map();
  let onResult;
  const tab = { closed: false, close() { this.closed = true; } };
  const browserWindow = new EventTarget();
  runInNewContext(source, {
    location: { hostname: 'learnablemetatracker.github.io', pathname: '/' },
    document: { documentElement: { dataset: {} } },
    window: browserWindow, Event, CustomEvent,
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: (_key, callback) => { onResult = callback; },
    GM_openInTab: () => tab
  });
  browserWindow.dispatchEvent(new CustomEvent('lm-sync-request', {
    detail: JSON.stringify({ requestId: 'r1', personalMapId: 42, metaIds: ['159'], autoOpen: false })
  }));
  onResult('lm-tracker:result', undefined, { requestId: 'r1', status: 'error', message: 'Sign in' });
  assert.equal(tab.closed, false);
});

test('automatic request opens the visitor personal map in a background tab', () => {
  const values = new Map();
  const opened = [];
  const browserWindow = new EventTarget();
  runInNewContext(source, {
    location: { hostname: 'learnablemetatracker.github.io', pathname: '/' },
    document: { documentElement: { dataset: {} } },
    window: browserWindow,
    Event,
    CustomEvent,
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: () => {},
    GM_openInTab: (url, options) => { opened.push({ url, options }); return { close() {} }; }
  });
  browserWindow.dispatchEvent(new CustomEvent('lm-sync-request', {
    detail: JSON.stringify({ requestId: 'r1', personalMapId: 42, metaIds: ['159'], autoOpen: true })
  }));
  assert.equal(opened[0].url, 'https://learnablemeta.com/personal/42');
  assert.equal(opened[0].options.active, false);
});

test('automatic re-add opens the source map in a background tab', () => {
  const values = new Map();
  const opened = [];
  const browserWindow = new EventTarget();
  const dataset = {};
  runInNewContext(source, {
    location: { hostname: 'learnablemetatracker.github.io', pathname: '/' },
    document: { documentElement: { dataset } },
    window: browserWindow,
    Event,
    CustomEvent,
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: () => {},
    GM_openInTab: (url, options) => { opened.push({ url, options }); return { close() {} }; }
  });
  assert.equal(dataset.lmSyncBridgeVersion, '5');
  browserWindow.dispatchEvent(new CustomEvent('lm-sync-request-v3', {
    detail: JSON.stringify({
      requestId: 'r2', operation: 'add', personalMapId: 42, metaIds: ['159'],
      sourceMapId: '67655173ff4ef64687b7ac08', autoOpen: true
    })
  }));
  assert.equal(opened[0].url, 'https://learnablemeta.com/maps/67655173ff4ef64687b7ac08');
  assert.equal(opened[0].options.active, false);
});

test('a re-add without a valid source map ID is not queued', () => {
  const values = new Map();
  const browserWindow = new EventTarget();
  runInNewContext(source, {
    location: { hostname: 'learnablemetatracker.github.io', pathname: '/' },
    document: { documentElement: { dataset: {} } },
    window: browserWindow,
    Event,
    CustomEvent,
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: () => {},
    GM_openInTab: () => { throw new Error('Should not open a tab'); }
  });
  browserWindow.dispatchEvent(new CustomEvent('lm-sync-request-v3', {
    detail: JSON.stringify({
      requestId: 'r2', operation: 'add', personalMapId: 42,
      metaIds: ['159'], sourceMapId: '../personal/42', autoOpen: true
    })
  }));
  assert.equal(values.has('lm-tracker:request'), false);
});

function personalPageData(metaIds) {
  if (metaIds === null) return { type: 'data', nodes: [] };
  const data = [{ id: 1, metaList: 2 }, 42, []];
  for (const id of metaIds) {
    const rowIndex = data.length;
    data[2].push(rowIndex);
    data.push({ metaId: rowIndex + 1 }, Number(id));
  }
  return { type: 'data', nodes: [null, { type: 'data', data }] };
}

function runOnPersonalMap(request, response, pathname = '/personal/42', personalMetaIds = ['159', '137']) {
  const values = new Map([['lm-tracker:request', request]]);
  const calls = [];
  const reads = [];
  const reloads = [];
  const context = {
    location: { hostname: 'learnablemeta.com', pathname, reload: () => reloads.push('reload') },
    GM_getValue: (key) => values.get(key),
    GM_setValue: (key, value) => values.set(key, value),
    GM_deleteValue: (key) => values.delete(key),
    GM_addValueChangeListener: () => {},
    fetch: async (url, options) => {
      if (options?.method !== 'POST') {
        reads.push(url);
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => personalPageData(personalMetaIds)
        };
      }
      calls.push({ url, options });
      return typeof response === 'function' ? response(values) : response;
    },
    FormData,
    URLSearchParams,
    console
  };
  runInNewContext(source, context);
  return { values, calls, reads, reloads };
}

test('a queued request removes its IDs and reports success without reloading the temporary tab', async () => {
  const request = { requestId: 'r1', personalMapId: 42, metaIds: ['159', '137'] };
  const { values, calls, reads, reloads } = runOnPersonalMap(request, {
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ type: 'success', status: 200, data: '{"success":true}' })
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 1);
  assert.deepEqual(reads, ['/personal/42/__data.json']);
  assert.equal(calls[0].url, '/personal/42?/removeMetasFromPersonalMap');
  assert.deepEqual(calls[0].options.body.getAll('id'), ['159', '137']);
  assert.equal(values.get('lm-tracker:result').status, 'success');
  assert.deepEqual(values.get('lm-tracker:result').removedMetaIds, ['159', '137']);
  assert.equal(values.has('lm-tracker:request'), false);
  assert.equal(reloads.length, 0);
});

test('a meta absent from the personal map is not sent for removal or reported as removed', async () => {
  const { values, calls, reads } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['999'] },
    { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'success' }) }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(reads, ['/personal/42/__data.json']);
  assert.equal(calls.length, 0);
  assert.equal(values.get('lm-tracker:result').status, 'success');
  assert.deepEqual(Array.from(values.get('lm-tracker:result').removedMetaIds), []);
});

test('a mixed batch removes only metas present in the personal map', async () => {
  const { values, calls } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['159', '999'] },
    { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'success' }) }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls[0].options.body.getAll('id'), ['159']);
  assert.deepEqual(values.get('lm-tracker:result').removedMetaIds, ['159']);
});

test('unreadable personal-map data stops removal without recording false history', async () => {
  const { values, calls } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['159'] },
    { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'success' }) },
    '/personal/42', null
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 0);
  assert.equal(values.get('lm-tracker:result').status, 'error');
});

test('automatic sync reports success without reloading its background tab', async () => {
  const { values, reloads } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['159'], autoOpen: true },
    { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'success' }) }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(values.get('lm-tracker:result').status, 'success');
  assert.equal(reloads.length, 0);
});

test('an HTML response does not falsely report that the meta was removed', async () => {
  const { values, reloads } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['159'] },
    { ok: true, headers: { get: () => 'text/html' } }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(values.get('lm-tracker:result').status, 'error');
  assert.equal(values.has('lm-tracker:request'), false);
  assert.equal(reloads.length, 0);
});

test('finishing one request does not erase a newer queued request', async () => {
  const nextRequest = { requestId: 'r2', personalMapId: 42, metaIds: ['137'] };
  const { values } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 42, metaIds: ['159'] },
    (storage) => {
      storage.set('lm-tracker:request', nextRequest);
      return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'success' }) };
    }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(values.get('lm-tracker:request').requestId, 'r2');
  assert.equal(values.get('lm-tracker:result').requestId, 'r1');
});

test('a request for another personal map is not sent', async () => {
  const { values, calls } = runOnPersonalMap(
    { requestId: 'r1', personalMapId: 99, metaIds: ['159'] },
    { ok: true, headers: { get: () => 'application/json' } }
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 0);
  assert.equal(values.has('lm-tracker:result'), false);
});

test('a queued re-add posts its meta IDs and destination personal map to the source map action', async () => {
  const request = {
    requestId: 'r2', operation: 'add', personalMapId: 42, metaIds: ['159', '137'],
    sourceMapId: '67655173ff4ef64687b7ac08', autoOpen: true
  };
  const { values, calls, reloads } = runOnPersonalMap(request, {
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ type: 'success', status: 200, data: '{"success":true,"inserted":2}' })
  }, '/maps/67655173ff4ef64687b7ac08');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/maps/67655173ff4ef64687b7ac08?/addMetasToPersonalMap');
  assert.deepEqual(calls[0].options.body.getAll('id'), ['159', '137']);
  assert.equal(calls[0].options.body.get('mapId'), '42');
  assert.equal(values.get('lm-tracker:result').status, 'success');
  assert.equal(values.has('lm-tracker:request'), false);
  assert.equal(reloads.length, 0);
});

test('a re-add request is ignored on a different source map', async () => {
  const { values, calls } = runOnPersonalMap({
    requestId: 'r2', operation: 'add', personalMapId: 42, metaIds: ['159'],
    sourceMapId: '67655173ff4ef64687b7ac08'
  }, { ok: true }, '/maps/aaaaaaaaaaaaaaaaaaaaaaaa');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 0);
  assert.equal(values.has('lm-tracker:result'), false);
});

test('a failed re-add does not claim success or reload the source map', async () => {
  const request = {
    requestId: 'r2', operation: 'add', personalMapId: 42, metaIds: ['159'],
    sourceMapId: '67655173ff4ef64687b7ac08'
  };
  const { values, reloads } = runOnPersonalMap(
    request,
    { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ type: 'failure', data: { message: 'Not shared' } }) },
    '/maps/67655173ff4ef64687b7ac08'
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(values.get('lm-tracker:result').status, 'error');
  assert.match(values.get('lm-tracker:result').message, /Not shared/);
  assert.equal(reloads.length, 0);
});
