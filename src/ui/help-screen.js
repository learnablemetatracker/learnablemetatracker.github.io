// web/src/ui/help-screen.js
import { t } from '../i18n.js';

export function renderHelpScreen(progress) {
  const container = document.createElement('div');
  container.className = 'help-screen';

  const title = document.createElement('h2');
  title.textContent = t(progress.language, 'helpTitle');
  container.appendChild(title);

  const intro = document.createElement('p');
  intro.className = 'help-intro';
  intro.textContent = t(progress.language, 'helpIntro');
  container.appendChild(intro);

  for (const [headingKey, textKey] of [
    ['helpDataHeading', 'helpDataText'],
    ['helpBackupHeading', 'helpBackupText'],
    ['helpCatalogHeading', 'helpCatalogText']
  ]) {
    const section = document.createElement('section');
    section.className = 'help-section';

    const heading = document.createElement('h3');
    heading.textContent = t(progress.language, headingKey);
    section.appendChild(heading);

    const text = document.createElement('p');
    text.textContent = t(progress.language, textKey);
    section.appendChild(text);

    container.appendChild(section);
  }

  return container;
}
