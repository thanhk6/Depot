const fs = require('fs'), path = require('path');
const api = require(process.env.DOCGEN_WORK + '/fe_api.json');
const apiObjs = new Set(Object.keys(api).map(k => k.split('.')[0]));
const norm = (p) => p.split(path.sep).join('/');

// Sidebar: nhóm + mục menu
const sb = fs.readFileSync('components/layout/Sidebar.tsx', 'utf8');
const groups = []; let g = null;
for (const m of sb.matchAll(/title: '([^']+)'|id: '([^']+)',\s*\r?\n\s*label: '([^']+)'/g)) {
  if (m[1]) { g = { title: m[1], items: [] }; groups.push(g); } else if (g) g.items.push({ id: m[2], label: m[3] });
}

// App.tsx: case 'id' -> component
const app = fs.readFileSync('App.tsx', 'utf8');
const imports = {};
for (const m of app.matchAll(/import \{([^}]+)\} from '([^']+)'/g)) for (const n of m[1].split(',')) imports[n.trim()] = m[2];
for (const m of app.matchAll(/import (\w+) from '([^']+)'/g)) imports[m[1]] = m[2];
const caseComp = {};
const sw = app.slice(app.indexOf('switch (activeTab)'));
const parts = sw.split(/\n\s*case '/).slice(1);
let pending = [];
for (const p of parts) {
  const id = p.slice(0, p.indexOf("'")); pending.push(id);
  const body = p.slice(p.indexOf(':') + 1);
  const c = /<([A-Z]\w+)[\s/>]/.exec(body);
  const isSimpleFallthrough = /^\s*$/.test(body.split('\n')[0]) && !c;
  if (c && body.indexOf('<' + c[1]) < 800) {
    // Chỉ lấy TÊN các props (giá trị có thể là arrow function nhiều dòng) — từ thẻ mở tới "/>" đầu tiên.
    const tagStart = body.indexOf('<' + c[1]);
    const tag = body.slice(tagStart, body.indexOf('/>', tagStart) + 2);
    const propNames = [...new Set([...tag.matchAll(/\s([a-zA-Z]\w*)=/g)].map(m => m[1]))];
    for (const i of pending) caseComp[i] = { comp: c[1], from: imports[c[1]], props: propNames.join(', ') };
    pending = [];
  } else if (!isSimpleFallthrough) { pending = []; }
}

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
const rel = (f) => norm(path.relative('.', f));
const out = [];
for (const gr of groups) for (const it of gr.items) {
  const c = caseComp[it.id]; let files = [], calls = new Set(), compFile = null;
  if (c && c.from) {
    const f = res(path.resolve('App.tsx'), c.from);
    if (f) {
      compFile = rel(f); files = reach(f);
      for (const ff of files) { const s = fs.readFileSync(ff, 'utf8'); for (const m of s.matchAll(/\b(\w+)\.(\w+)\(/g)) if (apiObjs.has(m[1]) && api[m[1] + '.' + m[2]]) calls.add(m[1] + '.' + m[2]); }
    }
  }
  out.push({ group: gr.title, id: it.id, label: it.label, component: c ? c.comp : null, componentFile: compFile, props: c ? c.props : '', files: files.map(rel), apiCalls: [...calls].sort() });
}
fs.writeFileSync(process.env.DOCGEN_WORK + '/fe_pages.json', JSON.stringify(out, null, 1));
for (const o of out) console.log(o.id.padEnd(26), (o.component || '-').padEnd(26), String(o.files.length).padStart(3), 'files', String(o.apiCalls.length).padStart(3), 'api');
