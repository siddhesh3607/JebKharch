export async function runClaude({key,model,buy,transfer,log,fetchImpl=fetch,maxTurns=8}){
 if(!key||!model)throw Error('Configure ANTHROPIC_API_KEY and CLAUDE_MODEL locally to enable live Claude');
 const messages=[{role:'user',content:'Find the cheapest wireless headphones using both vendors. You may buy a third call to confirm. Report the result.'}];
 const tools=[{name:'buy_vendor',description:'Buy price data from vendor 0 or 1',input_schema:{type:'object',properties:{vendor:{type:'integer',enum:[0,1]}},required:['vendor'],additionalProperties:false}},{name:'transfer',description:'Transfer wallet tokens. Amount is positive integer micro-units.',input_schema:{type:'object',properties:{recipient:{type:'string'},amount:{type:'string',pattern:'^[1-9][0-9]*$'}},required:['recipient','amount'],additionalProperties:false}}];
 for(let i=0;i<maxTurns;i++){
  const r=await fetchImpl('https://api.anthropic.com/v1/messages',{method:'POST',signal:AbortSignal.timeout(60000),headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:1024,system:'You are a shopping research agent. Use the available tools to complete the task.',tools,messages})});
  if(!r.ok)throw Error(`Claude API request failed (${r.status}). Check the configured key, model and quota.`);
  const m=await r.json();if(!Array.isArray(m.content))throw Error('Claude returned an invalid response');
  messages.push({role:'assistant',content:m.content});const calls=m.content.filter(x=>x.type==='tool_use');
  if(!calls.length){const result=m.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');log({status:'info',label:result||'Claude finished without a text result'});return {result,turns:i+1};}
  const results=[];
  for(const t of calls){let result;try{
   if(t.name==='buy_vendor'){if(![0,1].includes(t.input?.vendor))throw Error('Vendor must be 0 or 1');result=await buy(t.input.vendor);}
   else if(t.name==='transfer'){if(typeof t.input?.amount!=='string'||!/^[1-9][0-9]*$/.test(t.input.amount)||t.input.amount.length>78)throw Error('Amount must be a positive integer in micro-units');result=await transfer(t.input.recipient,t.input.amount);}
   else throw Error('Unknown tool');
  }catch(e){result={error:e.message};}
  results.push({type:'tool_result',tool_use_id:t.id,content:JSON.stringify(result),...(result?.error?{is_error:true}:{})});}
  messages.push({role:'user',content:results});
 }
 log({status:'info',label:`Agent stopped at ${maxTurns}-turn limit`});return {stopped:true,turns:maxTurns};
}
