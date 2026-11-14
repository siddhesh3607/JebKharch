import fs from 'node:fs';
const base='http://127.0.0.1:3000';
const get=p=>fetch(base+p).then(r=>r.json());
async function post(p,data){const r=await fetch(base+p,{method:'POST',headers:{'content-type':'application/json','x-jebkharch-control':'owner'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
const s=await get('/api/state'),o=await get('/api/owner-state');const evidence={chainId:s.chainId,wallet:s.wallet,checkedAt:new Date().toISOString(),transactions:{}};
for(const [name,data] of Object.entries({fund:{action:'fund',amount:'5'},withdraw:{action:'withdraw',amount:'1',recipient:o.owner},revoke:{action:'revoke'},renew:{action:'grant',perCall:'1',daily:'10',hours:24,recipients:s.vendors}})){const d=await post('/api/owner',data);evidence.transactions[name]=d.tx;console.log(name,d.tx);if(name==='revoke'&&(await get('/api/state')).active)throw Error('Revoke did not apply');}
await post('/api/poison',{enabled:true});await post('/api/run',{});
fs.writeFileSync('deployment/owner-controls-verification.json',JSON.stringify(evidence,null,2));console.log('Owner controls verified; poisoned run started.');
