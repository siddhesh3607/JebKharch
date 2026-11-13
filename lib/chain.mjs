import {ethers} from 'ethers';
import fs from 'node:fs';
import {compile} from '../scripts/compile.mjs';
export const types={Payment:[{name:'session',type:'address'},{name:'recipient',type:'address'},{name:'amount',type:'uint256'},{name:'nonce',type:'uint256'},{name:'requestId',type:'bytes32'},{name:'generation',type:'uint256'}]};
export async function deploy(provider,owner,session,vendors){
 const a=compile(); const token=await new ethers.ContractFactory(a.MockUSDC.abi,a.MockUSDC.bytecode,owner).deploy();await token.waitForDeployment();
 const wallet=await new ethers.ContractFactory(a.AgentWallet.abi,a.AgentWallet.bytecode,owner).deploy(await token.getAddress());await wallet.waitForDeployment();
 await (await token.transfer(await wallet.getAddress(),10000000n)).wait();
 const block=await provider.getBlock('latest');
 await (await wallet.grantSession(session.address,1000000,5000000,block.timestamp+86400,vendors)).wait();
 return {wallet,token};
}
export async function connect(){
 if(process.env.NETWORK==='fuji'){
  const provider=new ethers.JsonRpcProvider(process.env.FUJI_RPC_URL||'https://api.avax-test.network/ext/bc/C/rpc');
  if((await provider.getNetwork()).chainId!==43113n)throw Error('Expected Fuji chain ID 43113');
  const d=JSON.parse(fs.readFileSync(new URL('../data/fuji.json',import.meta.url)));
  const a=JSON.parse(fs.readFileSync(new URL('../artifacts/contracts.json',import.meta.url)));
  if(!process.env.SESSION_PRIVATE_KEY)throw Error('Set SESSION_PRIVATE_KEY in .env');
  const session=new ethers.Wallet(process.env.SESSION_PRIVATE_KEY,provider);
  return {provider,session,vendors:d.vendors,wallet:new ethers.Contract(d.wallet,a.AgentWallet.abi,session),token:new ethers.Contract(d.token,a.MockUSDC.abi,provider),network:'Fuji',owner:null};
 }
 const ganache=(await import('ganache')).default;
 const rpc=ganache.provider({logging:{quiet:true},chain:{chainId:1337,hardfork:'shanghai'},wallet:{totalAccounts:5}});
 const provider=new ethers.BrowserProvider(rpc,undefined,{cacheTimeout:-1});provider.pollingInterval=50;
 const accounts=Object.values(rpc.getInitialAccounts());
 const owner=await provider.getSigner(0);const session=new ethers.Wallet(accounts[1].secretKey,provider);
 const vendors=[await (await provider.getSigner(2)).getAddress(),await (await provider.getSigner(3)).getAddress()];
 return {provider,owner:new ethers.Wallet(accounts[0].secretKey,provider),session,vendors,...await deploy(provider,owner,session,vendors),network:'Local EVM'};
}
export async function signedPayment(c,recipient,amount,requestId){
 const key=c.session.address;const nonce=await c.wallet.nonces(key);const p=await c.wallet.policies(key);
 const domain={name:'JebKharch',version:'1',chainId:(await c.provider.getNetwork()).chainId,verifyingContract:await c.wallet.getAddress()};
 const value={session:key,recipient,amount,nonce,requestId,generation:p.generation};
 const sig=await c.session.signTypedData(domain,types,value);
 return [key,recipient,amount,nonce,requestId,sig];
}
