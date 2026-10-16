// Tách các menu dùng chung 1 trang (MasterDataPage, NotificationModule, ReportPage...) theo tab con.
const fs = require('fs'), path = require('path');
const api = require(process.env.DOCGEN_WORK + '/fe_api.json');
const pages = require(process.env.DOCGEN_WORK + '/fe_pages.json');
const apiObjs = new Set(Object.keys(api).map(k => k.split('.')[0]));
const norm = (p) => p.split(path.sep).join('/');
const rel = (f) => norm(path.relative('.', f));
const res = (from, spec) => {
  if (!spec || !spec.startsWith('.')) return null;
  const b = path.resolve(path.dirname(from), spec);
  for (const e of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) { const c = b + e; if (fs.existsSync(c) && fs.statSync(c).isFile()) return path.resolve(c); }
  return null;
};
const srcRoot = norm(path.resolve('.'));
const apiFiles = new Set(Object.values(api).map(v => norm(path.resolve(v.file))));
const skip = (f) => { const r = norm(f).replace(srcRoot, ''); return apiFiles.has(norm(f)) || /^\/(api|context)\//.test(r) || /mockDataStore/.test(r) || /components\/layout\//.test(r); };
const reach = (start) => {
  const seen = new Set(); const q = [start];
  while (q.length) {
    const f = q.pop(); if (!f || seen.has(f)) continue; seen.add(f);
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/from\s*['"]([^'"]+)['"]/g)) { const r = res(f, m[1]); if (r && /\.tsx?$/.test(r) && !skip(r)) q.push(r); }
  }
  return [...seen];
};
const callsIn = (files) => { const c = new Set(); for (const ff of files) { const s = fs.readFileSync(ff, 'utf8'); for (const m of s.matchAll(/\b(\w+)\.(\w+)\(/g)) if (apiObjs.has(m[1]) && api[m[1] + '.' + m[2]]) c.add(m[1] + '.' + m[2]); } return c; };

const app = fs.readFileSync('App.tsx', 'utf8');
const shared = {};
for (const p of pages) if (p.componentFile) (shared[p.componentFile] = shared[p.componentFile] || []).push(p);
for (const [file, list] of Object.entries(shared)) {
  if (list.length < 2) continue;
  const abs = path.resolve(file);
  const src = fs.readFileSync(abs, 'utf8');
  const imports = {};
  for (const m of src.matchAll(/import \{([^}]+)\} from '([^']+)'/g)) for (const n of m[1].split(',')) imports[n.trim()] = m[2];
  const pageOwn = callsIn([abs]);
  for (const p of list) {
    // tab con: prop initialSubTab / initialTab trong App, hoặc chính id menu (MasterDataPage)
    // Thân case: từ "case 'id':" tới dòng return đầu tiên (các case rơi xuống nhau dùng chung return đó).
    const start = app.indexOf("case '" + p.id + "':");
    const retIdx = app.indexOf('return', start);
    const body = app.slice(start, app.indexOf('\n', retIdx));
    const m = /initial(?:Sub)?Tab="([a-z_]+)"/.exec(body);
    const sub = m ? m[1] : (p.id === 'master_data' ? 'container_types' : p.id);
    const blockRe = new RegExp("=== '" + sub + "'[^\\n]*?&&\\s*\\(?\\s*<([A-Z]\\w+)");
    const b = blockRe.exec(src);
    p.subTab = sub;
    if (b && imports[b[1]]) {
      const subFile = res(abs, imports[b[1]]);
      if (subFile) {
        const files = reach(subFile);
        p.subComponent = b[1]; p.subComponentFile = rel(subFile);
        p.files = files.map(rel);
        p.apiCalls = [...new Set([...pageOwn, ...callsIn(files)])].sort();
        p.pageLevelCalls = [...pageOwn].sort();
      }
    } else {
      p.apiCalls = [...pageOwn].sort();
      p.pageLevelCalls = [...pageOwn].sort();
      p.subComponent = null;
    }
  }
}
fs.writeFileSync(process.env.DOCGEN_WORK + '/fe_pages.json', JSON.stringify(pages, null, 1));
for (const o of pages) console.log(o.id.padEnd(26), (o.subComponent || o.component || '-').padEnd(28), String(o.apiCalls.length).padStart(3), 'api');
