const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'src');
const files = [];
function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(/\.tsx$/.test(e.name)) files.push(p);} }
walk(root);
const out=[];
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(n){
    if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){
      const tag=n.tagName.getText(sf);
      if(tag==='button'){
        const attrs=n.attributes.properties;
        const names=attrs.map(a=>a.name&&a.name.getText(sf));
        const hasClick=names.includes('onClick');
        const hasSubmit=names.includes('type') && attrs.some(a=>a.name&&a.name.getText(sf)==='type'&&a.initializer&&a.initializer.getText(sf).includes('submit'));
        const hasSpread=attrs.some(a=>ts.isJsxSpreadAttribute(a));
        if(!hasClick && !hasSubmit && !hasSpread){
          const pos=sf.getLineAndCharacterOfPosition(n.getStart(sf));
          const text=n.getText(sf).replace(/\s+/g,' ').slice(0,160);
          out.push(`${path.relative(root,f)}:${pos.line+1}  ${text}`);
        }
      }
    }
    ts.forEachChild(n,visit);
  }
  visit(sf);
}
console.log(out.length? out.join('\n') : 'NO BUTTONS WITHOUT onClick');
