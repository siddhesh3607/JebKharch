export const paymentTypes={Payment:[{name:'session',type:'address'},{name:'recipient',type:'address'},{name:'amount',type:'uint256'},{name:'nonce',type:'uint256'},{name:'requestId',type:'bytes32'},{name:'generation',type:'uint256'}]};
export class BrowserDemo {
 constructor({ethers,provider,config,meta,onSave=()=>{},onEvent=()=>{}}){this.E=ethers;this.provider=provider;this.config=config;this.meta={...meta};this.onSave=onSave;this.onEvent=onEvent;this.session=null;this.relayer=null;}
 wallet(signer=this.provider){return new this.E.Contract(this.meta.wallet,this.config.contracts.AgentWallet.abi,signer);}
 token(signer=this.provider){return new this.E.Contract(this.meta.token,this.config.contracts.MockUSDC.abi,signer);}
 event(row){const e={time:new Date().toISOString(),...row};this.onEvent(e);return e;}
 save(){this.onSave({...this.meta},this.session?.privateKey);}
 setKey(key){if(!key)return;const session=new this.E.Wallet(key,this.provider);if(this.meta.session&&session.address.toLowerCase()!==this.meta.session.toLowerCase())throw Error('Saved session key does not match this wallet');this.session=session;this.relayer=new this.E.NonceManager(session);}
 ensureKey(){if(!this.session){const generated=this.E.Wallet.createRandom();this.meta.session=generated.address;this.setKey(generated.privateKey);this.save();}}
 async ensureChain(){if(Number((await this.provider.getNetwork()).chainId)!==this.config.chainId)throw Error('Wrong chain. Use Avalanche Fuji.');}
 async confirm(tx,label){await tx.wait();this.event({status:'info',label,tx:tx.hash});return tx.hash;}
 async requireOwner(signer){await this.ensureChain();if(Number((await signer.provider.getNetwork()).chainId)!==this.config.chainId)throw Error('Switch the signing wallet to Fuji.');if((await signer.getAddress()).toLowerCase()!==(await this.wallet().owner()).toLowerCase())throw Error('Connect the owner account for this wallet.');if((await this.wallet().asset()).toLowerCase()!==this.meta.token.toLowerCase())throw Error('Saved token does not match this policy wallet.');}
 async create(signer,progress=()=>{}){
  await this.ensureChain();const owner=await signer.getAddress();this.meta.owner=owner;this.meta.reference=false;this.meta.chainId=this.config.chainId;
  if(!this.meta.token){progress('1/5 · Deploy demo jUSD. Confirm in your wallet.');const t=await new this.E.ContractFactory(this.config.contracts.MockUSDC.abi,this.config.contracts.MockUSDC.bytecode,signer).deploy();await t.waitForDeployment();this.meta.token=await t.getAddress();this.save();this.event({status:'info',label:'Demo jUSD deployed',tx:t.deploymentTransaction().hash});}
  if(!this.meta.wallet){progress('2/5 · Deploy your policy wallet. Confirm in your wallet.');const w=await new this.E.ContractFactory(this.config.contracts.AgentWallet.abi,this.config.contracts.AgentWallet.bytecode,signer).deploy(this.meta.token);await w.waitForDeployment();this.meta.wallet=await w.getAddress();this.save();this.event({status:'info',label:'Owner policy wallet deployed',tx:w.deploymentTransaction().hash});}
  progress('3–5/5 · Fund the wallet, fund session gas, and grant its policy.');await this.prepare(signer,progress);return {...this.meta};
 }
 async snapshot(){const w=this.wallet(),t=this.token();const [p,spent,balance,owner,gas]=await Promise.all([w.policies(this.meta.session),w.spent24h(this.meta.session),t.balanceOf(this.meta.wallet),w.owner(),this.provider.getBalance(this.meta.session)]);return {balance:this.E.formatUnits(balance,6),remaining:this.E.formatUnits(p.daily>spent?p.daily-spent:0n,6),spent:this.E.formatUnits(spent,6),perCall:this.E.formatUnits(p.perCall,6),daily:this.E.formatUnits(p.daily,6),active:p.active,expires:Number(p.expires),owner,gas:this.E.formatEther(gas),allowed:await Promise.all(this.config.vendors.map(v=>w.isAllowed(this.meta.session,v)))};}
 async grant(signer,{perCall,daily,hours,recipients}){
  await this.requireOwner(signer);if(!Array.isArray(recipients)||!recipients.length||recipients.length>32||recipients.some(v=>!this.E.isAddress(v)||v===this.E.ZeroAddress))throw Error('Provide 1–32 valid recipients.');
  const per=this.E.parseUnits(String(perCall),6),cap=this.E.parseUnits(String(daily),6),duration=Number(hours);if(per<=0n||cap<per||!Number.isFinite(duration)||duration<=0||duration>720)throw Error('Use a positive per-call cap, a larger daily cap, and an expiry up to 720 hours.');
  this.ensureKey();const block=await this.provider.getBlock('latest');return this.confirm(await this.wallet(signer).grantSession(this.meta.session,per,cap,block.timestamp+Math.ceil(duration*3600),recipients),'Session policy confirmed');
 }
 async prepare(signer,progress=()=>{}){
  await this.requireOwner(signer);this.meta.owner=await signer.getAddress();this.meta.reference=false;this.ensureKey();const balance=await this.token().balanceOf(this.meta.wallet);
  if(balance<10000000n){progress('Deposit demo tokens. Confirm in your wallet.');await this.confirm(await this.token(signer).transfer(this.meta.wallet,10000000n-balance),'Demo wallet funded to 10 jUSD');}
  if(await this.provider.getBalance(this.meta.session)<this.E.parseEther('0.0005')){progress('Fund the limited session with 0.002 test AVAX for gas.');await this.confirm(await signer.sendTransaction({to:this.meta.session,value:this.E.parseEther('0.002')}),'Session gas funded');}
  const spent=await this.wallet().spent24h(this.meta.session);progress('Grant 1 jUSD per call, 5 jUSD available allowance, 24-hour expiry.');return this.grant(signer,{perCall:'1',daily:this.E.formatUnits(spent+5000000n,6),hours:24,recipients:this.config.vendors});
 }
 async revoke(signer){await this.requireOwner(signer);return this.confirm(await this.wallet(signer).revoke(this.meta.session),'Session revoked on-chain');}
 async fund(signer,amount){await this.ensureChain();const n=this.E.parseUnits(amount,6);if(n<=0n)throw Error('Use a positive amount.');return this.confirm(await this.token(signer).transfer(this.meta.wallet,n),'Wallet deposit confirmed');}
 async withdraw(signer,recipient,amount){await this.requireOwner(signer);const n=this.E.parseUnits(amount,6);if(n<=0n||!this.E.isAddress(recipient)||recipient===this.E.ZeroAddress)throw Error('Use a valid recipient and positive amount.');return this.confirm(await this.wallet(signer).withdraw(recipient,n),'Owner withdrawal confirmed');}
 async gas(signer,amount){await this.ensureChain();const n=this.E.parseEther(amount);if(n<=0n||n>this.E.parseEther('0.05'))throw Error('Use 0–0.05 test AVAX.');return this.confirm(await signer.sendTransaction({to:this.meta.session,value:n}),'Session gas top-up confirmed');}
 async pay(recipient,amount,requestId,label){
  if(!this.session)throw Error('No session key in this tab. The owner must renew the session.');await this.ensureChain();const w=this.wallet();const nonce=await w.nonces(this.meta.session);const p=await w.policies(this.meta.session);
  const sig=await this.session.signTypedData({name:'JebKharch',version:'1',chainId:this.config.chainId,verifyingContract:this.meta.wallet},paymentTypes,{session:this.meta.session,recipient,amount,nonce,requestId,generation:p.generation});const args=[this.meta.session,recipient,amount,nonce,requestId,sig];let tx;
  try{tx=await this.wallet(this.relayer).execute(...args,{gasLimit:500000});await tx.wait();return this.event({status:'paid',label,amount:Number(amount)/1e6,recipient,tx:tx.hash});}
  catch(e){if(!tx)this.relayer.reset();let reason=e.shortMessage||'Payment rejected';try{await w.execute.staticCall(...args);}catch(simulation){reason=simulation.revert?.name||simulation.shortMessage||reason;}return this.event({status:'blocked',label,amount:Number(amount)/1e6,recipient,tx:tx?.hash,reason});}
 }
 async buy(vendor,poison,{fetchImpl=fetch,base=''}={}){
  const params=new URLSearchParams({vendor:String(vendor),wallet:this.meta.wallet,session:this.meta.session,poison:poison?'1':'0'});const r=await fetchImpl(`${base}/api/vendor?${params}`);const q=await r.json();if(r.status!==402)throw Error(q.error||'Vendor did not provide a payment quote');
  if(q.chainId!==this.config.chainId||q.wallet?.toLowerCase()!==this.meta.wallet.toLowerCase()||q.asset?.toLowerCase()!==this.meta.token.toLowerCase()||q.session?.toLowerCase()!==this.meta.session.toLowerCase()||q.recipient?.toLowerCase()!==this.config.vendors[vendor].toLowerCase()||q.amount!=='1000000'||!this.E.isHexString(q.requestId,32))throw Error('Vendor quote does not match this wallet policy request');
  const paid=await this.pay(q.recipient,1000000n,q.requestId,`Vendor ${vendor+1} API call`);if(paid.status!=='paid')return {error:paid.reason};
  const response=await fetchImpl(`${base}/api/vendor`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({quote:q,tx:paid.tx})});const data=await response.json();if(!response.ok)throw Error(data.error||'Vendor receipt verification failed');return data;
 }
}
