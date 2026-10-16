// Sinh lại tài liệu docs/menu/*.md từ mã nguồn.
// Chạy từ thư mục gốc repo:  node docs/menu/_tools/generate.cjs
// Yêu cầu: đã `npm install` trong fontend/ (dùng gói typescript để đọc AST).
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const repo = path.resolve(__dirname, '..', '..', '..');
const tools = __dirname;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'depot-docgen-'));
const env = { ...process.env, DOCGEN_WORK: work, OUT: path.join(work, 'fe_api.json') };
const run = (script, cwd, args = []) => execFileSync(process.execPath, [path.join(tools, script), ...args], { cwd, env, stdio: 'inherit' });

const feSrc = path.join(repo, 'fontend', 'src');
run('fe_api.cjs', feSrc);                       // hàm API frontend -> HTTP + URL
run('fe_pages.cjs', feSrc);                     // Sidebar -> App.tsx case -> component -> hàm API
run('fe_subtabs.cjs', feSrc);                   // tách trang dùng chung theo tab con
run('fe_app.cjs', feSrc);                       // lời gọi ở App.tsx, modal workflow, apiClient trực tiếp
run('be_routes.cjs', repo, ['SolutionDepot']);  // Controller -> Service -> DbSet/bảng
run('gen_docs.cjs', repo, [path.join(repo, 'docs', 'menu')]);
fs.rmSync(work, { recursive: true, force: true });
