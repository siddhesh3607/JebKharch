import 'dotenv/config';import fs from 'node:fs';import {ethers} from 'ethers';
const fuji=process.env.NETWORK==='fuji';
console.log('JebKharch diagnostics');console.log('Network:',fuji?'Fuji':'Local EVM');
console.log('Claude:',process.env.ANTHROPIC_API_KEY&&process.env.CLAUDE_MODEL?'configured (not authenticated by this check)':'optional; API key/model not configured');
if(fuji){
 const p=new ethers.JsonRpcProvider(process.env.FUJI_RPC_URL||'https://api.avax-test.network/ext/bc/C/rpc');
 if((await p.getNetwork()).chainId!==43113n)throw Error('RPC is not Fuji');
 if(!fs.existsSync('data/fuji.json'))throw Error('Deployment config missing; run npm run deploy:fuji first');
 const d=JSON.parse(fs.readFileSync('data/fuji.json'));
 if(!process.env.SESSION_PRIVATE_KEY)throw Error('SESSION_PRIVATE_KEY is missing');
 const session=new ethers.Wallet(process.env.SESSION_PRIVATE_KEY);
 if(session.address.toLowerCase()!==d.session.toLowerCase())throw Error('Session key does not match saved deployment');
 if(await p.getCode(d.wallet)==='0x')throw Error('Wallet bytecode not found on Fuji');
 console.log('Wallet:',d.wallet);console.log('Session gas:',ethers.formatEther(await p.getBalance(session.address)),'test AVAX');
 console.log('Local test owner:',process.env.ENABLE_LOCAL_TEST_OWNER==='true'?'enabled':'disabled; browser owner required');
}else console.log('Local EVM creates funded demo accounts automatically.');
console.log('Check passed. Start with npm start.');
