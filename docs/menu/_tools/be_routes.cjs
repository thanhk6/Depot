// Trích route backend: controller -> action -> service method -> DbSet/bảng.
const fs = require('fs'), path = require('path');
const root = process.argv[2]; // SolutionDepot
const walk = (d, acc = []) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/bin|obj|Migrations/.test(f)) walk(p, acc); } else if (f.endsWith('.cs')) acc.push(p); } return acc; };
const all = walk(root);
const norm = (p) => path.relative(path.resolve(root, '..'), p).split(path.sep).join('/');

// Matching { } từ vị trí mở
const block = (s, openIdx) => { let d = 0; for (let i = openIdx; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}') { d--; if (d === 0) return s.slice(openIdx, i + 1); } } return s.slice(openIdx); };

// DbContext: DbSet<Entity> Prop
const dbSets = {}; // prop -> entity
for (const f of all.filter(f => /DbContext\.cs$/.test(f))) { const s = fs.readFileSync(f, 'utf8'); for (const m of s.matchAll(/DbSet<(\w+)>\s+(\w+)/g)) dbSets[m[2]] = m[1]; }
// Tên bảng: ToTable("x") trong Configuration<Entity>, mặc định = tên DbSet
const tableOf = {};
for (const [prop, ent] of Object.entries(dbSets)) tableOf[ent] = prop;
for (const f of all.filter(f => /Configuration\.cs$/.test(f))) { const s = fs.readFileSync(f, 'utf8'); const e = /IEntityTypeConfiguration<(\w+)>/.exec(s); const t = /ToTable\("([^"]+)"/.exec(s); if (e && t) tableOf[e[1]] = t[1]; }

// Services: class X : IX { methods }
const services = {}; // ClassName -> { file, methods: { name: {entities:[], calls:[]} } }
for (const f of all.filter(f => /Application[\\/]Services[\\/]\w+\.cs$/.test(f) || /Hosts[\\/].*Services[\\/]\w+\.cs$/.test(f))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const cm of s.matchAll(/class\s+(\w+)\s*(?::\s*([\w, <>]+))?\s*\{/g)) {
    const cls = cm[1]; const body = block(s, cm.index + cm[0].length - 1);
    const methods = {};
    for (const mm of body.matchAll(/(?:public|private|protected|internal)\s+(?:async\s+)?(?:static\s+)?[\w<>\[\]?,.\s]+?\s+(\w+)\s*\(/g)) {
      const after = mm.index + mm[0].length;
      const b0 = body.indexOf('{', after);
      const semi = body.indexOf(';', after);
      const arrow = body.indexOf('=>', after);
      let mb;
      if (arrow >= 0 && (b0 < 0 || arrow < b0) && (semi < 0 || arrow < semi)) mb = body.slice(arrow, semi < 0 ? undefined : semi); // expression-bodied
      else if (b0 >= 0 && (semi < 0 || b0 < semi)) mb = block(body, b0);
      else continue; // khai báo không có thân (interface / abstract)
      const ents = new Set();
      for (const x of mb.matchAll(/\b_?(?:db|_db|context|_context)\.(\w+)\b/g)) if (dbSets[x[1]]) ents.add(dbSets[x[1]]);
      for (const x of mb.matchAll(/\.Set<(\w+)>\(\)/g)) ents.add(x[1]);
      const calls = [...new Set([...mb.matchAll(/\b(\w+)\s*\(/g)].map(x => x[1]))];
      methods[mm[1]] = { entities: [...ents], calls };
    }
    services[cls] = { file: norm(f), methods };
  }
}
// gom thực thể của các method private/helper được gọi trong cùng class (1 cấp)
for (const svc of Object.values(services)) for (const m of Object.values(svc.methods)) for (const c of m.calls) if (svc.methods[c] && svc.methods[c] !== m) for (const e of svc.methods[c].entities) if (!m.entities.includes(e)) m.entities.push(e);

// Controllers
const routes = [];
for (const f of all.filter(f => /Controllers[\\/]\w+Controller\.cs$/.test(f))) {
  const s = fs.readFileSync(f, 'utf8');
  const cm = /class\s+(\w+)Controller\b/.exec(s); if (!cm) continue;
  const ctrl = cm[1];
  const rm = /\[Route\("([^"]+)"\)\]\s*(?:\[[^\]]+\]\s*)*public\s+(?:sealed\s+)?class/.exec(s);
  const base = (rm ? rm[1] : 'api/[controller]').replace('[controller]', ctrl);
  const fields = {}; for (const x of s.matchAll(/private\s+readonly\s+I?(\w+)\s+(\w+);/g)) fields[x[2]] = x[1];
  for (const am of s.matchAll(/\[(Http(Get|Post|Put|Delete|Patch))(?:\("([^"]*)"\))?\]([\s\S]*?)public\s+(?:async\s+)?[\w<>]+\s+(\w+)\s*\(/g)) {
    const verb = am[2].toUpperCase(); const tmpl = am[3] || ''; const action = am[5];
    const b0 = s.indexOf('{', am.index + am[0].length); const body = block(s, b0);
    const svcCalls = [];
    for (const x of body.matchAll(/\b(\w+)\.(\w+)\s*\(/g)) if (fields[x[1]]) svcCalls.push({ service: fields[x[1]], method: x[2] });
    const ents = new Set();
    for (const c of svcCalls) { const svc = services[c.service]; const m = svc && svc.methods[c.method]; if (m) m.entities.forEach(e => ents.add(e)); }
    const url = ('/' + base + (tmpl ? '/' + tmpl : '')).replace(/\/+/g, '/');
    routes.push({ controller: ctrl + 'Controller', file: norm(f), verb, url, action, serviceCalls: svcCalls.map(c => c.service + '.' + c.method), entities: [...ents], tables: [...ents].map(e => tableOf[e] || e) });
  }
}
fs.writeFileSync(process.env.DOCGEN_WORK + '/be_routes.json', JSON.stringify({ routes, tableOf }, null, 1));
console.log(routes.length, 'routes;', Object.keys(services).length, 'service classes;', Object.keys(dbSets).length, 'DbSets');
for (const r of routes.slice(0, 8)) console.log(r.verb, r.url, '->', r.serviceCalls.join(','), '|', r.tables.join(','));
