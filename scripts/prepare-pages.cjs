'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
// Publish only these application resources. Never copy the project directory wholesale.
const PUBLIC_FILES=[
 'index.html','styles.css','config.js','app.js','pdf.js','15.png',
 'assets/pdf-assets.js','assets/contact-qr.js','assets/open-sans-regular.woff',
 'assets/poppins-regular.woff2','assets/poppins-semibold.woff2',
 'assets/OPEN-SANS-LICENSE.txt','assets/OPEN-SANS-NOTICE.txt',
 'assets/POPPINS-LICENSE.txt','assets/POPPINS-NOTICE.txt',
 'assets/vendor/qrcodegen.js','assets/vendor/qrcodegen-LICENSE.txt'
];
function prepare(){
 const out=path.join(ROOT,'dist');
 for(const relative of PUBLIC_FILES){const p=path.join(ROOT,relative);if(!fs.lstatSync(p).isFile())throw Error('Expected a regular public file: '+relative);if(fs.realpathSync(p)!==p)throw Error('Symlink in public resource: '+relative);}
 if(fs.existsSync(out)&&(!fs.lstatSync(out).isDirectory()||fs.lstatSync(out).isSymbolicLink()))throw Error('dist must be a real directory');
 if(fs.existsSync(out)&&!fs.existsSync(path.join(out,'.nojekyll')))throw Error('Refusing to replace an unrecognized dist directory');
 fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
 for(const relative of PUBLIC_FILES){const target=path.join(out,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,relative),target);}
 fs.writeFileSync(path.join(out,'.nojekyll'),'');
 console.log(`Prepared ${PUBLIC_FILES.length+1} public files in dist/. No deployment performed.`);
 return out;
}
if(require.main===module)prepare();
module.exports={ROOT,PUBLIC_FILES,prepare};
