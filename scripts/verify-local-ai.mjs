import fs from 'node:fs';
const base='http://127.0.0.1:3000';
const state=()=>fetch(base+'/api/state').then(r=>r.json());
async function post(path,body){const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json','x-jebkharch-control':'owner'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
if((await state()).busy)throw Error('Wait for the current mission');
console.log('Preparing funded local-AI mission');await post('/api/owner',{action:'prepare'});
const before=(await state()).ledger.length;await post('/api/run',{mode:'local'});
let s;for(let i=0;i<150;i++){s=await state();if(!s.busy)break;await new Promise(r=>setTimeout(r,1000));}
if(s.busy)throw Error('Local AI timed out');const run=s.ledger.slice(0,s.ledger.length-before);const result=run.find(e=>e.result?.model?.includes('local CPU'));
if(run.filter(e=>e.status==='paid').length!==3||!result?.result.explanationValidated)throw Error('Full paid local-AI mission failed');
fs.writeFileSync('deployment/local-ai-verification.json',JSON.stringify({verifiedAt:new Date().toISOString(),network:s.network,chainId:s.chainId,wallet:s.wallet,run,result:result.result},null,2));
console.log('LIVE LOCAL MODEL:',result.result.answer);console.log('Three Fuji vendor payments confirmed.');
await post('/api/owner',{action:'prepare'});s=await state();if(s.balance!=='10.0'||s.remaining!=='5.0')throw Error('Demo restoration failed');console.log('Restored: 10 jUSD and 5 jUSD allowance.');
