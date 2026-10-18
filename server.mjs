// Optional local preview only. No API, guest storage, or write operations.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
 let file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isDirectory()){
  if(!pathname.endsWith('/')){res.writeHead(302,{'Location':pathname+'/'+new URL(req.url,'http://localhost').search});return res.end()}
  file=path.join(file,'index.html');
 }
 if(!file.startsWith(root+path.sep)||!types[path.extname(file)]){res.writeHead(404);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data)})
});
const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||4174);
server.listen(port,host,()=>console.log(`მოსაწვევი: http://${host}:${port}`));
