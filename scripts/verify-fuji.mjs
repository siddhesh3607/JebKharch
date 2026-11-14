import 'dotenv/config';
import fs from 'node:fs';
import {ethers} from 'ethers';
import {connect,signedPayment} from '../lib/chain.mjs';
const c=await connect();
if((await c.provider.getNetwork()).chainId!==43113n)throw Error('Fuji only');
const state=await(await fetch('http://127.0.0.1:3000/api/state')).json();
if(state.busy)throw Error('Wait for the running demo to finish');
const paid=state.ledger.filter(e=>e.status==='paid');
const blocked=state.ledger.find(e=>e.reason==='RecipientNotAllowed');
if(paid.length!==3||!blocked?.tx||state.balance!=='7.0'||state.remaining!=='2.0')throw Error('Unexpected demo outcome: '+JSON.stringify(state));
for(const e of [...paid,blocked]){const r=await c.provider.getTransactionReceipt(e.tx);if(r.status!==(e===blocked?0:1))throw Error('Receipt status mismatch');}
const owner=new ethers.NonceManager(new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY,c.provider));
const wallet=c.wallet.connect(owner);
const revoke=await wallet.revoke(c.session.address);await revoke.wait();
const args=await signedPayment(c,c.vendors[0],1n,ethers.hexlify(ethers.randomBytes(32)));
const denied=await c.wallet.execute(...args,{gasLimit:300000});try{await denied.wait();throw Error('Revoked session unexpectedly paid');}catch(e){if((await c.provider.getTransactionReceipt(denied.hash))?.status!==0)throw e;}
let reason;try{await c.wallet.execute.staticCall(...args);}catch(e){reason=e.revert?.name;}
if(reason!=='SessionInactive')throw Error('Unexpected revoke reason '+reason);
// Restore access for the user's next demo; rolling spend deliberately stays at 3 jUSD.
const now=(await c.provider.getBlock('latest')).timestamp;
const renewal=await wallet.grantSession(c.session.address,1000000,5000000,now+86400,c.vendors);await renewal.wait();
const evidence={network:'Avalanche Fuji',chainId:43113,wallet:c.wallet.target,token:c.token.target,verifiedAt:new Date().toISOString(),payments:paid,blockedDrain:blocked,revokeTx:revoke.hash,revokedPaymentTx:denied.hash,revokedReason:reason,renewalTx:renewal.hash,finalBalance:'7 jUSD',remaining24h:'2 jUSD',note:'Session renewed for use; renewal preserves rolling spend. Demo uses deterministic harness and custom HTTP 402, not live Claude or official USDC.'};
fs.writeFileSync('data/fuji-verification.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
