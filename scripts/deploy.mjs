import 'dotenv/config';import fs from 'node:fs';import {ethers} from 'ethers';import {deploy} from '../lib/chain.mjs';
if(!process.env.DEPLOYER_PRIVATE_KEY||!process.env.SESSION_PRIVATE_KEY)throw Error('Set DEPLOYER_PRIVATE_KEY and SESSION_PRIVATE_KEY locally in .env. Never share them in chat.');
const provider=new ethers.JsonRpcProvider(process.env.FUJI_RPC_URL||'https://api.avax-test.network/ext/bc/C/rpc');
if((await provider.getNetwork()).chainId!==43113n)throw Error('Refusing deployment outside Fuji');
const owner=new ethers.NonceManager(new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY,provider));
const session=new ethers.Wallet(process.env.SESSION_PRIVATE_KEY,provider);
const vendors=[process.env.VENDOR_A,process.env.VENDOR_B];if(vendors.some(x=>!ethers.isAddress(x)))throw Error('Set VENDOR_A and VENDOR_B addresses');
if(fs.existsSync('data/fuji.json'))throw Error('Fuji deployment already recorded; refusing duplicate deployment');
const ownerAddress=await owner.getAddress();
const ownerBalance=await provider.getBalance(ownerAddress);
if(ownerBalance<ethers.parseEther('0.1'))throw Error(`Fund ${ownerAddress} with at least 0.1 Fuji test AVAX before deploying. Current balance: ${ethers.formatEther(ownerBalance)}`);
if(await provider.getBalance(session.address)<ethers.parseEther('0.01')) {
 console.log('Funding session gas with 0.02 test AVAX');
 await(await owner.sendTransaction({to:session.address,value:ethers.parseEther('0.02')})).wait();
}
const {wallet,token}=await deploy(provider,owner,session,vendors);
fs.mkdirSync('data',{recursive:true});const d={chainId:43113,wallet:await wallet.getAddress(),token:await token.getAddress(),session:session.address,vendors,deployedAt:new Date().toISOString()};
fs.writeFileSync('data/fuji.json',JSON.stringify(d,null,2));console.log(d);console.log('Demo jUSD deployed, not official USDC. Fund session with test AVAX for gas. Start with NETWORK=fuji.');
