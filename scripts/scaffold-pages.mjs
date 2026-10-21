import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { allPages } from './structure.mjs';

const root = new URL('../src/content/docs/', import.meta.url).pathname;
let created = 0;

for (const { path, title } of allPages()) {
	const file = join(root, `${path}.md`);
	if (existsSync(file)) continue;
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, `---\ntitle: ${JSON.stringify(title)}\n---\n`);
	created++;
}

console.log(`Created ${created} page(s).`);
