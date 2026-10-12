// ==UserScript==
// @name         LearnableMeta Tracker sync
// @namespace    https://learnablemetatracker.github.io/
// @version      0.6.0
// @description  Sync mastered metas with your LearnableMeta personal map.
// @homepageURL  https://learnablemetatracker.github.io/
// @updateURL    https://learnablemetatracker.github.io/learnablemeta-sync.user.js
// @downloadURL  https://learnablemetatracker.github.io/learnablemeta-sync.user.js
// @match        https://learnablemetatracker.github.io/*
// @match        https://learnablemeta.com/personal/*
// @match        https://learnablemeta.com/maps/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const REQUEST_KEY = 'lm-tracker:request';
  const RESULT_KEY = 'lm-tracker:result';

  if (location.hostname === 'learnablemetatracker.github.io') {
    let syncTab = null;
    let syncTabRequestId = null;
    document.documentElement.dataset.lmSyncBridgeVersion = '5';
    document.documentElement.dataset.lmSyncBridge = 'ready';
    window.dispatchEvent(new Event('lm-sync-bridge-ready'));
    const receiveRequest = (event) => {
      let request;
      try {
        request = JSON.parse(event.detail);
        if (!validRequest(request)) throw new Error('Invalid sync request');
        GM_setValue(REQUEST_KEY, request);
        if (syncTab && !syncTab.closed) syncTab.close();
        syncTabRequestId = request.requestId;
        const url = request.operation === 'add'
          ? `https://learnablemeta.com/maps/${request.sourceMapId}`
          : `https://learnablemeta.com/personal/${request.personalMapId}`;
        syncTab = GM_openInTab(url, { active: false });
      } catch (error) {
        GM_deleteValue(REQUEST_KEY);
        window.dispatchEvent(new CustomEvent('lm-sync-result', {
          detail: JSON.stringify({ requestId: request?.requestId, status: 'error', message: String(error.message || error) })
        }));
      }
    };
    window.addEventListener('lm-sync-request', receiveRequest);
    window.addEventListener('lm-sync-request-v3', receiveRequest);
    const deliverResult = (value) => {
      if (value?.status === 'success' && value.requestId === syncTabRequestId && syncTab) {
        try { if (!syncTab.closed) syncTab.close(); } catch { /* Still report the sync result. */ }
        syncTab = null;
        syncTabRequestId = null;
      }
      if (value) window.dispatchEvent(new CustomEvent('lm-sync-result', { detail: JSON.stringify(value) }));
    };
    GM_addValueChangeListener(RESULT_KEY, (_key, _oldValue, newValue) => deliverResult(newValue));
    window.addEventListener('lm-sync-check-result', () => deliverResult(GM_getValue(RESULT_KEY)));
    window.addEventListener('lm-sync-clear', () => {
      if (syncTab && !syncTab.closed) syncTab.close();
      syncTab = null;
      syncTabRequestId = null;
      GM_deleteValue(REQUEST_KEY);
      GM_deleteValue(RESULT_KEY);
    });
    deliverResult(GM_getValue(RESULT_KEY));
    return;
  }

  const personalMapId = Number(location.pathname.match(/^\/personal\/(\d+)\/?$/)?.[1]);
  const sourceMapId = location.pathname.match(/^\/maps\/([a-f\d]{24})\/?$/i)?.[1];
  if ((!Number.isSafeInteger(personalMapId) || personalMapId < 1) && !sourceMapId) return;
  let processing = false;

  async function selectedMetaIds(mapId) {
    const response = await fetch(`/personal/${mapId}/__data.json`, {
      credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' }
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Could not verify the personal map selection. Check your session and retry.');
    }
    const payload = await response.json();
    for (const node of payload.nodes ?? []) {
      const data = node?.data;
      if (!Array.isArray(data) || !data[0] || typeof data[0] !== 'object' ||
          !Object.hasOwn(data[0], 'metaList')) continue;
      const root = data[0];
      if (String(data[root.id]) !== String(mapId)) continue;
      const rows = data[root.metaList];
      if (!Array.isArray(rows)) break;
      const ids = rows.map((reference) => data[data[reference]?.metaId]);
      if (!ids.every((id) => Number.isSafeInteger(id) && id > 0)) break;
      return new Set(ids.map(String));
    }
    throw new Error('Could not read the personal map selection. Nothing was changed.');
  }

  async function processRequest() {
    const request = GM_getValue(REQUEST_KEY);
    if (!validRequest(request) || processing) return;
    const isAdd = request.operation === 'add';
    if (isAdd ? request.sourceMapId !== sourceMapId : request.personalMapId !== personalMapId) return;
    processing = true;
    let outcome;
    try {
      const selected = isAdd ? null : await selectedMetaIds(personalMapId);
      const metaIds = isAdd ? request.metaIds : request.metaIds.filter(
        (id) => selected.has(id)
      );
      if (!isAdd && metaIds.length === 0) {
        outcome = { requestId: request.requestId, status: 'success', removedMetaIds: [] };
      } else {
        const body = new FormData();
        for (const id of metaIds) body.append('id', id);
        if (isAdd) body.append('mapId', String(request.personalMapId));
        const endpoint = isAdd
          ? `/maps/${sourceMapId}?/addMetasToPersonalMap`
          : `/personal/${personalMapId}?/removeMetasFromPersonalMap`;
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { accept: 'application/json', 'x-sveltekit-action': 'true' },
          body
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('LearnableMeta did not confirm the change. Check your session and retry.');
        }
        const result = await response.json();
        if (result.type !== 'success') {
          throw new Error(result.data?.message || 'LearnableMeta could not update the metas.');
        }
        outcome = { requestId: request.requestId, status: 'success', ...(!isAdd && { removedMetaIds: metaIds }) };
      }
    } catch (error) {
      outcome = { requestId: request.requestId, status: 'error', message: String(error.message || error) };
    } finally {
      if (GM_getValue(REQUEST_KEY)?.requestId === request.requestId) GM_deleteValue(REQUEST_KEY);
      processing = false;
    }
    GM_setValue(RESULT_KEY, outcome);
  }

  function validRequest(value) {
    return value && typeof value.requestId === 'string' && value.requestId.length > 0 &&
      Number.isSafeInteger(value.personalMapId) && value.personalMapId > 0 &&
      (value.operation === undefined || value.operation === 'remove' ||
        (value.operation === 'add' && /^[a-f\d]{24}$/i.test(value.sourceMapId))) &&
      Array.isArray(value.metaIds) && value.metaIds.length > 0 &&
      value.metaIds.every((id) => typeof id === 'string' && /^\d+$/.test(id)) &&
      (value.autoOpen === undefined || typeof value.autoOpen === 'boolean');
  }

  void processRequest();
})();
