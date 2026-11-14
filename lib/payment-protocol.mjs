import {ethers} from 'ethers';
export const CHAIN_ID=43113;
export const RPC_URL='https://api.avax-test.network/ext/bc/C/rpc';
export const VENDORS=['0x179BDDFf15C49093145a96E404F0A3Eaf0b6986F','0x34787d6b12d704be1076f3ceA27762066d210ae7'];
export const PAYMENT_AMOUNT=1000000n;
export const walletInterface=new ethers.Interface(['function asset() view returns(address)','event Paid(address indexed session,address indexed recipient,uint256 amount,uint256 nonce,bytes32 indexed requestId)']);
export const tokenInterface=new ethers.Interface(['event Transfer(address indexed from,address indexed to,uint256 value)']);
export function quoteId(q){return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['uint256','address','address','address','address','uint256','uint256','bytes32','uint256','bool'],[CHAIN_ID,q.wallet,q.session,q.asset,q.recipient,q.amount,q.vendor,q.nonce,q.expires,q.poison]));}
export function validateQuote(q,now=Math.floor(Date.now()/1000)){
 if(!q||![0,1].includes(q.vendor)||typeof q.poison!=='boolean'||q.chainId!==CHAIN_ID||!Number.isSafeInteger(q.expires)||q.expires<=now||q.expires>now+300)throw Error('Invalid or expired quote');
 for(const field of ['wallet','session','asset','recipient'])if(!ethers.isAddress(q[field])||q[field]===ethers.ZeroAddress)throw Error('Invalid quote address');
 if(q.recipient.toLowerCase()!==VENDORS[q.vendor].toLowerCase()||q.amount!=='1000000'||!ethers.isHexString(q.nonce,32)||q.requestId!==quoteId(q))throw Error('Quote fields do not match the payment request');
 return q;
}
export function receiptMatches(receipt,q){
 if(!receipt||receipt.status!==1)return false;
 let paid=false,transferred=false;
 for(const l of receipt.logs){try{
  if(l.address.toLowerCase()===q.wallet.toLowerCase()){const e=walletInterface.parseLog(l);if(e?.name==='Paid'&&e.args.session.toLowerCase()===q.session.toLowerCase()&&e.args.recipient.toLowerCase()===q.recipient.toLowerCase()&&e.args.amount===PAYMENT_AMOUNT&&e.args.requestId===q.requestId)paid=true;}
  if(l.address.toLowerCase()===q.asset.toLowerCase()){const e=tokenInterface.parseLog(l);if(e?.name==='Transfer'&&e.args.from.toLowerCase()===q.wallet.toLowerCase()&&e.args.to.toLowerCase()===q.recipient.toLowerCase()&&e.args.value===PAYMENT_AMOUNT)transferred=true;}
 }catch{}}
 return paid&&transferred;
}
