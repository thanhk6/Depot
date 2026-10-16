// Gán các lời gọi API nằm trong App.tsx (callback truyền xuống trang) cho đúng menu.
const fs = require('fs');
const T = process.env.DOCGEN_WORK + '/';
const api = require(T + 'fe_api.json');
const pages = require(T + 'fe_pages.json');
const app = fs.readFileSync('App.tsx', 'utf8');
const apiObjs = new Set(Object.keys(api).map(k => k.split('.')[0]));
const callsIn = (s) => [...new Set([...s.matchAll(/\b(\w+)\.(\w+)\(/g)].filter(m => apiObjs.has(m[1]) && api[m[1] + '.' + m[2]]).map(m => m[1] + '.' + m[2]))];
for (const p of pages) {
  const start = app.indexOf("case '" + p.id + "':");
  if (start < 0) { p.appCalls = []; continue; }
  // thân case: tới "case '" kế tiếp có return riêng, hoặc tới hết renderContent
  let end = app.indexOf('\n      case \'', app.indexOf('return', start));
  if (end < 0) end = app.indexOf('default:', start);
  const body = app.slice(start, end);
  const calls = new Set(callsIn(body));
  if (/refreshContainer\(/.test(body)) calls.add('containerApi.getById');
  p.appCalls = [...calls].sort();
  p.apiCalls = [...new Set([...p.apiCalls, ...p.appCalls])].sort();
}
// Menu mở modal thay vì trang: 'workflow' -> BusinessWorkflowModal (App.tsx handleSelectTab)
{
  const wf = pages.find(p => p.id === 'workflow');
  const f = 'modules/system/components/BusinessWorkflowModal.tsx';
  if (wf && fs.existsSync(f)) {
    wf.component = 'BusinessWorkflowModal'; wf.componentFile = f; wf.files = [f];
    wf.apiCalls = callsIn(fs.readFileSync(f, 'utf8')).sort();
    wf.props = 'mở dạng modal qua handleSelectTab (không đổi activeTab)';
  }
}
// Lời gọi HTTP trực tiếp trong component (apiClient.get/post... không qua api/*.ts)
const direct = {};
for (const p of pages) {
  for (const f of p.files || []) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/\b(apiClient|rootApiClient|axios)\.(get|post|put|delete|patch)(?:<[^>]*>)?\(\s*([`'"])([^`'"]*)\3/g)) {
      const url = m[4].replace(/\$\{[^}]*\}/g, '{id}').replace(/^\/api(?=\/)/, '');
      const line = s.slice(0, m.index).split('\n').length;
      const key = `${f.split('/').pop().replace(/\.tsx?$/, '')}:${line}`;
      api[key] = { file: f, calls: [{ http: m[2].toUpperCase(), url }], delegates: [], direct: true };
      (direct[p.id] = direct[p.id] || new Set()).add(key);
    }
  }
  if (direct[p.id]) p.apiCalls = [...new Set([...p.apiCalls, ...direct[p.id]])].sort();
}
fs.writeFileSync(T + 'fe_api.json', JSON.stringify(api, null, 1));
fs.writeFileSync(T + 'fe_pages.json', JSON.stringify(pages, null, 1));
console.log('direct apiClient calls:', Object.values(direct).reduce((n, s) => n + s.size, 0), Object.keys(direct).join(', '));
for (const p of pages) if (p.appCalls.length) console.log(p.id.padEnd(22), p.appCalls.join(', '));
