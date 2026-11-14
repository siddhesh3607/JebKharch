import {test} from 'node:test';import assert from 'node:assert/strict';import {ethers} from 'ethers';
import {connect,signedPayment,types} from '../lib/chain.mjs';import {compile} from '../scripts/compile.mjs';
const id=()=>ethers.hexlify(ethers.randomBytes(32));
test('payment signatures cannot cross wallet contracts or chain domains',async()=>{
 const c=await connect({network:'local'});const a=compile();const second=await new ethers.ContractFactory(a.AgentWallet.abi,a.AgentWallet.bytecode,c.owner).deploy(c.token.target);await second.waitForDeployment();const block=await c.provider.getBlock('latest');
 await(await second.grantSession(c.session.address,1000000,5000000,block.timestamp+86400,c.vendors)).wait();
 const args=await signedPayment(c,c.vendors[0],1000000n,id());await assert.rejects(second.execute.staticCall(...args),/InvalidSignature/);
 const policy=await c.wallet.policies(c.session.address);const wrong=await c.session.signTypedData({name:'JebKharch',version:'1',chainId:999999,verifyingContract:c.wallet.target},types,{session:args[0],recipient:args[1],amount:args[2],nonce:args[3],requestId:args[4],generation:policy.generation});args[5]=wrong;
 await assert.rejects(c.wallet.execute.staticCall(...args),/InvalidSignature/);
});
test('renewal invalidates previously signed calls and removes old recipients',async()=>{
 const c=await connect({network:'local'});const old=await signedPayment(c,c.vendors[1],1n,id());const block=await c.provider.getBlock('latest');
 await(await c.wallet.grantSession(c.session.address,1000000,5000000,block.timestamp+86400,[c.vendors[1]])).wait();
 assert.equal(await c.wallet.isAllowed(c.session.address,c.vendors[0]),false);assert.equal(await c.wallet.isAllowed(c.session.address,c.vendors[1]),true);
 await assert.rejects(c.wallet.execute.staticCall(...old),/InvalidSignature/);
 const fresh=await signedPayment(c,c.vendors[1],1n,id());await(await c.wallet.execute(...fresh)).wait();assert.equal(await c.wallet.nonces(c.session.address),1n);
 const outsider=await c.provider.getSigner(4);await assert.rejects(c.wallet.connect(outsider).grantSession.staticCall(c.session.address,1,1,block.timestamp+86400,c.vendors),/OwnerOnly/);
});
test('failed token transfer rolls back nonce and rolling spend',async()=>{
 const c=await connect({network:'local'});await(await c.wallet.withdraw(await c.owner.getAddress(),10000000n)).wait();const args=await signedPayment(c,c.vendors[0],1000000n,id());
 const tx=await c.wallet.execute(...args,{gasLimit:500000});await assert.rejects(tx.wait());
 assert.equal((await c.provider.getTransactionReceipt(tx.hash)).status,0);assert.equal(await c.wallet.nonces(c.session.address),0n);assert.equal(await c.wallet.spent24h(c.session.address),0n);assert.equal(await c.token.balanceOf(c.vendors[0]),0n);
 await assert.rejects(c.wallet.execute.staticCall(...await signedPayment(c,c.vendors[0],0n,id())),/PerCallExceeded/);
});
