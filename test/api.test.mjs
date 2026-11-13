import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
test('dashboard owner lifecycle and paid endpoint replay protection', {timeout:120000},async()=>{
 const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,NETWORK:'local',PORT:'3101'},stdio:['ignore','pipe','pipe']});
 let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 const base='http://127.0.0.1:3101';
 const get=p=>fetch(base+p).then(r=>r.json());
 const post=(p,data={},header=true)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json',...(header?{'x-jebkharch-control':'owner'}:{})},body:JSON.stringify(data)});
 try{
  for(let i=0;i<120;i++){if(output.includes('JebKharch:'))break;if(child.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,250));}
  assert.match(output,/JebKharch:/);assert.equal((await fetch(base)).status,200);
  const owner=await get('/api/owner-state');assert.equal(owner.localOwnerAvailable,true);
  assert.equal((await fetch(base+'/vendor/ethers.js')).status,200);
  assert.equal((await post('/api/owner',{action:'revoke'},false)).status,403);
  assert.equal((await fetch(base+'/api/owner',{method:'POST',headers:{'content-type':'application/json','x-jebkharch-control':'owner',origin:'https://evil.example'},body:'{}'})).status,403);
  const s=await get('/api/state');
  assert.equal((await post('/api/owner',{action:'grant',perCall:'2',daily:'1',hours:24,recipients:s.vendors})).status,500);
  assert.equal((await post('/api/owner',{action:'fund',amount:'2'})).status,200);
  assert.equal((await get('/api/state')).balance,'12.0');
  assert.equal((await post('/api/owner',{action:'withdraw',amount:'2',recipient:owner.owner})).status,200);
  assert.equal((await post('/api/owner',{action:'revoke'})).status,200);
  assert.equal((await get('/api/state')).active,false);
  assert.equal((await post('/api/owner',{action:'grant',perCall:'1',daily:'5',hours:24,recipients:s.vendors})).status,200);
  await post('/api/poison',{enabled:true});await post('/api/run');
  let done;for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,250));done=await get('/api/state');if(!done.busy)break;}
  assert.equal(done.busy,false);assert.equal(done.balance,'7.0');assert.equal(done.remaining,'2.0');assert.ok(done.ledger.some(e=>e.reason==='RecipientNotAllowed'));
  assert.equal((await post('/api/owner',{action:'grant',perCall:'1',daily:'5',hours:24,recipients:s.vendors})).status,200);
  assert.equal((await get('/api/state')).remaining,'2.0');
  assert.equal((await post('/api/owner',{action:'prepare'})).status,200);
  const prepared=await get('/api/state');assert.equal(prepared.balance,'10.0');assert.equal(prepared.remaining,'5.0');assert.equal(prepared.spent,'3.0');assert.equal(prepared.daily,'8.0');
  const paid=done.ledger.find(e=>e.status==='paid');
  const q=await(await fetch(base+'/vendor/1')).json();
  const replay=await fetch(base+'/vendor/1',{headers:{'x-payment-tx':paid.tx,'x-request-id':q.requestId}});assert.equal(replay.status,402);
  await post('/api/run');
  const kill=await post('/api/owner',{action:'revoke'});const killResult=await kill.json();assert.equal(kill.status,200,'Kill switch must work during an active run: '+JSON.stringify(killResult)+' '+output);
  for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,250));done=await get('/api/state');if(!done.busy)break;}
  assert.equal(done.active,false);assert.ok(done.ledger.some(e=>e.reason==='SessionInactive'));
 }finally{child.kill();}
});
