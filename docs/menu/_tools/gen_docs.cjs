// Sinh tài liệu theo menu: docs/menu/README.md + 1 file / nhóm menu.
const fs = require('fs'), path = require('path');
const T = process.env.DOCGEN_WORK + '/';
const api = require(T + 'fe_api.json');
const pages = require(T + 'fe_pages.json');
const { routes } = require(T + 'be_routes.json');
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'notes.json'), 'utf8'));
const OUT = process.argv[2]; // docs/menu
fs.mkdirSync(OUT, { recursive: true });

// Khớp URL frontend -> route backend (so theo từng đoạn, {x} khớp mọi giá trị)
const segs = (u) => u.split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean).map(s => s.toLowerCase());
const isVar = (s) => /^\{.*\}$/.test(s) || s.includes('${');
const fixedCount = (u) => segs(u).filter(s => !isVar(s)).length;
const matchRoute = (http, url) => {
  const a = segs('/api' + url);
  const cands = routes.filter(r => r.verb === http).filter(r => {
    const b = segs(r.url.replace(/\{(\w+)(:[^}]*)?\}/g, '{$1}'));
    return a.length === b.length && a.every((s, i) => s === b[i] || isVar(s) || isVar(b[i]));
  });
  // Điểm: đoạn tham số khớp đoạn tham số / đoạn cố định khớp đúng chữ = 2; tham số frontend rơi vào đoạn
  // cố định của route (vd {id} vs "stats") = 0 — tránh khớp nhầm GET /DepotJobs/{id} sang /DepotJobs/stats.
  const score = (r) => { const b = segs(r.url.replace(/\{(\w+)(:[^}]*)?\}/g, '{$1}')); return a.reduce((s, x, i) => s + ((isVar(x) && isVar(b[i])) || x === b[i] ? 2 : 0), 0); };
  cands.sort((x, y) => score(y) - score(x) || fixedCount(y.url) - fixedCount(x.url));
  return cands[0] || null;
};
const expand = (key, seen = new Set()) => { // hàm API (có thể là service ủy quyền) -> [{fn, http, url}]
  if (seen.has(key)) return []; seen.add(key);
  const a = api[key]; if (!a) return [];
  const direct = a.calls.map(c => ({ fn: key, http: c.http, url: c.url }));
  return direct.concat(...(a.delegates || []).map(d => expand(d, seen)));
};
const esc = (s) => String(s || '').replace(/\|/g, '\\|');
// Neo tiêu đề theo cách GitHub / VS Code: giữ chữ có dấu, bỏ ký tự đặc biệt, mỗi khoảng trắng thành '-'.
const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
// Tên file: bỏ dấu, chỉ a-z0-9.
const fileSlug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const groups = [];
for (const p of pages) { let g = groups.find(x => x.title === p.group); if (!g) groups.push(g = { title: p.group, items: [] }); g.items.push(p); }

