// Rebuild the static guest routes after editing index.html or config.js.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/config.js'),'utf8'),context);
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
for(const guest of context.window.INVITATION.guests){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guest.slug))throw Error('Invalid guest slug');const dir=path.join(root,'dist',guest.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html.replace('<head>','<head>\n    <base href="../" />'))}
fs.writeFileSync(path.join(root,'dist/.nojekyll'),'');
console.log('Prepared '+context.window.INVITATION.guests.length+' static guest routes.');
