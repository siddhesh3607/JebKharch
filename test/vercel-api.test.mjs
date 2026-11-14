import {test} from 'node:test';import assert from 'node:assert/strict';import {ethers} from 'ethers';
import {makeVendorHandler} from '../api/vendor.js';import health from '../api/health.js';import {VENDORS,quoteId,walletInterface,tokenInterface} from '../lib/payment-protocol.mjs';
const wallet='0x0000000000000000000000000000000000000011',session='0x0000000000000000000000000000000000000022',asset='0x0000000000000000000000000000000000000033';
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};}
test('stateless vendor quote, payment receipt verification, idempotency and tamper rejection',async()=>{
 let now=1000,receipt=null;const provider={call:async()=>walletInterface.encodeFunctionResult('asset',[asset]),getTransactionReceipt:async()=>receipt};const handler=makeVendorHandler({provider,now:()=>now,random:()=>ethers.ZeroHash});
 const req={method:'GET',url:`/api/vendor?vendor=1&wallet=${wallet}&session=${session}&poison=1`};let res=response();await handler(req,res);assert.equal(res.statusCode,402);const q=res.data;assert.equal(q.recipient,VENDORS[1]);assert.equal(q.requestId,quoteId(q));
 const post=async quote=>{const r=response();await handler({method:'POST',url:'/api/vendor',body:{quote,tx:ethers.ZeroHash}},r);return r;};assert.equal((await post(q)).statusCode,402);
 const paid=walletInterface.encodeEventLog(walletInterface.getEvent('Paid'),[session,q.recipient,1000000,0,q.requestId]);const transfer=tokenInterface.encodeEventLog(tokenInterface.getEvent('Transfer'),[wallet,q.recipient,1000000]);
 receipt={status:1,logs:[{address:wallet,...paid}]};assert.equal((await post(q)).statusCode,402,'A Paid event alone does not prove a token transfer');
 receipt.logs.push({address:asset,...transfer});res=await post(q);assert.equal(res.statusCode,200);assert.equal(res.data.price,2499);assert.match(res.data.instruction,/remaining wallet balance/);assert.deepEqual((await post(q)).data,res.data,'Paid quote redemption is idempotent');
 assert.equal((await post({...q,amount:'1'})).statusCode,400);assert.equal((await post({...q,poison:false})).statusCode,400);now=1301;assert.equal((await post(q)).statusCode,400);
 res=response();await handler({method:'GET',url:'/api/vendor?vendor=2'},res);assert.equal(res.statusCode,400);
 res=response();await handler({method:'DELETE',url:'/api/vendor'},res);assert.equal(res.statusCode,405);
});
test('health handler needs no keys or persistent state',()=>{const res=response();health({method:'GET'},res);assert.equal(res.data.requiresServerPrivateKey,false);assert.equal(res.data.ok,true);});
test('vendor rejects forged receipt fields, reverted transactions and malformed inputs',async()=>{
 const now=1000;const q={chainId:43113,vendor:0,poison:false,wallet,session,asset,recipient:VENDORS[0],amount:'1000000',nonce:ethers.ZeroHash,expires:1300};q.requestId=quoteId(q);let receipt;
 const handler=makeVendorHandler({provider:{getTransactionReceipt:async()=>receipt},now:()=>now});
 const call=async(body,method='POST')=>{const r=response();await handler({method,url:'/api/vendor',body},r);return r;};
 const paid=(amount=1000000,recipient=q.recipient)=>({address:wallet,...walletInterface.encodeEventLog(walletInterface.getEvent('Paid'),[session,recipient,amount,0,q.requestId])});
 const transfer=(amount=1000000,from=wallet)=>({address:asset,...tokenInterface.encodeEventLog(tokenInterface.getEvent('Transfer'),[from,q.recipient,amount])});
 for(const logs of [[transfer()],[paid(),transfer(1)],[paid(1),transfer()],[{...paid(),address:asset},transfer()],[paid(),{...transfer(),address:wallet}],[paid(),transfer(1000000,session)]]){receipt={status:1,logs};assert.equal((await call({quote:q,tx:ethers.ZeroHash})).statusCode,402);}
 receipt={status:0,logs:[paid(),transfer()]};assert.equal((await call({quote:q,tx:ethers.ZeroHash})).statusCode,402);
 for(const body of [null,{},'not json',{quote:q,tx:'bad'},{quote:{...q,chainId:1},tx:ethers.ZeroHash},{quote:{...q,wallet:ethers.ZeroAddress},tx:ethers.ZeroHash}])assert.equal((await call(body)).statusCode,400);
});
test('vendor reports RPC outages and unsupported health methods cleanly',async()=>{
 const handler=makeVendorHandler({provider:{call:async()=>{throw Object.assign(Error('RPC unavailable'),{code:'NETWORK_ERROR'});}}});const res=response();await handler({method:'GET',url:`/api/vendor?vendor=0&wallet=${wallet}&session=${session}`},res);assert.equal(res.statusCode,503);
 const h=response();health({method:'POST'},h);assert.equal(h.statusCode,405);assert.equal(h.headers.Allow,'GET');
});
