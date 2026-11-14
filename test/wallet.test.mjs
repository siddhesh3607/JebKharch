import {test} from 'node:test';import assert from 'node:assert/strict';import {ethers} from 'ethers';import {connect,signedPayment} from '../lib/chain.mjs';
test('wallet enforces policies, signed intent, rolling spend, and revocation',async()=>{
 const c=await connect({network:'local'});const id=()=>ethers.hexlify(ethers.randomBytes(32));const args=await signedPayment(c,c.vendors[0],1000000n,id());
 await(await c.wallet.execute(...args)).wait();assert.equal(await c.wallet.spent24h(c.session.address),1000000n);
 await assert.rejects(c.wallet.execute.staticCall(...args),/InvalidNonce/);
 const check=async(recipient,amount,reason)=>{const a=await signedPayment(c,recipient,amount,id());await assert.rejects(c.wallet.execute.staticCall(...a),new RegExp(reason));};
 await check(ethers.Wallet.createRandom().address,1n,'RecipientNotAllowed');await check(c.vendors[0],1000001n,'PerCallExceeded');
 const bad=await signedPayment(c,c.vendors[0],1n,id());bad[2]=2n;await assert.rejects(c.wallet.execute.staticCall(...bad),/InvalidSignature/);
 const outsider=await c.provider.getSigner(4);await assert.rejects(c.wallet.connect(outsider).revoke.staticCall(c.session.address),/OwnerOnly/);
 for(let i=0;i<4;i++)await(await c.wallet.execute(...await signedPayment(c,c.vendors[0],1000000n,id()))).wait();
 await check(c.vendors[0],1n,'DailyCapExceeded');
 await c.provider.send('evm_increaseTime',[86401]);await c.provider.send('evm_mine',[]);await check(c.vendors[0],1n,'SessionExpired');
 const now=(await c.provider.getBlock('latest')).timestamp;await(await c.wallet.grantSession(c.session.address,1000000,5000000,now+86400,[c.vendors[1]])).wait();
 assert.equal(await c.wallet.spent24h(c.session.address),0n);await check(c.vendors[0],1n,'RecipientNotAllowed');
 await(await c.wallet.execute(...await signedPayment(c,c.vendors[1],1n,id()))).wait();
 await(await c.wallet.revoke(c.session.address)).wait();await check(c.vendors[1],1n,'SessionInactive');
});