const unmatched = []; const usedRoutes = new Set();
const groupFiles = groups.map((g, gi) => ({ g, file: `${String(gi + 1).padStart(2, '0')}-${fileSlug(g.title)}.md` }));
for (const { g, file } of groupFiles) {
  let md = `# ${g.title}\n\n[← Mục lục tài liệu theo menu](README.md)\n\n`;
  const gn = notes['group:' + g.title];
  if (gn) md += `${gn}\n\n`;
  md += `| Menu | Tab id | Component |\n|---|---|---|\n`;
  for (const p of g.items) md += `| [${esc(p.label)}](#${slug(p.label)}) | \`${p.id}\` | ${p.subComponent || p.component ? '`' + (p.subComponent || p.component) + '`' : '—'} |\n`;
  md += '\n---\n\n';
  for (const p of g.items) {
    const n = notes[p.id] || {};
    md += `## ${p.label}\n\n`;
    if (n.purpose) md += `${n.purpose}\n\n`;
    md += `### Frontend\n\n`;
    md += `- Tab id: \`${p.id}\` — khai báo ở \`components/layout/Sidebar.tsx\`, render ở \`App.tsx\` (\`case '${p.id}'\`).\n`;
    if (p.componentFile) md += `- Trang: \`${p.component}\` — [\`fontend/src/${p.componentFile}\`](../../fontend/src/${p.componentFile})\n`;
    else md += `- Trang: không có \`case\` riêng trong \`App.tsx\`.\n`;
    if (p.subComponent) md += `- Nội dung tab \`${p.subTab}\`: \`${p.subComponent}\` — [\`fontend/src/${p.subComponentFile}\`](../../fontend/src/${p.subComponentFile})\n`;
    if (p.props) md += `- Props nhận từ \`App.tsx\`: ${p.props.split(', ').map(x => '`' + x + '`').join(', ')}\n`;
    for (const x of [].concat(n.frontend || [])) md += `- ${x}\n`;
    md += '\n### API & Backend\n\n';
    const eps = []; const seenEp = new Set();
    for (const k of p.apiCalls) for (const e of expand(k)) { const id = e.http + ' ' + e.url; if (seenEp.has(id)) continue; seenEp.add(id); eps.push(e); }
    if (!eps.length) md += `${n.noApi || 'Màn này không tự gọi API riêng — dùng dữ liệu `App.tsx` nạp sẵn và truyền xuống (xem [README](README.md#du-lieu-dung-chung-apptsx)).'}\n\n`;
    else {
      md += `| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |\n|---|---|---|---|---|---|\n`;
      for (const e of eps) {
        const r = matchRoute(e.http, e.url);
        if (!r) unmatched.push(`${p.id}: ${e.fn} ${e.http} /api${e.url}`); else usedRoutes.add(r.verb + ' ' + r.url);
        md += `| \`${e.fn}\` | ${e.http} | \`/api${esc(e.url)}\` | ${r ? '`' + r.controller.replace(/Controller$/, '') + '.' + r.action + '`' : '⚠️ không có route'} | ${r && r.serviceCalls.length ? r.serviceCalls.map(s => '`' + s + '`').join('<br>') : '—'} | ${r && r.tables.length ? r.tables.map(t => '`' + t + '`').join(', ') : '—'} |\n`;
      }
      md += '\n';
    }
    if ([].concat(n.notes || []).length) { md += `### Ghi chú\n\n`; for (const x of [].concat(n.notes)) md += `- ${x}\n`; md += '\n'; }
    if (n.progress) md += `Lịch sử rà soát & sửa lỗi: ${[].concat(n.progress).map(f => `[${path.basename(f)}](../backend-progress/${f})`).join(', ')}\n\n`;
  }
  fs.writeFileSync(path.join(OUT, file), md);
}

// README
let rd = fs.readFileSync(path.join(__dirname, 'readme_head.md'), 'utf8');
rd += `\n## Mục lục theo menu\n\n| # | Nhóm menu | Số mục | Tài liệu |\n|---|---|---|---|\n`;
groupFiles.forEach(({ g, file }, i) => { rd += `| ${i + 1} | ${g.title} | ${g.items.length} | [${file}](${file}) |\n`; });
rd += `\n## Tra nhanh: tab id → màn hình\n\n| Tab id | Menu | Component | Tài liệu |\n|---|---|---|---|\n`;
for (const { g, file } of groupFiles) for (const p of g.items) rd += `| \`${p.id}\` | ${esc(p.label)} | ${p.subComponent || p.component ? '`' + (p.subComponent || p.component) + '`' : '—'} | [${file}](${file}#${slug(p.label)}) |\n`;
const unused = routes.filter(r => !usedRoutes.has(r.verb + ' ' + r.url));
rd += `\n## Endpoint backend không được menu nào gọi trực tiếp\n\nCác route dưới đây tồn tại ở backend nhưng không màn hình nào trong menu gọi tới (webhook bên ngoài, API phụ trợ, hoặc endpoint cũ). Liệt kê để tránh hiểu nhầm là thiếu tài liệu.\n\n| HTTP | Route | Controller.Action |\n|---|---|---|\n`;
for (const r of unused) rd += `| ${r.verb} | \`${r.url}\` | \`${r.controller.replace(/Controller$/, '')}.${r.action}\` |\n`;
fs.writeFileSync(path.join(OUT, 'README.md'), rd);
fs.writeFileSync(T + 'unmatched.txt', unmatched.join('\n'));
console.log('files:', groupFiles.length + 1, '| routes used:', usedRoutes.size, '/', routes.length, '| unmatched:', unmatched.length);
