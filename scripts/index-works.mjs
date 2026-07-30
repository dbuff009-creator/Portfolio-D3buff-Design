/**
 * Сканирует images/works/:
 * - файлы в корне → отдельные работы
 * - папки → группы (колонка на странице «Все работы»)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WORKS_DIR = path.join(ROOT, 'images', 'works');
const MANIFEST = path.join(ROOT, 'data', 'works.json');
const WORKS_JS = path.join(ROOT, 'js', 'works-data.js');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function isImage(name) {
  return IMAGE_EXT.has(path.extname(name).toLowerCase());
}

async function imagesInFolder(dir, prefix) {
  const items = [];
  let names;
  try {
    names = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return items;
  }
  for (const ent of names) {
    const rel = `${prefix}/${ent.name}`;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      items.push(...(await imagesInFolder(full, rel)));
    } else if (isImage(ent.name)) {
      items.push({ src: rel.replace(/\\/g, '/'), title: ent.name });
    }
  }
  return items.sort((a, b) => a.src.localeCompare(b.src, 'ru'));
}

function groupMeta(folder) {
  const lower = folder.toLowerCase();
  if (lower === 'avatarka') {
    return { title: 'Аватарка', layout: 'avatarka' };
  }
  if (/wb/i.test(folder)) {
    return { title: folder, layout: 'wb', tag: 'wb' };
  }
  return { title: folder, layout: 'project' };
}

async function main() {
  const singles = [];
  const groups = [];

  let entries;
  try {
    entries = await fs.readdir(WORKS_DIR, { withFileTypes: true });
  } catch {
    console.error('Папка images/works/ не найдена');
    process.exit(1);
  }

  for (const ent of entries) {
    if (ent.isDirectory()) {
      const folderPath = path.join(WORKS_DIR, ent.name);
      const items = await imagesInFolder(folderPath, ent.name);
      if (!items.length) continue;
      let description = '';
      try {
        description = (await fs.readFile(path.join(folderPath, 'description.txt'), 'utf8')).trim();
      } catch { /* нет файла — ок */ }
      const group = { folder: ent.name, ...groupMeta(ent.name), items };
      if (description) group.description = description;
      groups.push(group);
    } else if (isImage(ent.name)) {
      const full = path.join(WORKS_DIR, ent.name);
      const stat = await fs.stat(full);
      singles.push({
        src: ent.name,
        title: ent.name,
        mtime: stat.mtimeMs
      });
    }
  }

  singles.sort((a, b) => b.mtime - a.mtime);
  singles.forEach((s) => { delete s.mtime; });
  groups.sort((a, b) => a.folder.localeCompare(b.folder, 'ru'));

  const payload = {
    updatedAt: new Date().toISOString(),
    singles,
    groups
  };

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  await fs.writeFile(
    WORKS_JS,
    '// Автоматически: update-works.bat\nwindow.WORKS_DATA = ' +
      JSON.stringify(payload) +
      ';\n',
    'utf8'
  );

  console.log(`singles: ${singles.length}, groups: ${groups.length}`);
  console.log(`\nГотово → data/works.json + js/works-data.js`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
