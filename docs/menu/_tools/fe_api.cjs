// Trích {object.method -> [{httpMethod, url}]} từ các file API frontend.
const fs=require('fs'),path=require('path');
const ts=require(path.resolve('../node_modules/typescript'));
const vm=require('vm');
const tr=(code)=>ts.transpileModule(code.replace(/\(import\.meta as any\)\.env\?\.VITE_API_BASE_URL/g,'undefined'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019}}).outputText;
const epMod={exports:{}};vm.runInNewContext(tr(fs.readFileSync('api/endpoints.ts','utf8')),{exports:epMod.exports,module:epMod});
const API_ENDPOINTS=epMod.exports.API_ENDPOINTS;
const files=[...fs.readdirSync('api').filter(f=>f.endsWith('.api.ts')).map(f=>'api/'+f),'modules/yard/services/yardApi.ts','modules/notifications/services/notificationService.ts','modules/estimate/services/maerskIntegrationService.ts'];
const out={};
for(const f of files){
  const src=fs.readFileSync(f,'utf8');const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true);
  const consts={};sf.statements.forEach(st=>{if(ts.isVariableStatement(st))for(const d of st.declarationList.declarations)if(d.initializer&&(ts.isStringLiteral(d.initializer)||ts.isNoSubstitutionTemplateLiteral(d.initializer)))consts[d.name.getText(sf)]=d.initializer.text});
  const visitObj=(objName,obj)=>{for(const prop of obj.properties){
      let name,fn;
      if(ts.isPropertyAssignment(prop)&&(ts.isArrowFunction(prop.initializer)||ts.isFunctionExpression(prop.initializer))){name=prop.name.getText(sf);fn=prop.initializer}
      else if(ts.isMethodDeclaration(prop)){name=prop.name.getText(sf);fn=prop}
      if(!fn)continue;
      const params=fn.parameters.map(p=>p.name.getText(sf));
      const calls=[];
      const walk=(n)=>{if(ts.isCallExpression(n)){const e=n.expression;let http=null,arg=n.arguments[0];
          if(ts.isPropertyAccessExpression(e)&&/^(get|post|put|delete|patch)$/.test(e.name.text)&&/apiClient|axios|client|rootApiClient/i.test(e.expression.getText(sf)))http=e.name.text.toUpperCase();
          else if(/^(fetch|authFetch)$/.test(e.getText(sf))){const opt=n.arguments[1];const m=opt&&/method:\s*['"](\w+)['"]/.exec(opt.getText(sf));http=m?m[1].toUpperCase():'GET'}
          if(http&&arg){let url;try{const ctx={API_ENDPOINTS,encodeURIComponent:(x)=>x,String,...consts};params.forEach(p=>{if(!/[{\[]/.test(p))ctx[p]=`{${p}}`});url=vm.runInNewContext(tr('module.exports='+arg.getText(sf)),{...ctx,module:{exports:null}});
              if(typeof url!=='string')url=arg.getText(sf)}catch{url=arg.getText(sf)}
            calls.push({http,url:decodeURIComponent(String(url)).replace(/^\/api(?=\/)/,'')})}
          const dm=/^(\w+Api)\.(\w+)$/.exec(e.getText(sf));if(dm&&dm[1]!==objName)delegates.push(dm[1]+'.'+dm[2])}
        ts.forEachChild(n,walk)};const delegates=[];walk(fn);
      if(calls.length||delegates.length)out[`${objName}.${name}`]={file:f,calls,delegates:[...new Set(delegates)]};
  }};
  const visit=(n)=>{if(ts.isVariableDeclaration(n)&&n.initializer&&ts.isObjectLiteralExpression(n.initializer))visitObj(n.name.getText(sf),n.initializer);
    if(ts.isVariableDeclaration(n)&&n.initializer&&ts.isNewExpression(n.initializer)){} ts.forEachChild(n,visit)};
  visit(sf);
  // class-based services: class X { async m() {...} } + export const x = new X()
  sf.statements.forEach(st=>{if(ts.isClassDeclaration(st)){const inst=[...src.matchAll(new RegExp('export const (\\w+) = new '+st.name.text,'g'))][0];const objName=inst?inst[1]:st.name.text;
     visitObj(objName,{properties:st.members.filter(ts.isMethodDeclaration)})}});
}
fs.writeFileSync(process.env.OUT,JSON.stringify(out,null,1));
console.log(Object.keys(out).length,'api functions');
