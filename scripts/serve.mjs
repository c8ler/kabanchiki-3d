import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const args=process.argv.slice(2),port=Number(args[0]||8080),directory=args.indexOf('--directory'),root=path.resolve(directory<0?'.':args[directory+1]);
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
http.createServer((request,response)=>{
 const name=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){response.writeHead(404).end();return}
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(response);
 });
}).listen(port,'0.0.0.0',()=>console.log('Serving '+root+' on '+port));
