/**
 * Сканирует «работы/»:
 * - файлы в корне → отдельные работы
 * - папки → группы (колонка на странице «Все работы»)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WORKS_DIR = path.join(ROOT, 'работы');
const MANIFEST = path.join(ROOT, 'works.json');
const WORKS_JS = path.join(ROOT, 'works-data.js');

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
    console.error('Папка «работы/» не найдена');
    process.exit(1);
  }

  for (const ent of entries) {
    if (ent.isDirectory()) {
      const items = await imagesInFolder(path.join(WORKS_DIR, ent.name), ent.name);
      if (!items.length) continue;
      groups.push({ folder: ent.name, ...groupMeta(ent.name), items });
    } else if (isImage(ent.name)) {
      singles.push({ src: ent.name, title: ent.name });
    }
  }

  singles.sort((a, b) => a.src.localeCompare(b.src, 'ru'));
  groups.sort((a, b) => a.folder.localeCompare(b.folder, 'ru'));

  const manifest = { updatedAt: new Date().toISOString(), singles, groups };

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await fs.writeFile(
    WORKS_JS,
    '// Автоматически: обновить-работы.bat\nwindow.WORKS_DATA = ' +
      JSON.stringify(manifest, null, 2) +
      ';\n',
    'utf8'
  );

  const inGroups = groups.reduce((n, g) => n + g.items.length, 0);
  console.log(`\nГотово → works.json + works-data.js`);
  console.log(`  отдельных: ${singles.length}`);
  console.log(`  групп (папок): ${groups.length} (${inGroups} файлов)\n`);
}

main().catch(err => {
  console.error('Ошибка:', err.message);
  process.exit(1);
});
