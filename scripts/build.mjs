import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {compile} from './compile.mjs';
export function build(){
 const root=fileURLToPath(new URL('../',import.meta.url));const dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});fs.cpSync(path.join(root,'public'),dist,{recursive:true});
 fs.mkdirSync(path.join(dist,'vendor'),{recursive:true});fs.copyFileSync(path.join(root,'node_modules/ethers/dist/ethers.umd.min.js'),path.join(dist,'vendor/ethers.js'));
 const reference=JSON.parse(fs.readFileSync(path.join(root,'deployment/fuji.json')));const evidence=JSON.parse(fs.readFileSync(path.join(root,'deployment/fuji-verification.json')));
 const config={chainId:43113,rpcUrl:'https://api.avax-test.network/ext/bc/C/rpc',reference,vendors:reference.vendors,contracts:compile(),evidence:[...evidence.payments,evidence.blockedDrain,{status:'info',label:'Verified owner revocation',tx:evidence.revokeTx,time:evidence.verifiedAt},{status:'blocked',label:'Verified revoked-key payment',reason:evidence.revokedReason,tx:evidence.revokedPaymentTx,time:evidence.verifiedAt}].map(e=>({...e,reference:true}))};
 fs.writeFileSync(path.join(dist,'config.json'),JSON.stringify(config));console.log('Built JebKharch dashboard, contract deployment artifacts and browser ethers bundle. No keys or runtime models included.');return dist;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build();
