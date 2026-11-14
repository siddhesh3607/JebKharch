import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
export const localURL=process.env.LOCAL_AI_URL||'http://127.0.0.1:8087';
export async function localReady(){try{const r=await fetch(localURL+'/health',{signal:AbortSignal.timeout(1000)});return r.ok;}catch{return false;}}
export async function startLocalAI(){
 if(process.env.DISABLE_LOCAL_AI==='true')return null;
 if(await localReady())return null;
 const bin=path.resolve('runtime/llama/llama-server.exe'),model=path.resolve('runtime/qwen2.5-0.5b-instruct-q4_k_m.gguf');
 if(!fs.existsSync(bin)||!fs.existsSync(model))return null;
 const stdout=fs.openSync(path.resolve('runtime/local-ai.log'),'a');
 const child=spawn(bin,['-m',model,'--host','127.0.0.1','--port','8087','-c','2048','-t','3','--parallel','1','--no-ui','--cors-origins','localhost','--no-cors-credentials'],{stdio:['ignore',stdout,stdout],windowsHide:true});
 fs.closeSync(stdout);child.on('error',e=>console.error('Local AI startup failed:',e.message));
 const stop=()=>{if(child.exitCode===null)child.kill();};process.on('exit',stop);process.once('SIGINT',()=>{stop();process.exit(0);});process.once('SIGTERM',()=>{stop();process.exit(0);});
 return child;
}
export async function analyzeQuotes(quotes,{fetchImpl=fetch}={}){
 const safe=quotes.filter(q=>Number.isFinite(q.price)).map(q=>({vendor:q.vendor,product:q.product,price:q.price,currency:q.currency}));
 if(!safe.length)throw Error('No paid quotes available for local AI analysis');
 const ranked=[...safe].sort((a,b)=>a.price-b.price);const winner=ranked[0];const next=ranked.find(q=>q.vendor!==winner.vendor);const savings=next?next.price-winner.price:0;
 const facts=ranked.filter((q,i,a)=>a.findIndex(v=>v.vendor===q.vendor)===i).map(q=>`${q.vendor} offers INR ${q.price}.`).join(' ');
 const r=await fetchImpl(localURL+'/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(120000),headers:{'content-type':'application/json'},body:JSON.stringify({model:'local-qwen',temperature:0,max_tokens:140,messages:[{role:'system',content:'You are a shopping assistant. Respond to the user in two clear sentences using exactly the facts provided.'},{role:'user',content:`Write a recommendation for wireless headphones. Verified facts: ${facts} ${winner.vendor} is the cheapest and saves INR ${savings}. State the winning vendor and price, then the saving.`}]})});
 if(!r.ok)throw Error('Local AI API failed ('+r.status+'). Check runtime/local-ai.log');const data=await r.json();const explanation=data.choices?.[0]?.message?.content;if(!explanation)throw Error('Local model returned no answer');const validated=explanation.includes(winner.vendor)&&explanation.includes(String(winner.price));
 const answer=validated?explanation:`Verified cheapest: ${winner.vendor}, INR ${winner.price}. The local model explanation did not match these facts and was withheld.`;
 return {answer,winner,savings,explanationValidated:validated,model:'Qwen2.5-0.5B-Instruct (local CPU)',quotes:safe};
}
