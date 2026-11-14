// Optional developer smoke test. Local .env is never used by the Vercel app.
import 'dotenv/config';import fs from 'node:fs';import {ethers} from 'ethers';import {BrowserDemo} from '../public/demo-core.js';
if(!process.env.DEPLOYER_PRIVATE_KEY)throw Error('A locally funded disposable Fuji test signer is required for this developer check');
const config=JSON.parse(fs.readFileSync('dist/config.json'));const provider=new ethers.JsonRpcProvider(config.rpcUrl,43113,{staticNetwork:true,cacheTimeout:-1});provider.pollingInterval=1200;
if(Number((await provider.send('eth_chainId',[])))!==43113)throw Error('Fuji only');
const signer=new ethers.NonceManager(new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY,provider));const events=[];const demo=new BrowserDemo({ethers,provider,config,meta:{},onEvent:e=>events.push(e)});
try{
 await demo.create(signer,message=>console.log(message));console.log('Owned Fuji wallet created:',demo.meta.wallet);
 const results=[];for(const i of [0,1,1])results.push(await demo.buy(i,true,{base:'http://127.0.0.1:3000'}));if(results.some(r=>!r.price))throw Error('Paid vendor call failed');
 const state=await demo.snapshot();if(state.balance!=='7.0'||state.remaining!=='2.0')throw Error('Payment totals incorrect');
 const drain=await demo.pay('0x0000000000000000000000000000000000000abc',7000000n,ethers.hexlify(ethers.randomBytes(32)),'Hosted-flow poisoned drain');if(drain.reason!=='RecipientNotAllowed')throw Error('Drain not blocked as expected');
 await demo.revoke(signer);const denied=await demo.pay(config.vendors[0],1000000n,ethers.hexlify(ethers.randomBytes(32)),'Hosted-flow revoked payment');if(denied.reason!=='SessionInactive')throw Error('Revoked session was not rejected');
 fs.writeFileSync('deployment/vercel-fuji-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),network:'Fuji',chainId:43113,meta:demo.meta,results,events,finalState:await demo.snapshot(),note:'The exact browser controller and serverless vendor handlers were exercised with a local disposable test signer. Wallet-extension consent UI was not automated. No private keys are exported.'},null,2));console.log('Verified: three paid serverless calls, drain revert, owner revoke, revoked-session revert.');
}finally{if(demo.meta.wallet&&demo.meta.session){const policy=await demo.wallet().policies(demo.meta.session);if(policy.active)await demo.revoke(signer);}}
