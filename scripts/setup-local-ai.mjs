import fs from 'node:fs';import path from 'node:path';import {Readable} from 'node:stream';import {pipeline} from 'node:stream/promises';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
if(process.platform!=='win32'||process.arch!=='x64')throw Error('This bundled setup supports Windows x64. Configure LOCAL_AI_URL for another local inference server.');
const root=path.resolve('runtime');fs.mkdirSync(root,{recursive:true});
const release=await(await fetch('https://api.github.com/repos/ggml-org/llama.cpp/releases/tags/b12383')).json();
const asset=release.assets?.find(a=>a.name==='llama-b12383-bin-win-cpu-x64.zip');if(!asset)throw Error('Official runtime asset unavailable');
const meta=await(await fetch('https://huggingface.co/api/models/Qwen/Qwen2.5-0.5B-Instruct-GGUF?blobs=true')).json();
const modelName='qwen2.5-0.5b-instruct-q4_k_m.gguf';const info=meta.siblings?.find(x=>x.rfilename===modelName);
async function hash(file){const h=createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
async function download(url,file,expected){if(fs.existsSync(file)&&(!expected||await hash(file)===expected)){console.log('Already present:',path.basename(file));return;}
 console.log('Downloading:',path.basename(file));const r=await fetch(url);if(!r.ok)throw Error('Download HTTP '+r.status);await pipeline(Readable.fromWeb(r.body),fs.createWriteStream(file+'.part'));if(expected&&await hash(file+'.part')!==expected)throw Error('Download checksum mismatch');fs.renameSync(file+'.part',file);console.log('Verified:',path.basename(file));}
const zip=path.join(root,'llama-cpu.zip');const model=path.join(root,modelName);
await Promise.all([download(asset.browser_download_url,zip,asset.digest?.replace('sha256:','')),download(`https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/${meta.sha}/${modelName}`,model,info?.lfs?.sha256)]);
const bin=path.join(root,'llama');fs.mkdirSync(bin,{recursive:true});const psQuote=s=>"'"+s.replaceAll("'","''")+"'";execFileSync('powershell.exe',['-NoProfile','-Command',`Expand-Archive -LiteralPath ${psQuote(zip)} -DestinationPath ${psQuote(bin)} -Force`],{stdio:'inherit',windowsHide:true});
fs.writeFileSync(path.join(root,'sources.json'),JSON.stringify({engine:asset.browser_download_url,engineSha256:await hash(zip),model:`https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/tree/${meta.sha}`,modelSha256:await hash(model),modelLicense:meta.cardData?.license||'See model source',downloadedAt:new Date().toISOString()},null,2));
for(const [name,url] of [['LLAMA-CPP-LICENSE.txt','https://raw.githubusercontent.com/ggml-org/llama.cpp/b12383/LICENSE'],['QWEN-LICENSE.txt','https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/raw/main/LICENSE']]){const r=await fetch(url);if(!r.ok)throw Error('License download failed');fs.writeFileSync(path.join(root,name),await r.text());}
console.log('Local AI ready. No API key required. Run npm start.');
