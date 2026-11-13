export const FUJI={chainId:'0xa869',chainName:'Avalanche Fuji',nativeCurrency:{name:'AVAX',symbol:'AVAX',decimals:18},rpcUrls:['https://api.avax-test.network/ext/bc/C/rpc'],blockExplorerUrls:['https://build.avax.network/explorer/fuji/c-chain']};
export async function switchToFuji(provider){
 if(!provider?.request)throw Error('No wallet extension detected. Open this dashboard in Chrome or Edge with MetaMask/Core installed, or use Local test owner.');
 if(Number(await provider.request({method:'eth_chainId'}))!==43113){
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:FUJI.chainId}]});}
  catch(e){if(e.code!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[FUJI]});await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:FUJI.chainId}]});}
 }
 const chain=Number(await provider.request({method:'eth_chainId'}));if(chain!==43113)throw Error('Wallet did not switch to Avalanche Fuji');return chain;
}
