import fs from 'node:fs';import {fileURLToPath} from 'node:url';import sharp from 'sharp';
const root=new URL('../public/assets/',import.meta.url);
const icon=fs.readFileSync(new URL('jebkharch-icon.svg',root),'utf8');
const inner=icon.slice(icon.indexOf('<rect'),icon.lastIndexOf('</svg>'));
const wordmark=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400" viewBox="0 0 1600 400"><title>JebKharch — pocket money for AI agents</title><g transform="translate(24 24) scale(.6875)">${inner}</g><text x="430" y="210" fill="#18171C" font-family="Arial,Helvetica,sans-serif" font-size="164" font-weight="800" letter-spacing="-8">JebKharch</text><text x="438" y="282" fill="#7044FF" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700" letter-spacing="5">POCKET MONEY FOR AI AGENTS</text></svg>`;
fs.writeFileSync(new URL('jebkharch-logo.svg',root),wordmark);
await sharp(Buffer.from(icon)).resize(1024,1024).png().toFile(fileURLToPath(new URL('jebkharch-icon.png',root)));
await sharp(Buffer.from(wordmark)).resize(2400,600).png().toFile(fileURLToPath(new URL('jebkharch-logo.png',root)));
for(const size of [32,180,192,512])await sharp(Buffer.from(icon)).resize(size,size).png().toFile(fileURLToPath(new URL(`icon-${size}.png`,root)));
const light=wordmark.replace('<title>','<rect width="1600" height="400" fill="#F3F0E7"/><title>');
const dark=wordmark.replace('<title>','<rect width="1600" height="400" fill="#18171C"/><title>').replace('fill="#18171C" font-family','fill="#F3F0E7" font-family').replace('fill="#7044FF" font-family','fill="#DCFA52" font-family');
for(const [name,svg] of [['light',light],['dark',dark]]){fs.writeFileSync(new URL(`jebkharch-logo-${name}.svg`,root),svg);await sharp(Buffer.from(svg)).resize(2400,600).png().toFile(fileURLToPath(new URL(`jebkharch-logo-${name}.png`,root)));}
console.log('SVG and PNG logo assets generated.');
