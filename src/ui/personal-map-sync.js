import { t } from '../i18n.js';

export function renderPersonalMapSync(progress, { onLink, onUnlink, onAutoSyncChange, onSync, onReadd, onRestored, onRetry, onUploadDone }) {
  const language = progress.language;
  const sync = progress.personalMap;
  const section = document.createElement('section');
  section.className = 'practice-sync';
  section.setAttribute('aria-labelledby', 'practice-sync-title');

  const header = document.createElement('div');
  header.className = 'practice-sync-header';
  const heading = document.createElement('h2');
  heading.id = 'practice-sync-title';
  heading.textContent = t(language, 'syncTitle');
  header.appendChild(heading);
  const intro = document.createElement('p');
  intro.textContent = t(language, 'syncIntro');
  header.appendChild(intro);
  const privacy = document.createElement('p');
  privacy.className = 'practice-sync-privacy';
  privacy.textContent = t(language, 'syncPrivacy');
  header.appendChild(privacy);
  section.appendChild(header);

  const form = document.createElement('form');
  form.className = 'practice-sync-form';
  const label = document.createElement('label');
  label.htmlFor = 'personal-map-url';
  label.textContent = t(language, 'syncMapUrl');
  form.appendChild(label);
  const controls = document.createElement('div');
  controls.className = 'practice-sync-controls';
  const input = document.createElement('input');
  input.id = 'personal-map-url';
  input.type = 'text';
  input.inputMode = 'url';
  input.placeholder = 'https://learnablemeta.com/personal/123';
  input.value = sync ? `https://learnablemeta.com/personal/${sync.id}` : '';
  input.disabled = Boolean(sync?.inFlight);
  controls.appendChild(input);
  const linkButton = document.createElement('button');
  linkButton.type = 'submit';
  linkButton.className = 'btn-ghost';
  linkButton.textContent = t(language, sync ? 'syncChangeMap' : 'syncLinkMap');
  linkButton.disabled = Boolean(sync?.inFlight);
  controls.appendChild(linkButton);
  form.appendChild(controls);
  const formMessage = document.createElement('p');
  formMessage.className = 'practice-sync-message';
  formMessage.setAttribute('role', 'status');
  form.appendChild(formMessage);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try { onLink(input.value); } catch (error) { formMessage.textContent = error.message; }
  });
  section.appendChild(form);

  if (!sync) return section;

  const status = document.createElement('div');
  status.className = 'practice-sync-status';
  const bridgeReady = document.documentElement.dataset.lmSyncBridge === 'ready';
  const bridgeVersion = Number(document.documentElement.dataset.lmSyncBridgeVersion);
  const bridgeCurrent = bridgeVersion >= 5;
  const autoLabel = document.createElement('label');
  autoLabel.className = 'practice-sync-auto';
  const autoInput = document.createElement('input');
  autoInput.type = 'checkbox';
  autoInput.checked = Boolean(sync.autoSync);
  autoInput.addEventListener('change', () => onAutoSyncChange(autoInput.checked));
  autoLabel.appendChild(autoInput);
  const autoText = document.createElement('span');
  autoText.textContent = t(language, 'syncAuto');
  autoLabel.appendChild(autoText);
  status.appendChild(autoLabel);
  if (bridgeReady && bridgeCurrent) {
    const tabHint = document.createElement('p');
    tabHint.className = 'practice-sync-hint';
    tabHint.textContent = t(language, 'syncTabHint');
    status.appendChild(tabHint);
  }
  const pending = document.createElement('p');
  pending.textContent = `${sync.pendingMetaIds.length} ${t(language, sync.pendingMetaIds.length === 1 ? 'syncPendingOne' : 'syncPending')}`;
  status.appendChild(pending);
  if (sync.skippedCount > 0) {
    const skipped = document.createElement('p');
    skipped.className = 'practice-sync-hint';
    skipped.textContent = `${sync.skippedCount} ${t(language, sync.skippedCount === 1 ? 'syncSkippedOne' : 'syncSkipped')}`;
    status.appendChild(skipped);
  }
  if (sync.historyResetNotice) {
    const reset = document.createElement('p');
    reset.className = 'practice-sync-hint';
    reset.textContent = t(language, 'syncHistoryReset');
    status.appendChild(reset);
  }
  if (sync.needsUpload) {
    const upload = document.createElement('p');
    upload.className = 'practice-sync-next';
    upload.textContent = t(language, 'syncNeedsUpload');
    status.appendChild(upload);
  }
  if (sync.readdMetaIds?.length) {
    const readd = document.createElement('p');
    readd.className = 'practice-sync-next';
    readd.textContent = `${sync.readdMetaIds.length} ${t(language, sync.readdMetaIds.length === 1 ? 'syncReaddOne' : 'syncReadd')}`;
    status.appendChild(readd);
  }
  if (sync.error) {
    const error = document.createElement('p');
    error.className = 'practice-sync-error';
    error.textContent = sync.error;
    status.appendChild(error);
  }
  if (!bridgeReady || !bridgeCurrent) {
    const install = document.createElement('a');
    install.href = 'https://learnablemetatracker.github.io/learnablemeta-sync.user.js';
    install.textContent = t(language, bridgeReady ? 'syncUpgradeBridge' : 'syncInstallBridge');
    status.appendChild(install);
  }

  const actions = document.createElement('div');
  actions.className = 'practice-sync-actions';
  if (sync.inFlight) {
    const waiting = document.createElement('span');
    waiting.textContent = t(language, 'syncWaiting');
    actions.appendChild(waiting);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn-ghost';
    retry.textContent = t(language, 'syncRetry');
    retry.addEventListener('click', onRetry);
    actions.appendChild(retry);
  } else {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-primary';
    button.textContent = t(language, 'syncNow');
    button.disabled = !bridgeReady || !bridgeCurrent || sync.pendingMetaIds.length === 0;
    button.addEventListener('click', onSync);
    actions.appendChild(button);
    if (sync.readdMetaIds?.length) {
      const readdButton = document.createElement('button');
      readdButton.type = 'button';
      readdButton.className = 'btn-ghost';
      readdButton.textContent = t(language, 'syncReaddNow');
      readdButton.disabled = !bridgeReady || !bridgeCurrent;
      readdButton.addEventListener('click', onReadd);
      actions.appendChild(readdButton);
    }
    if (sync.readdMetaIds?.length) {
      const restoredButton = document.createElement('button');
      restoredButton.type = 'button';
      restoredButton.className = 'btn-ghost';
      restoredButton.textContent = t(language, 'syncAlreadyRestored');
      restoredButton.addEventListener('click', onRestored);
      actions.appendChild(restoredButton);
    }
  }
  const mapLink = document.createElement('a');
  mapLink.href = `https://learnablemeta.com/personal/${sync.id}`;
  mapLink.target = '_blank';
  mapLink.rel = 'noopener noreferrer';
  mapLink.textContent = t(language, 'syncOpenMap');
  actions.appendChild(mapLink);
  const unlink = document.createElement('button');
  unlink.type = 'button';
  unlink.className = 'btn-ghost';
  unlink.textContent = t(language, 'syncUnlink');
  unlink.disabled = Boolean(sync.inFlight);
  unlink.addEventListener('click', onUnlink);
  actions.appendChild(unlink);
  if (sync.needsUpload) {
    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'btn-ghost';
    done.textContent = t(language, 'syncUploadDone');
    done.addEventListener('click', onUploadDone);
    actions.appendChild(done);
  }
  status.appendChild(actions);
  section.appendChild(status);
  return section;
}
