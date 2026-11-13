import fs from 'node:fs';
import solc from 'solc';
export function compile(){
 const sources=Object.fromEntries(['AgentWallet','MockUSDC'].map(n=>[`contracts/${n}.sol`,{content:fs.readFileSync(new URL(`../contracts/${n}.sol`,import.meta.url),'utf8')}]));
 const out=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources,settings:{optimizer:{enabled:true,runs:200},evmVersion:'shanghai',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}}),{import:p=>{try{return {contents:fs.readFileSync(new URL(`../node_modules/${p}`,import.meta.url),'utf8')}}catch{return {error:p}}}}));
 const errors=out.errors?.filter(e=>e.severity==='error');if(errors?.length)throw Error(errors.map(e=>e.formattedMessage).join('\n'));
 const artifacts={};for(const n of ['AgentWallet','MockUSDC']){const c=out.contracts[`contracts/${n}.sol`][n];artifacts[n]={abi:c.abi,bytecode:'0x'+c.evm.bytecode.object};}
 fs.mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../artifacts/contracts.json',import.meta.url),JSON.stringify(artifacts,null,2));return artifacts;
}
if(process.argv[1]?.endsWith('compile.mjs')){compile();console.log('Contracts compiled.');}
