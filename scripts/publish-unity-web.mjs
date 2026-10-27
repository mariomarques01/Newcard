import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'public/unity');
function files(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{const name=path.join(directory,entry.name);return entry.isDirectory()?files(name):[name];});}
function digest(filename){return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');}
function sourceFingerprint(){
  const sources=['Unity/Assets','Unity/Packages','Unity/ProjectSettings'].flatMap(name=>files(path.join(root,name))).filter(name=>!name.includes('PerformanceTestRun')&&!name.endsWith('.DS_Store')).sort();
  const hash=crypto.createHash('sha256');
  for(const name of sources)hash.update(path.relative(root,name).split(path.sep).join('/')+'\n'+digest(name)+'\n');
  return hash.digest('hex');
}
if(process.argv.includes('--check')){
  const info=JSON.parse(fs.readFileSync(path.join(output,'build-info.json'),'utf8'));
  if(info.sourceFingerprint!==sourceFingerprint())throw Error('O projeto Unity mudou. Gere e publique novamente o build WebGL antes do deploy.');
  for(const asset of info.assets){const name=path.join(output,asset.path);if(fs.statSync(name).size!==asset.bytes||digest(name)!==asset.sha256)throw Error('Build WebGL inconsistente: '+asset.path);}
  console.log(`Build Unity verificado: ${info.assets.length} arquivos, ${(info.totalBytes/1048576).toFixed(1)} MiB.`);
}else{
  const build=path.join(root,'Unity/Builds/WebGL');
  const index=fs.readFileSync(path.join(build,'index.html'),'utf8');
  if(index.includes('{{{')||!index.includes('createUnityInstance'))throw Error('Template WebGL inválido ou não processado.');
  const built=files(path.join(build,'Build'));
  if(!built.some(name=>name.endsWith('.wasm.unityweb'))||!built.some(name=>name.endsWith('.data.unityweb'))||!built.some(name=>name.endsWith('.loader.js')))throw Error('Build WebGL incompleto.');
  fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
  fs.copyFileSync(path.join(build,'index.html'),path.join(output,'index.html'));
  for(const folder of ['Build','StreamingAssets'])if(fs.existsSync(path.join(build,folder)))fs.cpSync(path.join(build,folder),path.join(output,folder),{recursive:true});
  const assets=files(output).sort().map(name=>({path:path.relative(output,name).split(path.sep).join('/'),bytes:fs.statSync(name).size,sha256:digest(name)}));
  const info={editor:fs.readFileSync(path.join(root,'Unity/ProjectSettings/ProjectVersion.txt'),'utf8').split('\n')[0].split(': ')[1],sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceFingerprint:sourceFingerprint(),builtAt:new Date().toISOString(),totalBytes:assets.reduce((sum,asset)=>sum+asset.bytes,0),assets};
  fs.writeFileSync(path.join(output,'build-info.json'),JSON.stringify(info,null,2)+'\n');
  console.log(`Build Unity publicado em public/unity: ${(info.totalBytes/1048576).toFixed(1)} MiB.`);
}
