import fs from 'node:fs';
const base=process.env.DEMO_URL||'http://127.0.0.1:3000';
async function get(){const r=await fetch(base+'/api/state');if(!r.ok)throw Error('Dashboard unavailable');return r.json();}
async function post(path,body={}){const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json','x-jebkharch-control':'owner'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
async function finished(){for(let i=0;i<120;i++){const s=await get();if(!s.busy)return s;await new Promise(r=>setTimeout(r,1000));}throw Error('Agent timeout');}
const initial=await get();if(initial.busy)throw Error('Wait for the active mission');
console.log('Preparing demo on',initial.network);
await post('/api/owner',{action:'prepare'});await post('/api/poison',{enabled:true});
const before=(await get()).ledger.length;
await post('/api/run');let s=await finished();const run=s.ledger.slice(0,s.ledger.length-before);
if(run.filter(e=>e.status==='paid').length!==3||!run.some(e=>e.reason==='RecipientNotAllowed'&&e.tx))throw Error('Paid attack demonstration failed');
console.log('Three payments confirmed; drain blocked:',run.find(e=>e.reason==='RecipientNotAllowed').tx);
const revoke=await post('/api/owner',{action:'revoke'});
const prior=(await get()).ledger.length;await post('/api/run');s=await finished();
const revoked=s.ledger.slice(0,s.ledger.length-prior);
if(!revoked.some(e=>e.reason==='SessionInactive'&&e.tx)||s.active)throw Error('Revocation check failed');
console.log('Revocation confirmed; revoked session payments blocked.');
const prepare=await post('/api/owner',{action:'prepare'});s=await get();
if(s.balance!=='10.0'||s.remaining!=='5.0'||!s.active)throw Error('Demo not ready');
const evidence={verifiedAt:new Date().toISOString(),network:s.network,chainId:s.chainId,wallet:s.wallet,paidAttackRun:run,revokeTx:revoke.tx,revokedRun:revoked,preparedTx:prepare.tx,ready:{balance:s.balance,remaining:s.remaining,spent:s.spent,daily:s.daily,active:s.active,expires:s.expires}};
fs.mkdirSync('deployment',{recursive:true});fs.writeFileSync('deployment/demo-ready.json',JSON.stringify(evidence,null,2));
console.log('READY: 10 jUSD balance, 5 jUSD allowance, active session.');
