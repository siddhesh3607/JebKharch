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
