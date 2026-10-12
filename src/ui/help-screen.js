// web/src/ui/help-screen.js
import { t } from '../i18n.js';

function helpLink(language, key, href) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = t(language, key);
  if (href.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

export function renderHelpScreen(progress) {
  const language = progress.language;
  const container = document.createElement('div');
  container.className = 'help-screen';

  const title = document.createElement('h2');
  title.textContent = t(language, 'helpTitle');
  container.appendChild(title);

  const intro = document.createElement('p');
  intro.className = 'help-intro';
  intro.textContent = t(language, 'helpIntro');
  container.appendChild(intro);

  const setupHeading = document.createElement('h3');
  setupHeading.textContent = t(language, 'helpSetupHeading');
  container.appendChild(setupHeading);

  const steps = document.createElement('ol');
  steps.className = 'help-steps';
  const bridgeHref = 'https://learnablemetatracker.github.io/learnablemeta-sync.user.js';
  for (const [titleKey, textKey, linkKey, href] of [
    ['helpStepGeoTitle', 'helpStepGeoText', 'helpStepGeoLink', 'https://www.geoguessr.com/map-maker'],
    ['helpStepPersonalTitle', 'helpStepPersonalText', 'helpStepPersonalLink', 'https://learnablemeta.com/docs/getting-started/personal-maps'],
    ['helpStepMetasTitle', 'helpStepMetasText', 'helpStepMetasLink', 'https://learnablemeta.com/maps'],
    ['helpStepUploadTitle', 'helpStepUploadText', 'helpStepUploadLink', 'https://learnablemeta.com/docs/getting-started/personal-maps'],
    ['helpStepTrackerTitle', 'helpStepTrackerText', 'helpStepTrackerLink', bridgeHref],
    ['helpStepPracticeTitle', 'helpStepPracticeText', null, null]
  ]) {
    const item = document.createElement('li');
    const heading = document.createElement('h4');
    heading.textContent = t(language, titleKey);
    item.appendChild(heading);
    const text = document.createElement('p');
    text.textContent = t(language, textKey);
    item.appendChild(text);
    if (linkKey) item.appendChild(helpLink(language, linkKey, href));
    steps.appendChild(item);
  }
  container.appendChild(steps);

  const reminder = document.createElement('p');
  reminder.className = 'help-reminder';
  reminder.textContent = t(language, 'helpUploadReminder');
  container.appendChild(reminder);

  for (const [headingKey, textKey] of [
    ['helpSyncHeading', 'helpSyncText'],
    ['helpDataHeading', 'helpDataText'],
    ['helpBackupHeading', 'helpBackupText'],
    ['helpCatalogHeading', 'helpCatalogText']
  ]) {
    const section = document.createElement('section');
    section.className = 'help-section';

    const heading = document.createElement('h3');
    heading.textContent = t(language, headingKey);
    section.appendChild(heading);

    const text = document.createElement('p');
    text.textContent = t(language, textKey);
    section.appendChild(text);

    container.appendChild(section);
  }

  return container;
}
